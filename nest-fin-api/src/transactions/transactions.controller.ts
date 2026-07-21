import { TransactionsService } from './transactions.service';
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth } from '@nestjs/swagger';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
import { CreateTransactionDto } from './dto/createTransaction.dto';
import { UpdateTransactionDto } from './dto/updateTransaction.dto';
import { SummaryQueryDto } from './dto/summaryQuery.dto';
import { FilterQueryDto } from './dto/filterQuery.dto';

@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
@Controller('transactions')
export class TransactionsController {
  constructor(private transactionsService: TransactionsService) {}

  @Get('summary')
  getSummary(
    @CurrentUser('id') userId: string,
    @Query() query: SummaryQueryDto,
  ) {
    return this.transactionsService.getSummary(userId, query);
  }
  @Get()
  getByFilter(
    @CurrentUser('id') userId: string,
    @Query() query: FilterQueryDto,
  ) {
    return this.transactionsService.getByFilter(userId, query);
  }

  @Get('by-category')
  getByCategories(
    @CurrentUser('id') userId: string,
    @Query() query: SummaryQueryDto,
  ) {
    return this.transactionsService.getByCategories(userId, query);
  }

  @Get(':id')
  getById(
    @CurrentUser('id') userId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.transactionsService.getById(userId, id);
  }

  @Post()
  create(
    @CurrentUser('id') userId: string,
    @Body() data: CreateTransactionDto,
  ) {
    return this.transactionsService.create(userId, data);
  }

  @Patch(':id')
  update(
    @CurrentUser('id') userId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() data: UpdateTransactionDto,
  ) {
    return this.transactionsService.update(userId, id, data);
  }
  @Delete(':id')
  delete(
    @CurrentUser('id') userId: string,
    @Param('id', ParseUUIDPipe) transactionId: string,
  ) {
    return this.transactionsService.delete(userId, transactionId);
  }
}
