import { IsDate } from 'class-validator';
import { Type } from 'class-transformer';

export class SummaryQueryDto {
  @IsDate()
  @Type(() => Date)
  from!: Date;

  @IsDate()
  @Type(() => Date)
  to!: Date;
}
