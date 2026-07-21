import { useCallback, useEffect, useState } from 'react'
import {
  createTransaction,
  deleteTransaction,
  getTransactions,
} from '../api/transactions'
import { getCategories } from '../api/categories'
import type {
  Category,
  CreateTransactionInput,
  Transaction,
  TransactionFilters,
  TransactionType,
} from '../types'
import { TransactionForm } from '../components/TransactionForm'
import { formatDate, formatMoney, getErrorMessage } from '../lib/format'

export function TransactionsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [filters, setFilters] = useState<TransactionFilters>({ page: 1 })
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const categoryName = useCallback(
    (id: string | null) =>
      id ? (categories.find((c) => c.id === id)?.name ?? '—') : '—',
    [categories],
  )

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await getTransactions(filters)
      setTransactions(data)
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }, [filters])

  useEffect(() => {
    getCategories().then(setCategories).catch(() => {})
  }, [])

  useEffect(() => {
    load()
  }, [load])

  async function handleCreate(input: CreateTransactionInput) {
    try {
      await createTransaction(input)
      setFilters((f) => ({ ...f, page: 1 }))
      await load()
    } catch (err) {
      setError(getErrorMessage(err))
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Удалить транзакцию?')) return
    try {
      await deleteTransaction(id)
      await load()
    } catch (err) {
      setError(getErrorMessage(err))
    }
  }

  const page = filters.page ?? 1

  return (
    <div>
      <h1 className="text-lg font-semibold text-slate-900 mb-4">Транзакции</h1>

      <TransactionForm categories={categories} onSubmit={handleCreate} />

      <div className="flex flex-wrap gap-3 mb-4">
        <select
          value={filters.type ?? ''}
          onChange={(e) =>
            setFilters((f) => ({
              ...f,
              type: (e.target.value || undefined) as TransactionType | undefined,
              page: 1,
            }))
          }
          className="px-3 py-2 border border-slate-300 rounded-md text-sm"
        >
          <option value="">Все типы</option>
          <option value="EXPENSE">Расход</option>
          <option value="INCOME">Доход</option>
        </select>
        <select
          value={filters.categoryId ?? ''}
          onChange={(e) =>
            setFilters((f) => ({
              ...f,
              categoryId: e.target.value || undefined,
              page: 1,
            }))
          }
          className="px-3 py-2 border border-slate-300 rounded-md text-sm"
        >
          <option value="">Все категории</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </div>

      {error && (
        <div className="mb-4 text-sm text-red-600 bg-red-50 rounded-md p-2">
          {error}
        </div>
      )}

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-slate-500">
            <tr>
              <th className="text-left px-4 py-2 font-medium">Дата</th>
              <th className="text-left px-4 py-2 font-medium">Описание</th>
              <th className="text-left px-4 py-2 font-medium">Категория</th>
              <th className="text-right px-4 py-2 font-medium">Сумма</th>
              <th className="px-4 py-2"></th>
            </tr>
          </thead>
          <tbody>
            {transactions.length === 0 && !loading && (
              <tr>
                <td colSpan={5} className="px-4 py-4 text-slate-400 text-center">
                  Пусто
                </td>
              </tr>
            )}
            {transactions.map((t) => (
              <tr key={t.id} className="border-t border-slate-100">
                <td className="px-4 py-2 text-slate-500">
                  {formatDate(t.transactionDate)}
                </td>
                <td className="px-4 py-2 text-slate-800">
                  {t.description ?? '—'}
                </td>
                <td className="px-4 py-2 text-slate-500">
                  {categoryName(t.categoryId)}
                </td>
                <td
                  className={`px-4 py-2 text-right font-medium ${
                    t.type === 'INCOME' ? 'text-emerald-600' : 'text-red-600'
                  }`}
                >
                  {t.type === 'INCOME' ? '+' : '−'}
                  {formatMoney(t.amount)}
                </td>
                <td className="px-4 py-2 text-right">
                  <button
                    onClick={() => handleDelete(t.id)}
                    className="text-slate-400 hover:text-red-600"
                  >
                    Удалить
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between mt-4">
        <button
          onClick={() => setFilters((f) => ({ ...f, page: page - 1 }))}
          disabled={page <= 1}
          className="px-3 py-2 text-sm border border-slate-300 rounded-md disabled:opacity-40"
        >
          Назад
        </button>
        <span className="text-sm text-slate-500">Страница {page}</span>
        <button
          onClick={() => setFilters((f) => ({ ...f, page: page + 1 }))}
          disabled={transactions.length < 20}
          className="px-3 py-2 text-sm border border-slate-300 rounded-md disabled:opacity-40"
        >
          Вперёд
        </button>
      </div>
    </div>
  )
}
