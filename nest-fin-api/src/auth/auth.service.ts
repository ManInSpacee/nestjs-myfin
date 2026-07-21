import { JwtService } from '@nestjs/jwt';
import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { RegisterUserDto } from './dto/register.dto';
import argon2 from 'argon2';
import { LoginDto } from './dto/login.dto';
import type { StringValue } from 'ms';

@Injectable()
export class AuthService {
  constructor(
    private prismaService: PrismaService,
    private jwtService: JwtService,
  ) {}

  async register(dto: RegisterUserDto) {
    try {
      const hashedPassword = await argon2.hash(dto.password, {
        type: argon2.argon2id,
        memoryCost: 65536,
        timeCost: 3,
        parallelism: 4,
      });
      const registeredUser = await this.prismaService.user.create({
        data: {
          email: dto.email,
          passwordHash: hashedPassword,
        },
      });
      return {
        id: registeredUser.id,
        email: registeredUser.email,
        createdAt: registeredUser.createdAt,
      };
    } catch (e: any) {
      if (e.code === 'P2002') {
        throw new ConflictException('Email already in use');
      }
      throw e;
    }
  }

  async login(dto: LoginDto) {
    const user = await this.prismaService.user.findUnique({
      where: { email: dto.email },
    });
    if (!user) throw new UnauthorizedException('Invalid Credentials');
    const ok = await argon2.verify(user.passwordHash, dto.password);
    if (!ok) throw new UnauthorizedException('Invalid Credentials');
    const tokens = await this.issueTokens(user.id);
    return tokens;
  }

  private async issueTokens(userId: string) {
    const payload = { sub: userId };
    const access_token = this.jwtService.sign(payload);
    const refresh_token = this.jwtService.sign(payload, {
      secret: process.env.JWT_REFRESH_SECRET,
      expiresIn: (process.env.JWT_REFRESH_TTL ?? '7d') as StringValue,
    });
    const refreshHash = await argon2.hash(refresh_token, {
      type: argon2.argon2id,
      memoryCost: 65536,
      timeCost: 3,
      parallelism: 4,
    });
    await this.prismaService.user.update({
      where: { id: userId },
      data: { refreshTokenHash: refreshHash },
    });
    return { access_token, refresh_token };
  }

  async refresh(refreshToken: string) {
    let payload: { sub: string };
    try {
      payload = this.jwtService.verify(refreshToken, {
        secret: process.env.JWT_REFRESH_SECRET,
      });
    } catch {
      throw new UnauthorizedException('Invalid refresh token');
    }
    const user = await this.prismaService.user.findUnique({
      where: {
        id: payload.sub,
      },
    });
    if (!user || !user.refreshTokenHash) {
      throw new UnauthorizedException('Invalid refresh token');
    }
    const ok = argon2.verify(user.refreshTokenHash, refreshToken);
    if (!ok) {
      await this.prismaService.user.update({
        where: { id: payload.sub },
        data: { refreshTokenHash: null },
      });
      throw new UnauthorizedException('Invalid refresh token');
    }
    const { access_token, refresh_token } = await this.issueTokens(payload.sub);
    return { access_token, refresh_token };
  }

  async logout(userId: string) {
    await this.prismaService.user.update({
      where: { id: userId },
      data: { refreshTokenHash: null },
    });
  }
}
