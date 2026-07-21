import { api } from './client'
import type { Category } from '../types'

export async function getCategories(): Promise<Category[]> {
  const res = await api.get<Category[]>('/categories')
  return res.data
}

export async function createCategory(name: string): Promise<Category> {
  const res = await api.post<Category>('/categories', { name })
  return res.data
}

export async function updateCategory(
  id: string,
  name: string,
): Promise<Category> {
  const res = await api.patch<Category>(`/categories/${id}`, { name })
  return res.data
}

export async function deleteCategory(id: string): Promise<void> {
  await api.delete(`/categories/${id}`)
}
