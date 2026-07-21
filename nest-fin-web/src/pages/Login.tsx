import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { getErrorMessage } from '../lib/format'

export function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      await login(email, password)
      navigate('/', { replace: true })
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-8 rounded-xl shadow-sm border border-slate-200 w-full max-w-sm"
      >
        <h1 className="text-xl font-semibold text-slate-900 mb-6">Вход</h1>
        {error && (
          <div className="mb-4 text-sm text-red-600 bg-red-50 rounded-md p-2">
            {error}
          </div>
        )}
        <label className="block text-sm text-slate-600 mb-1">Email</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="w-full mb-4 px-3 py-2 border border-slate-300 rounded-md"
        />
        <label className="block text-sm text-slate-600 mb-1">Пароль</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className="w-full mb-6 px-3 py-2 border border-slate-300 rounded-md"
        />
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-slate-900 text-white py-2 rounded-md hover:bg-slate-800 disabled:opacity-50"
        >
          {loading ? 'Вход…' : 'Войти'}
        </button>
        <p className="text-sm text-slate-500 mt-4 text-center">
          Нет аккаунта?{' '}
          <Link to="/register" className="text-slate-900 underline">
            Регистрация
          </Link>
        </p>
      </form>
    </div>
  )
}
