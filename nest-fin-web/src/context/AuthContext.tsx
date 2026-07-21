import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react'
import * as authApi from '../api/auth'
import { setToken } from '../api/token'

interface AuthState {
  isAuthenticated: boolean
  loading: boolean
  login: (email: string, password: string) => Promise<void>
  register: (email: string, password: string) => Promise<void>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthState | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    authApi
      .silentRefresh()
      .then((token) => {
        setToken(token)
        setIsAuthenticated(true)
      })
      .catch(() => {
        setToken(null)
        setIsAuthenticated(false)
      })
      .finally(() => setLoading(false))
  }, [])

  async function login(email: string, password: string) {
    const token = await authApi.login(email, password)
    setToken(token)
    setIsAuthenticated(true)
  }

  async function register(email: string, password: string) {
    await authApi.register(email, password)
    await login(email, password)
  }

  async function logout() {
    try {
      await authApi.logout()
    } finally {
      setToken(null)
      setIsAuthenticated(false)
    }
  }

  return (
    <AuthContext.Provider
      value={{ isAuthenticated, loading, login, register, logout }}
    >
      {children}
    </AuthContext.Provider>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth(): AuthState {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth должен быть внутри AuthProvider')
  return ctx
}
