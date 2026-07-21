import { CategoryService } from './category.service';
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
import { CreateCategoryDto } from './dto/createCategory.dto';
import { UpdateCategoryDto } from './dto/updateCategory.dto';

@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
@Controller('categories')
export class CategoryController {
  constructor(private categoryService: CategoryService) {}

  @ApiOperation({ summary: 'Получить список категорий' })
  @Get()
  getAll(@CurrentUser('id') userId: string) {
    return this.categoryService.getAll(userId);
  }

  @ApiOperation({ summary: 'Создать новую категорию' })
  @Post()
  create(@CurrentUser('id') userId: string, @Body() data: CreateCategoryDto) {
    return this.categoryService.create(userId, data);
  }

  @ApiOperation({ summary: 'Обновить существующую категорию' })
  @Patch(':id')
  update(
    @CurrentUser('id') userId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() data: UpdateCategoryDto,
  ) {
    return this.categoryService.update(userId, id, data);
  }

  @ApiOperation({ summary: 'Удалить существующую категорию' })
  @Delete(':id')
  delete(
    @CurrentUser('id') userId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.categoryService.delete(userId, id);
  }
}
