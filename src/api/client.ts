import axios, { type AxiosError, type InternalAxiosRequestConfig } from 'axios'
import type { ApiEnvelope } from '../types'

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api'

export const api = axios.create({
  baseURL: API_BASE,
  headers: { 'Content-Type': 'application/json' },
})

export function getStoredTokens() {
  const access = localStorage.getItem('admin_access')
  const refresh = localStorage.getItem('admin_refresh')
  const userRaw = localStorage.getItem('admin_user')
  return {
    access,
    refresh,
    user: userRaw ? JSON.parse(userRaw) : null,
  }
}

export function storeTokens(access: string, refresh: string, user: unknown) {
  localStorage.setItem('admin_access', access)
  localStorage.setItem('admin_refresh', refresh)
  localStorage.setItem('admin_user', JSON.stringify(user))
}

export function clearTokens() {
  localStorage.removeItem('admin_access')
  localStorage.removeItem('admin_refresh')
  localStorage.removeItem('admin_user')
}

api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const { access } = getStoredTokens()
  if (access) {
    config.headers.Authorization = `Bearer ${access}`
  }
  return config
})

let refreshing: Promise<string | null> | null = null

api.interceptors.response.use(
  (res) => res,
  async (error: AxiosError) => {
    const original = error.config as InternalAxiosRequestConfig & { _retry?: boolean }
    if (error.response?.status === 401 && original && !original._retry) {
      original._retry = true
      const { refresh } = getStoredTokens()
      if (!refresh) {
        clearTokens()
        window.location.href = '/login'
        return Promise.reject(error)
      }
      if (!refreshing) {
        refreshing = api
          .post('/admin/auth/token/refresh/', { refresh })
          .then((res) => {
            const payload = res.data
            const access = payload.access ?? payload.data?.access
            const newRefresh = payload.refresh ?? payload.data?.refresh
            if (access) {
              const stored = getStoredTokens()
              storeTokens(access, newRefresh || stored.refresh || '', stored.user)
              return access
            }
            return null
          })
          .catch(() => {
            clearTokens()
            window.location.href = '/login'
            return null
          })
          .finally(() => {
            refreshing = null
          })
      }
      const newAccess = await refreshing
      if (newAccess && original.headers) {
        original.headers.Authorization = `Bearer ${newAccess}`
        return api(original)
      }
    }
    return Promise.reject(error)
  },
)

export async function unwrap<T>(promise: Promise<{ data: ApiEnvelope<T> }>): Promise<T> {
  const { data } = await promise
  if (data.status === 'failed') {
    throw new Error(data.message || 'Request failed')
  }
  return data.data
}

export function extractError(err: unknown): string {
  if (axios.isAxiosError(err)) {
    const msg = err.response?.data?.message
    if (typeof msg === 'string') return msg
  }
  if (err instanceof Error) return err.message
  return 'Something went wrong'
}
