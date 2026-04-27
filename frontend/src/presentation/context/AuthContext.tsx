import { createContext, useContext, useState, useCallback, ReactNode } from 'react'
import type { AuthApi, AuthUser, LoginPayload, RegisterPayload } from '../../application/ports/AuthApi'

type AuthContextValue = {
  user: AuthUser | null
  login: (payload: LoginPayload) => Promise<void>
  register: (payload: RegisterPayload) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

function parseTokenUser(token: string): AuthUser | null {
  try {
    const payload = JSON.parse(atob(token.split('.')[1])) as {
      sub: string
      username: string
      email?: string
    }
    return { id: payload.sub, username: payload.username, email: payload.email ?? '' }
  } catch {
    return null
  }
}

export function AuthProvider({ api, children }: { api: AuthApi; children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(() => {
    const token = api.getToken()
    return token ? parseTokenUser(token) : null
  })

  const login = useCallback(
    async (payload: LoginPayload) => {
      const token = await api.login(payload)
      setUser(parseTokenUser(token))
    },
    [api],
  )

  const register = useCallback(
    async (payload: RegisterPayload) => {
      const newUser = await api.register(payload)
      const token = await api.login({ email: payload.email, password: payload.password })
      setUser(parseTokenUser(token) ?? newUser)
    },
    [api],
  )

  const logout = useCallback(() => {
    api.logout()
    setUser(null)
  }, [api])

  return <AuthContext.Provider value={{ user, login, register, logout }}>{children}</AuthContext.Provider>
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
  return ctx
}
