import { AuthService } from 'src/auth/auth.service';
import {
  Body,
  Controller,
  Post,
  Req,
  Res,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { RegisterUserDto } from './dto/register.dto';
import type { Response, Request } from 'express';
import { LoginDto } from './dto/login.dto';
import { ApiOperation } from '@nestjs/swagger';
import { CurrentUser } from './decorators/current-user.decorator';
import { AuthGuard } from '@nestjs/passport';

@Controller('auth')
export class AuthController {
  constructor(private AuthService: AuthService) {}

  @ApiOperation({ summary: 'Зарегестрировать нового пользователя' })
  @Post('/register')
  async register(@Body() data: RegisterUserDto) {
    return this.AuthService.register(data);
  }

  @ApiOperation({ summary: 'Войти в профиль' })
  @Post('/login')
  async login(
    @Body() data: LoginDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const { access_token, refresh_token } = await this.AuthService.login(data);
    res.cookie('refresh_token', refresh_token, {
      httpOnly: true,
      secure: false,
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000,
      path: '/auth/refresh',
    });
    return { access_token };
  }

  @ApiOperation({ summary: 'Получить новые токены' })
  @Post('/refresh')
  async refresh(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const token = req.cookies?.refresh_token;
    if (!token) throw new UnauthorizedException('Invalid refresh token');
    const { access_token, refresh_token } =
      await this.AuthService.refresh(token);
    res.cookie('refresh_token', refresh_token, {
      httpOnly: true,
      secure: false,
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000,
      path: '/auth/refresh',
    });
    return { access_token };
  }

  @ApiOperation({ summary: 'Выйти из профиля' })
  @UseGuards(AuthGuard('jwt'))
  @Post('/logout')
  async logout(
    @CurrentUser('id') userId: string,
    @Res({ passthrough: true }) res: Response,
  ) {
    await this.AuthService.logout(userId);
    res.clearCookie('refresh_token', { path: '/auth/refresh' });
    return { success: true };
  }
}
