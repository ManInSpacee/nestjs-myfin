import { api } from './client'
import type {
  CategorySummary,
  CreateTransactionInput,
  Summary,
  Transaction,
  TransactionFilters,
  UpdateTransactionInput,
} from '../types'

export async function getTransactions(
  filters: TransactionFilters,
): Promise<Transaction[]> {
  const res = await api.get<Transaction[]>('/transactions', { params: filters })
  return res.data
}

export async function createTransaction(
  input: CreateTransactionInput,
): Promise<Transaction> {
  const res = await api.post<Transaction>('/transactions', input)
  return res.data
}

export async function updateTransaction(
  id: string,
  input: UpdateTransactionInput,
): Promise<Transaction> {
  const res = await api.patch<Transaction>(`/transactions/${id}`, input)
  return res.data
}

export async function deleteTransaction(id: string): Promise<void> {
  await api.delete(`/transactions/${id}`)
}

export async function getSummary(from: string, to: string): Promise<Summary> {
  const res = await api.get<Summary>('/transactions/summary', {
    params: { from, to },
  })
  return res.data
}

export async function getByCategory(
  from: string,
  to: string,
): Promise<CategorySummary[]> {
  const res = await api.get<CategorySummary[]>('/transactions/by-category', {
    params: { from, to },
  })
  return res.data
}
