import { useEffect, useState } from 'react'
import { getByCategory, getSummary } from '../api/transactions'
import type { CategorySummary, Summary } from '../types'
import { formatMoney, getErrorMessage } from '../lib/format'

function currentMonthRange() {
  const now = new Date()
  const first = new Date(now.getFullYear(), now.getMonth(), 1)
  const last = new Date(now.getFullYear(), now.getMonth() + 1, 0)
  const iso = (d: Date) => d.toISOString().slice(0, 10)
  return { from: iso(first), to: iso(last) }
}

export function Dashboard() {
  const [range, setRange] = useState(currentMonthRange)
  const [summary, setSummary] = useState<Summary | null>(null)
  const [byCategory, setByCategory] = useState<CategorySummary[]>([])
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    setLoading(true)
    setError(null)
    Promise.all([
      getSummary(range.from, range.to),
      getByCategory(range.from, range.to),
    ])
      .then(([s, c]) => {
        setSummary(s)
        setByCategory(c)
      })
      .catch((err) => setError(getErrorMessage(err)))
      .finally(() => setLoading(false))
  }, [range])

  return (
    <div>
      <div className="flex items-end gap-3 mb-6">
        <div>
          <label className="block text-xs text-slate-500 mb-1">С</label>
          <input
            type="date"
            value={range.from}
            onChange={(e) => setRange((r) => ({ ...r, from: e.target.value }))}
            className="px-3 py-2 border border-slate-300 rounded-md text-sm"
          />
        </div>
        <div>
          <label className="block text-xs text-slate-500 mb-1">По</label>
          <input
            type="date"
            value={range.to}
            onChange={(e) => setRange((r) => ({ ...r, to: e.target.value }))}
            className="px-3 py-2 border border-slate-300 rounded-md text-sm"
          />
        </div>
      </div>

      {error && (
        <div className="mb-4 text-sm text-red-600 bg-red-50 rounded-md p-2">
          {error}
        </div>
      )}

      {loading && <p className="text-slate-400">Загрузка…</p>}

      {summary && (
        <div className="grid grid-cols-3 gap-4 mb-8">
          <StatCard label="Доходы" value={summary.totalIncome} color="text-emerald-600" />
          <StatCard label="Расходы" value={summary.totalExpense} color="text-red-600" />
          <StatCard label="Итого" value={summary.net} color="text-slate-900" />
        </div>
      )}

      <h2 className="text-sm font-semibold text-slate-500 uppercase mb-3">
        По категориям
      </h2>
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-slate-500">
            <tr>
              <th className="text-left px-4 py-2 font-medium">Категория</th>
              <th className="text-right px-4 py-2 font-medium">Доходы</th>
              <th className="text-right px-4 py-2 font-medium">Расходы</th>
            </tr>
          </thead>
          <tbody>
            {byCategory.length === 0 && (
              <tr>
                <td colSpan={3} className="px-4 py-4 text-slate-400 text-center">
                  Нет данных за период
                </td>
              </tr>
            )}
            {byCategory.map((c) => (
              <tr key={c.categoryId} className="border-t border-slate-100">
                <td className="px-4 py-2 text-slate-800">{c.categoryName}</td>
                <td className="px-4 py-2 text-right text-emerald-600">
                  {formatMoney(c.totalIncome)}
                </td>
                <td className="px-4 py-2 text-right text-red-600">
                  {formatMoney(c.totalExpense)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function StatCard({
  label,
  value,
  color,
}: {
  label: string
  value: number
  color: string
}) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-4">
      <div className="text-xs text-slate-500 mb-1">{label}</div>
      <div className={`text-xl font-semibold ${color}`}>{formatMoney(value)}</div>
    </div>
  )
}
