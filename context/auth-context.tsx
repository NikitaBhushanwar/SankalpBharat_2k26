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
  role: 'admin' | 'moderator'
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [user, setUser] = useState<AdminUser | null>(null)
  const [error, setError] = useState<string | null>(null)

  // Check localStorage on mount
  useEffect(() => {
    const storedAuth = localStorage.getItem('admin_auth')
    const storedUser = localStorage.getItem('admin_user')

    if (storedAuth && storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser)
        setUser(parsedUser)
        setIsAuthenticated(true)
      } catch (err) {
        localStorage.removeItem('admin_auth')
        localStorage.removeItem('admin_user')
      }
    }
  }, [])

  const login = async (email: string, password: string) => {
    try {
      setError(null)

      // Demo credentials: admin@sankalp.com / admin123
      if (email === 'admin@sankalp.com' && password === 'admin123') {
        const adminUser: AdminUser = {
          id: '1',
          email: email,
          role: 'admin',
        }

        setUser(adminUser)
        setIsAuthenticated(true)

        // Store in localStorage for demo purposes
        localStorage.setItem('admin_auth', 'true')
        localStorage.setItem('admin_user', JSON.stringify(adminUser))
      } else if (email === 'moderator@sankalp.com' && password === 'mod123') {
        const modUser: AdminUser = {
          id: '2',
          email: email,
          role: 'moderator',
        }

        setUser(modUser)
        setIsAuthenticated(true)

        localStorage.setItem('admin_auth', 'true')
        localStorage.setItem('admin_user', JSON.stringify(modUser))
      } else {
        setError('Invalid email or password')
        throw new Error('Invalid credentials')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed')
      throw err
    }
  }

  const logout = () => {
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
