'use client'

import React from "react"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/context/auth-context'
import { PageTransition } from '@/components/page-transition'
import { Lock, Mail } from 'lucide-react'
import Link from 'next/link'

export default function AdminLoginPage() {
  const router = useRouter()
  const { login, error: authError } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      await login(email, password)
      router.push('/admin/dashboard')
    } catch (err) {
      setError(authError || 'Login failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <PageTransition>
      <main className="min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8 relative overflow-hidden page-transition-enter">
        {/* Background gradients */}
        <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-emerald-300/20 rounded-full blur-3xl opacity-40 animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-300/20 rounded-full blur-3xl opacity-40 animate-pulse" style={{ animationDelay: '1s' }} />

        <div className="relative z-10 w-full max-w-md sm:max-w-lg">
          {/* Back link */}
          <Link href="/" className="inline-flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors mb-6 sm:mb-8 text-sm">
            <span>←</span> Back to Home
          </Link>

          {/* Login card */}
          <div className="glass-effect rounded-2xl p-6 sm:p-8 card-hover">
            {/* Header */}
            <div className="mb-6 sm:mb-8">
              <div className="flex items-center gap-2 mb-3 sm:mb-4">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-emerald-500 to-blue-500 flex items-center justify-center">
                  <Lock className="w-6 h-6 text-white" />
                </div>
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-1 sm:mb-2">Admin Access</h1>
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                Secure login for Sankalp Bharat administrators
              </p>
            </div>

            {/* Demo credentials info */}
            <div className="mb-6 p-4 bg-secondary/10 border border-secondary/30 rounded-lg">
              <p className="text-xs font-mono text-secondary mb-2">Demo Credentials:</p>
              <p className="text-xs text-muted-foreground mb-1">Admin: admin@sankalp.com / admin123</p>
              <p className="text-xs text-muted-foreground">Moderator: moderator@sankalp.com / mod123</p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Email field */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-foreground mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 w-5 h-5 text-muted-foreground" />
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="admin@sankalp.com"
                    className="w-full pl-10 pr-4 py-2 rounded-lg bg-muted/30 border border-border focus:border-accent focus:outline-none transition-colors text-foreground placeholder:text-muted-foreground"
                    required
                  />
                </div>
              </div>

              {/* Password field */}
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-foreground mb-2">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 w-5 h-5 text-muted-foreground" />
                  <input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-4 py-2 rounded-lg bg-muted/30 border border-border focus:border-accent focus:outline-none transition-colors text-foreground placeholder:text-muted-foreground"
                    required
                  />
                </div>
              </div>

              {/* Error message */}
              {error && (
                <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/30">
                  <p className="text-sm text-red-400">{error}</p>
                </div>
              )}

              {/* Remember me */}
              <div className="flex items-center">
                <input
                  id="remember"
                  type="checkbox"
                  className="w-4 h-4 rounded border-border bg-muted cursor-pointer"
                />
                <label htmlFor="remember" className="ml-2 text-sm text-muted-foreground cursor-pointer">
                  Remember me
                </label>
              </div>

              {/* Submit button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full btn-primary-neon glow-accent py-2.5 font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Logging in...' : 'Sign In'}
              </button>
            </form>

            {/* Footer */}
            <div className="mt-6 p-4 border-t border-border/50 text-center">
              <p className="text-xs text-muted-foreground">
                This is a demo admin panel for demonstration purposes.
              </p>
            </div>
          </div>
          </div>
        </main>
      </PageTransition>
  )
}
