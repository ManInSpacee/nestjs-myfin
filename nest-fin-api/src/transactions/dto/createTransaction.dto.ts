import { Type } from 'class-transformer';
import {
  IsDate,
  IsEnum,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  IsUUID,
  MaxLength,
} from 'class-validator';
import { TransactionType } from 'generated/prisma/enums';

export class CreateTransactionDto {
  @IsOptional()
  @IsDate()
  @Type(() => Date)
  transactionDate?: Date;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  description?: string;

  @IsEnum(TransactionType)
  type!: TransactionType;

  @IsNumber()
  @IsPositive()
  amount!: number;

  @IsOptional()
  @IsUUID()
  categoryId?: string;
}
