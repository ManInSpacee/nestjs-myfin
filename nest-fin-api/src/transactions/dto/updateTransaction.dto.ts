import { Type } from 'class-transformer';
import {
  IsDate,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
} from 'class-validator';

export class UpdateTransactionDto {
  @IsOptional()
  @IsDate()
  @Type(() => Date)
  transactionDate?: Date;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  description?: string;

  @IsOptional()
  @IsUUID()
  categoryId?: string;
}
