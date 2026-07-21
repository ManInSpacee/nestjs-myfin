export type TransactionType = 'INCOME' | 'EXPENSE'

export interface Transaction {
  id: string
  createdAt: string
  transactionDate: string
  description: string | null
  type: TransactionType
  amount: string
  userId: string
  categoryId: string | null
}

export interface Category {
  id: string
  userId: string | null
  name: string
}

export interface Summary {
  totalIncome: number
  totalExpense: number
  net: number
  count: number
}

export interface CategorySummary {
  categoryId: string
  categoryName: string
  totalIncome: number
  totalExpense: number
}

export interface CreateTransactionInput {
  type: TransactionType
  amount: number
  description?: string
  categoryId?: string
  transactionDate?: string
}

export interface UpdateTransactionInput {
  description?: string
  categoryId?: string
  transactionDate?: string
}

export interface TransactionFilters {
  type?: TransactionType
  categoryId?: string
  from?: string
  to?: string
  page?: number
}
