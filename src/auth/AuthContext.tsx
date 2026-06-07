import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { adminApi } from '../api/endpoints'
import { clearTokens, getStoredTokens, storeTokens } from '../api/client'
import type { AdminUser } from '../types'

interface AuthContextValue {
  user: AdminUser | null
  isLoading: boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => void
  refreshMe: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AdminUser | null>(() => getStoredTokens().user)
  const [isLoading, setIsLoading] = useState(true)

  const refreshMe = useCallback(async () => {
    const { access } = getStoredTokens()
    if (!access) {
      setUser(null)
      return
    }
    const me = await adminApi.me()
    setUser(me as AdminUser)
    storeTokens(access, getStoredTokens().refresh || '', me)
  }, [])

  useEffect(() => {
    refreshMe()
      .catch(() => {
        clearTokens()
        setUser(null)
      })
      .finally(() => setIsLoading(false))
  }, [refreshMe])

  const login = useCallback(async (email: string, password: string) => {
    const data = await adminApi.login(email, password)
    storeTokens(data.access, data.refresh, data.user)
    setUser(data.user)
  }, [])

  const logout = useCallback(() => {
    clearTokens()
    setUser(null)
  }, [])

  const value = useMemo(
    () => ({ user, isLoading, login, logout, refreshMe }),
    [user, isLoading, login, logout, refreshMe],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
