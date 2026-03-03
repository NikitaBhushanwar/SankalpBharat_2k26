'use client'

import { createContext, useContext, useState, ReactNode, useEffect } from 'react'

interface AuthContextType {
  isAuthenticated: boolean
  user: AdminUser | null
  login: (email: string, password: string) => Promise<void>
  logout: () => void
  error: string | null
}

interface AdminUser {
  id: string
  email: string
  isSuperAdmin: boolean
  isActive: boolean
  createdAt: string
}

interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [user, setUser] = useState<AdminUser | null>(null)
  const [error, setError] = useState<string | null>(null)

  // Check server session on mount (localStorage is only a client cache)
  useEffect(() => {
    const restoreSession = async () => {
      try {
        const response = await fetch('/api/admin-auth/session', {
          method: 'GET',
          cache: 'no-store',
        })

        const json = (await response.json()) as ApiResponse<AdminUser>

        if (!response.ok || !json.success || !json.data) {
          throw new Error('No active session')
        }

        setUser(json.data)
        setIsAuthenticated(true)
        localStorage.setItem('admin_auth', 'true')
        localStorage.setItem('admin_user', JSON.stringify(json.data))
      } catch {
        setUser(null)
        setIsAuthenticated(false)
        localStorage.removeItem('admin_auth')
        localStorage.removeItem('admin_user')
      }
    }

    void restoreSession()
  }, [])

  const login = async (email: string, password: string) => {
    try {
      setError(null)

      const response = await fetch('/api/admin-auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      })

      const json = (await response.json()) as ApiResponse<AdminUser>

      if (!response.ok || !json.success || !json.data) {
        throw new Error(json.error || 'Invalid email or password')
      }

      setUser(json.data)
      setIsAuthenticated(true)

      localStorage.setItem('admin_auth', 'true')
      localStorage.setItem('admin_user', JSON.stringify(json.data))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed')
      throw err
    }
  }

  const logout = () => {
    void fetch('/api/admin-auth/logout', {
      method: 'POST',
    })

    setUser(null)
    setIsAuthenticated(false)
    setError(null)
    localStorage.removeItem('admin_auth')
    localStorage.removeItem('admin_user')
  }

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        user,
        login,
        logout,
        error,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}
