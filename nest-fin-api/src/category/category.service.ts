import { PrismaService } from './../prisma/prisma.service';
import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateCategoryDto } from './dto/createCategory.dto';
import { Prisma } from 'generated/prisma/client';
import { UpdateCategoryDto } from './dto/updateCategory.dto';

@Injectable()
export class CategoryService {
  constructor(private prismaService: PrismaService) {}

  async getAll(userId: string) {
    const categories = await this.prismaService.category.findMany({
      where: { OR: [{ userId }, { userId: null }] },
    });
    return categories;
  }

  async create(userId: string, data: CreateCategoryDto) {
    try {
      const newCategory = await this.prismaService.category.create({
        data: {
          userId,
          name: data.name,
        },
      });
      return newCategory;
    } catch (e) {
      if (
        e instanceof Prisma.PrismaClientKnownRequestError &&
        e.code === 'P2002'
      )
        throw new ConflictException('Имя категории уже занято');
      throw e;
    }
  }
  async update(userId: string, id: string, data: UpdateCategoryDto) {
    const category = await this.prismaService.category.findFirst({
      where: { id, userId },
    });
    if (!category) throw new NotFoundException();
    try {
      const updatedCategory = await this.prismaService.category.update({
        where: { id },
        data,
      });
      return updatedCategory;
    } catch (e) {
      if (
        e instanceof Prisma.PrismaClientKnownRequestError &&
        e.code === 'P2002'
      )
        throw new ConflictException('Имя категории уже занято');
    }
  }

  async delete(userId: string, id: string) {
    const result = await this.prismaService.category.deleteMany({
      where: { id, userId },
    });
    if (result.count === 0) throw new NotFoundException('Категория не найдена');
    return { success: true };
  }
}
