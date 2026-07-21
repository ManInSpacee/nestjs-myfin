import { AxiosError } from 'axios'

export function formatMoney(value: number | string): string {
  const n = typeof value === 'string' ? Number(value) : value
  return n.toLocaleString('ru-RU', {
    style: 'currency',
    currency: 'RUB',
    maximumFractionDigits: 2,
  })
}

export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('ru-RU')
}

export function getErrorMessage(error: unknown): string {
  if (error instanceof AxiosError) {
    const data = error.response?.data as { message?: string | string[] } | undefined
    const msg = data?.message
    if (Array.isArray(msg)) return msg.join(', ')
    if (msg) return msg
    return error.message
  }
  return 'Неизвестная ошибка'
}
