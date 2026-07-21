import { SummaryQueryDto } from './summaryQuery.dto';
import { PartialType } from '@nestjs/mapped-types';
import { TransactionType } from '../../../generated/prisma/enums';
import { IsEnum, IsInt, IsOptional, IsUUID, Max, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class FilterQueryDto extends PartialType(SummaryQueryDto) {
  @IsOptional()
  @IsEnum(TransactionType)
  type?: TransactionType;

  @IsOptional()
  @IsUUID()
  categoryId?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Type(() => Number)
  page?: number;
}
