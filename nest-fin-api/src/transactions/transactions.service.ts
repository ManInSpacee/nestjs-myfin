import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateTransactionDto } from './dto/createTransaction.dto';
import { TransactionType } from 'generated/prisma/enums';
import { UpdateTransactionDto } from './dto/updateTransaction.dto';
import { SummaryQueryDto } from './dto/summaryQuery.dto';
import { FilterQueryDto } from './dto/filterQuery.dto';

@Injectable()
export class TransactionsService {
  constructor(private prismaService: PrismaService) {}

  private readonly PAGE_SIZE = 20;

  async create(userId: string, data: CreateTransactionDto) {
    const delta =
      data.type === TransactionType.INCOME ? data.amount : -data.amount;

    await this.validateInput(userId, data.categoryId, data.transactionDate);

    const [transaction] = await this.prismaService.$transaction([
      this.prismaService.transaction.create({
        data: {
          transactionDate: data.transactionDate,
          description: data.description,
          type: data.type,
          amount: data.amount,
          userId,
          categoryId: data.categoryId,
        },
      }),
      this.prismaService.user.update({
        where: { id: userId },
        data: {
          balance: { increment: delta },
        },
      }),
    ]);
    return transaction;
  }

  async update(
    userId: string,
    transactionId: string,
    data: UpdateTransactionDto,
  ) {
    await this.validateInput(userId, data.categoryId, data.transactionDate);
    const transaction = await this.prismaService.transaction.findFirst({
      where: { id: transactionId, userId },
    });
    if (!transaction) throw new NotFoundException('Транзакция не найдена');
    const updated = await this.prismaService.transaction.update({
      where: { id: transactionId },
      data,
    });
    return updated;
  }

  async delete(userId: string, transactionId: string) {
    const transaction = await this.prismaService.transaction.findFirst({
      where: { id: transactionId, userId },
    });
    if (!transaction) throw new NotFoundException('Транзакция не найдена');

    const delta =
      transaction.type === TransactionType.INCOME
        ? transaction.amount
        : -transaction.amount;

    await this.prismaService.$transaction([
      this.prismaService.user.update({
        where: { id: userId },
        data: { balance: { increment: delta } },
      }),
      this.prismaService.transaction.delete({
        where: { id: transactionId },
      }),
    ]);
    return { success: true };
  }
  async getSummary(userId: string, data: SummaryQueryDto) {
    if (data.from > data.to)
      throw new BadRequestException('from не может быть позже to');
    const end = this.toEndOfDay(data.to);
    const groups = await this.prismaService.transaction.groupBy({
      by: ['type'],
      where: { userId, transactionDate: { gte: data.from, lte: end } },
      _sum: { amount: true },
      _count: true,
    });
    const incomeGroup = groups.find((g) => g.type === TransactionType.INCOME);
    const expenseGroup = groups.find((g) => g.type === TransactionType.EXPENSE);
    const totalIncome = incomeGroup?._sum.amount?.toNumber() ?? 0;
    const totalExpense = expenseGroup?._sum.amount?.toNumber() ?? 0;

    return {
      totalIncome,
      totalExpense,
      net: totalIncome - totalExpense,
      count: (incomeGroup?._count ?? 0) + (expenseGroup?._count ?? 0),
    };
  }

  async getByFilter(userId: string, filters: FilterQueryDto) {
    if (filters.from && filters.to && filters.from > filters.to)
      throw new BadRequestException('from не может быть позже to');
    const end = this.toEndOfDay(filters.to);
    const page = filters.page ?? 1;
    const skip = (page - 1) * this.PAGE_SIZE;

    const result = await this.prismaService.transaction.findMany({
      where: {
        userId,
        categoryId: filters.categoryId,
        type: filters.type,
        transactionDate: { gte: filters.from, lte: end },
      },
      orderBy: { transactionDate: 'desc' },
      take: this.PAGE_SIZE,
      skip,
    });
    return result;
  }

  async getByCategories(userId: string, filters: FilterQueryDto) {
    if (filters.from && filters.to && filters.from > filters.to)
      throw new BadRequestException('from не может быть позже to');
    const end = this.toEndOfDay(filters.to);
    const group = await this.prismaService.transaction.groupBy({
      by: ['categoryId', 'type'],
      where: {
        userId,
        type: filters.type,
        transactionDate: { gte: filters.from, lte: end },
      },
      _sum: { amount: true },
      _count: true,
    });

    const acc = new Map<
      string,
      { totalIncome: number; totalExpense: number }
    >();
    for (const row of group) {
      const key = row.categoryId ?? 'none';
      const current = acc.get(key) ?? {
        totalIncome: 0,
        totalExpense: 0,
      };
      if (row.type === TransactionType.INCOME) {
        current.totalIncome += row._sum.amount?.toNumber() ?? 0;
      } else {
        current.totalExpense += row._sum.amount?.toNumber() ?? 0;
      }
      acc.set(key, current);
    }
    const summaries = [...acc.entries()].map(([categoryId, sums]) => ({
      categoryId,
      totalIncome: sums.totalIncome,
      totalExpense: sums.totalExpense,
    }));
    const categoryIds = [...acc.keys()];
    const categories = await this.prismaService.category.findMany({
      where: { id: { in: categoryIds } },
    });
    const nameById = new Map<string, string>(
      categories.map((c) => [c.id, c.name]),
    );
    const result = summaries.map((t) => ({
      categoryId: t.categoryId,
      categoryName: nameById.get(t.categoryId) ?? 'none',
      totalIncome: t.totalIncome,
      totalExpense: t.totalExpense,
    }));
    return result;
  }

  async getById(userId: string, transactionId: string) {
    const result = await this.prismaService.transaction.findFirst({
      where: {
        userId,
        id: transactionId,
      },
    });

    if (!result) {
      throw new NotFoundException('transaction not found');
    }
    return result;
  }

  private async validateInput(
    userId: string,
    categoryId?: string,
    transactionDate?: Date,
  ) {
    if (categoryId) {
      const category = await this.prismaService.category.findFirst({
        where: {
          id: categoryId,
          OR: [{ userId }, { userId: null }],
        },
      });
      if (!category) {
        throw new BadRequestException('Категория не найдена');
      }
    }
    if (transactionDate && transactionDate > new Date()) {
      throw new BadRequestException('Дата не может быть в будущем');
    }
  }
  private toEndOfDay(date?: Date) {
    if (!date) return undefined;
    const end = new Date(date);
    end.setHours(23, 59, 59, 999);
    return end;
  }
}
