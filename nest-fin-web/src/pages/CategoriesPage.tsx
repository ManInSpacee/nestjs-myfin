import { useEffect, useState, type FormEvent } from 'react'
import {
  createCategory,
  deleteCategory,
  getCategories,
  updateCategory,
} from '../api/categories'
import type { Category } from '../types'
import { getErrorMessage } from '../lib/format'

export function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([])
  const [name, setName] = useState('')
  const [error, setError] = useState<string | null>(null)

  async function load() {
    try {
      setCategories(await getCategories())
    } catch (err) {
      setError(getErrorMessage(err))
    }
  }

  useEffect(() => {
    load()
  }, [])

  async function handleCreate(e: FormEvent) {
    e.preventDefault()
    setError(null)
    try {
      await createCategory(name)
      setName('')
      await load()
    } catch (err) {
      setError(getErrorMessage(err))
    }
  }

  async function handleRename(cat: Category) {
    const next = prompt('Новое название', cat.name)
    if (!next || next === cat.name) return
    try {
      await updateCategory(cat.id, next)
      await load()
    } catch (err) {
      setError(getErrorMessage(err))
    }
  }

  async function handleDelete(cat: Category) {
    if (!confirm(`Удалить категорию «${cat.name}»?`)) return
    try {
      await deleteCategory(cat.id)
      await load()
    } catch (err) {
      setError(getErrorMessage(err))
    }
  }

  return (
    <div>
      <h1 className="text-lg font-semibold text-slate-900 mb-4">Категории</h1>

      <form onSubmit={handleCreate} className="flex gap-3 mb-6">
        <input
          type="text"
          placeholder="Название (3–16 символов)"
          value={name}
          onChange={(e) => setName(e.target.value)}
          minLength={3}
          maxLength={16}
          required
          className="px-3 py-2 border border-slate-300 rounded-md text-sm flex-1"
        />
        <button
          type="submit"
          className="bg-slate-900 text-white px-4 py-2 rounded-md text-sm hover:bg-slate-800"
        >
          Создать
        </button>
      </form>

      {error && (
        <div className="mb-4 text-sm text-red-600 bg-red-50 rounded-md p-2">
          {error}
        </div>
      )}

      <div className="bg-white rounded-xl border border-slate-200 divide-y divide-slate-100">
        {categories.map((c) => (
          <div
            key={c.id}
            className="flex items-center justify-between px-4 py-3"
          >
            <span className="text-slate-800">
              {c.name}
              {c.userId === null && (
                <span className="ml-2 text-xs text-slate-400">общая</span>
              )}
            </span>
            {c.userId !== null && (
              <div className="flex gap-3 text-sm">
                <button
                  onClick={() => handleRename(c)}
                  className="text-slate-500 hover:text-slate-900"
                >
                  Переименовать
                </button>
                <button
                  onClick={() => handleDelete(c)}
                  className="text-slate-400 hover:text-red-600"
                >
                  Удалить
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
