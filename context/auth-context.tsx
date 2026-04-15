'use client'

import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from 'react'
import { createPortal } from 'react-dom'

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

const INACTIVITY_TIMEOUT_MS = 10 * 60 * 1000
const INACTIVITY_WARNING_MS = 60 * 1000
const INACTIVITY_WARNING_THRESHOLD_MS = INACTIVITY_TIMEOUT_MS - INACTIVITY_WARNING_MS
const INACTIVITY_CHECK_INTERVAL_MS = 1000
const SESSION_REFRESH_INTERVAL_MS = 60 * 1000

const ACTIVITY_EVENTS: Array<keyof WindowEventMap> = [
  'mousedown',
  'mousemove',
  'keydown',
  'scroll',
  'touchstart',
]

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [user, setUser] = useState<AdminUser | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [idleWarningSecondsLeft, setIdleWarningSecondsLeft] = useState<number | null>(null)
  const lastActivityAtRef = useRef(Date.now())
  const logoutInProgressRef = useRef(false)

  const touchActivity = useCallback(() => {
    lastActivityAtRef.current = Date.now()
    setIdleWarningSecondsLeft(null)
  }, [])

  const clearClientAuthState = useCallback(() => {
    setUser(null)
    setIsAuthenticated(false)
    setError(null)
    setIdleWarningSecondsLeft(null)
    localStorage.removeItem('admin_auth')
    localStorage.removeItem('admin_user')
  }, [])

  // Check server session on mount (localStorage is only a client cache)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const pathname = window.location.pathname
      const isAdminRoute = pathname.startsWith('/admin')
      const isAdminLoginRoute = pathname === '/admin/login'

      if (!isAdminRoute || isAdminLoginRoute) {
        return
      }
    }

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
        touchActivity()
        localStorage.setItem('admin_auth', 'true')
        localStorage.setItem('admin_user', JSON.stringify(json.data))
      } catch {
        clearClientAuthState()
      }
    }

    void restoreSession()
  }, [clearClientAuthState, touchActivity])

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
      touchActivity()

      localStorage.setItem('admin_auth', 'true')
      localStorage.setItem('admin_user', JSON.stringify(json.data))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed')
      throw err
    }
  }

  const logout = useCallback(() => {
    if (logoutInProgressRef.current) {
      return
    }

    logoutInProgressRef.current = true
    clearClientAuthState()

    void fetch('/api/admin-auth/logout', {
      method: 'POST',
    }).finally(() => {
      logoutInProgressRef.current = false
    })
  }, [clearClientAuthState])

  useEffect(() => {
    if (!isAuthenticated) {
      return
    }

    const isUserViewingPage = () => document.visibilityState === 'visible' && document.hasFocus()

    const handleUserActivity = () => {
      touchActivity()
    }

    for (const eventName of ACTIVITY_EVENTS) {
      window.addEventListener(eventName, handleUserActivity, { passive: true })
    }

    const inactivityTimer = window.setInterval(() => {
      const inactiveFor = Date.now() - lastActivityAtRef.current

      if (inactiveFor >= INACTIVITY_TIMEOUT_MS) {
        logout()
        return
      }

      if (inactiveFor >= INACTIVITY_WARNING_THRESHOLD_MS && isUserViewingPage()) {
        const remainingMs = Math.max(0, INACTIVITY_TIMEOUT_MS - inactiveFor)
        setIdleWarningSecondsLeft(Math.ceil(remainingMs / 1000))
      } else {
        setIdleWarningSecondsLeft(null)
      }
    }, INACTIVITY_CHECK_INTERVAL_MS)

    const handleVisibilityOrFocusChange = () => {
      if (!isUserViewingPage()) {
        setIdleWarningSecondsLeft(null)
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityOrFocusChange)
    window.addEventListener('focus', handleVisibilityOrFocusChange)
    window.addEventListener('blur', handleVisibilityOrFocusChange)

    const sessionRefreshTimer = window.setInterval(async () => {
      const inactiveFor = Date.now() - lastActivityAtRef.current

      // Refresh only when user has been recently active.
      if (inactiveFor >= INACTIVITY_TIMEOUT_MS) {
        return
      }

      try {
        const response = await fetch('/api/admin-auth/session', {
          method: 'GET',
          cache: 'no-store',
        })

        if (!response.ok) {
          logout()
        }
      } catch {
        logout()
      }
    }, SESSION_REFRESH_INTERVAL_MS)

    return () => {
      for (const eventName of ACTIVITY_EVENTS) {
        window.removeEventListener(eventName, handleUserActivity)
      }

      window.clearInterval(inactivityTimer)
      window.clearInterval(sessionRefreshTimer)
      document.removeEventListener('visibilitychange', handleVisibilityOrFocusChange)
      window.removeEventListener('focus', handleVisibilityOrFocusChange)
      window.removeEventListener('blur', handleVisibilityOrFocusChange)
    }
  }, [isAuthenticated, logout, touchActivity])

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

      {isAuthenticated && idleWarningSecondsLeft !== null && typeof window !== 'undefined' && createPortal(
        <div className="fixed inset-0 z-[120] flex items-center justify-center bg-slate-950/70 backdrop-blur-sm px-4">
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="idle-warning-title"
            className="w-full max-w-md rounded-3xl border border-amber-400/30 bg-slate-900 shadow-[0_28px_80px_rgba(2,6,23,0.65)]"
          >
            <div className="p-5 sm:p-6 space-y-4">
              <div className="inline-flex items-center rounded-full border border-amber-400/30 bg-amber-500/15 px-3 py-1 text-xs font-bold uppercase tracking-[0.2em] text-amber-200">
                Inactivity Warning
              </div>

              <div className="space-y-2">
                <h3 id="idle-warning-title" className="text-xl font-black text-white">
                  You will be logged out soon
                </h3>
                <p className="text-sm text-slate-300 leading-relaxed">
                  No activity detected. For security, this admin session will end in
                  {' '}
                  <span className="font-semibold text-amber-200">{Math.floor(idleWarningSecondsLeft / 60)}:{String(idleWarningSecondsLeft % 60).padStart(2, '0')}</span>
                  .
                </p>
                <p className="text-xs text-slate-400">
                  Move the mouse, scroll, or press any key to stay signed in.
                </p>
              </div>

              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={touchActivity}
                  className="inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-amber-400 to-orange-500 px-4 py-2 text-xs font-black uppercase tracking-[0.18em] text-slate-950 transition hover:brightness-110"
                >
                  Stay Signed In
                </button>
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}
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
