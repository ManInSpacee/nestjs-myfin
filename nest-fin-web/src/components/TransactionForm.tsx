import { useState, type FormEvent } from 'react'
import type {
  Category,
  CreateTransactionInput,
  TransactionType,
} from '../types'

interface Props {
  categories: Category[]
  onSubmit: (input: CreateTransactionInput) => Promise<void>
}

export function TransactionForm({ categories, onSubmit }: Props) {
  const [type, setType] = useState<TransactionType>('EXPENSE')
  const [amount, setAmount] = useState('')
  const [description, setDescription] = useState('')
  const [categoryId, setCategoryId] = useState('')
  const [date, setDate] = useState('')
  const [busy, setBusy] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setBusy(true)
    try {
      await onSubmit({
        type,
        amount: Number(amount),
        description: description || undefined,
        categoryId: categoryId || undefined,
        transactionDate: date ? new Date(date).toISOString() : undefined,
      })
      setAmount('')
      setDescription('')
      setCategoryId('')
      setDate('')
    } finally {
      setBusy(false)
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white rounded-xl border border-slate-200 p-4 flex flex-wrap items-end gap-3 mb-6"
    >
      <select
        value={type}
        onChange={(e) => setType(e.target.value as TransactionType)}
        className="px-3 py-2 border border-slate-300 rounded-md text-sm"
      >
        <option value="EXPENSE">Расход</option>
        <option value="INCOME">Доход</option>
      </select>
      <input
        type="number"
        step="0.01"
        min="0.01"
        placeholder="Сумма"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        required
        className="px-3 py-2 border border-slate-300 rounded-md text-sm w-28"
      />
      <input
        type="text"
        placeholder="Описание"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        maxLength={50}
        className="px-3 py-2 border border-slate-300 rounded-md text-sm flex-1 min-w-40"
      />
      <select
        value={categoryId}
        onChange={(e) => setCategoryId(e.target.value)}
        className="px-3 py-2 border border-slate-300 rounded-md text-sm"
      >
        <option value="">Без категории</option>
        {categories.map((c) => (
          <option key={c.id} value={c.id}>
            {c.name}
          </option>
        ))}
      </select>
      <input
        type="date"
        value={date}
        onChange={(e) => setDate(e.target.value)}
        className="px-3 py-2 border border-slate-300 rounded-md text-sm"
      />
      <button
        type="submit"
        disabled={busy}
        className="bg-slate-900 text-white px-4 py-2 rounded-md text-sm hover:bg-slate-800 disabled:opacity-50"
      >
        Добавить
      </button>
    </form>
  )
}
