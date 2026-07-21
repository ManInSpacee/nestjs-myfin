import { api } from './client'

interface LoginResponse {
  access_token: string
}

export interface RegisteredUser {
  id: string
  email: string
  createdAt: string
}

export async function login(email: string, password: string): Promise<string> {
  const res = await api.post<LoginResponse>('/auth/login', { email, password })
  return res.data.access_token
}

export async function register(
  email: string,
  password: string,
): Promise<RegisteredUser> {
  const res = await api.post<RegisteredUser>('/auth/register', {
    email,
    password,
  })
  return res.data
}

export async function logout(): Promise<void> {
  await api.post('/auth/logout')
}

export async function silentRefresh(): Promise<string> {
  const res = await api.post<LoginResponse>('/auth/refresh')
  return res.data.access_token
}
