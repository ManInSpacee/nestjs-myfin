import axios, {
  AxiosError,
  type InternalAxiosRequestConfig,
} from 'axios'
import { getToken, setToken } from './token'

export const api = axios.create({
  baseURL: '/api',
  withCredentials: true,
})

api.interceptors.request.use((config) => {
  const token = getToken()
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

let refreshing: Promise<string> | null = null

async function requestRefresh(): Promise<string> {
  const res = await axios.post('/api/auth/refresh', null, {
    withCredentials: true,
  })
  return res.data.access_token as string
}

function redirectToLogin() {
  if (window.location.pathname !== '/login') {
    window.location.href = '/login'
  }
}

api.interceptors.response.use(
  (res) => res,
  async (error: AxiosError) => {
    const original = error.config as
      | (InternalAxiosRequestConfig & { _retry?: boolean })
      | undefined

    if (error.response?.status !== 401 || !original || original._retry) {
      return Promise.reject(error)
    }

    if (original.url?.includes('/auth/refresh')) {
      setToken(null)
      redirectToLogin()
      return Promise.reject(error)
    }

    original._retry = true
    try {
      refreshing = refreshing ?? requestRefresh()
      const newToken = await refreshing
      refreshing = null

      setToken(newToken)
      original.headers.Authorization = `Bearer ${newToken}`
      return api(original)
    } catch (refreshError) {
      refreshing = null
      setToken(null)
      redirectToLogin()
      return Promise.reject(refreshError)
    }
  },
)
