'use client'

import { FormEvent, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Lock, RefreshCw, Eye, EyeOff } from 'lucide-react'
import { useAuth } from '@/context/auth-context'

export default function AdminLoginPage() {
  const router = useRouter()
  const { login, error } = useAuth()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)

    try {
      await login(email, password)
      router.replace('/admin/dashboard')
    } catch {
      // Error is handled via auth context state
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="min-h-screen flex items-start justify-center px-4 sm:px-6 pt-32 sm:pt-36 pb-12">
      <div className="w-full max-w-md rounded-3xl border border-white/10 bg-slate-900/70 backdrop-blur-xl shadow-2xl p-6 sm:p-8">
        <button
          type="button"
          onClick={() => router.push('/')}
          className="inline-flex items-center gap-2 text-sm font-semibold text-slate-300 hover:text-white transition"
        >
          <ArrowLeft size={16} />
          Back
        </button>

        <div className="flex flex-col items-center text-center">
          <div className="w-16 h-16 rounded-2xl bg-white text-slate-900 flex items-center justify-center shadow-lg mb-5">
            <Lock size={28} />
          </div>
          <h1 className="text-3xl sm:text-4xl font-black uppercase tracking-tight text-white">
            Admin Login
          </h1>
          <p className="mt-2 text-xs uppercase tracking-[0.18em] text-slate-400 font-semibold">
            Secure Access Only
          </p>
        </div>

        <form onSubmit={handleSubmit} className="mt-8 space-y-5">
          <div className="space-y-2">
            <label className="text-[11px] uppercase tracking-widest font-bold text-slate-300">
              Admin Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@sankalp.com"
              className="w-full rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-white placeholder:text-slate-500 outline-none focus:border-cyan-400"
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-[11px] uppercase tracking-widest font-bold text-slate-300">
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                className="w-full rounded-xl border border-white/15 bg-white/5 px-4 py-3 pr-11 text-white placeholder:text-slate-500 outline-none focus:border-cyan-400"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute inset-y-0 right-3 inline-flex items-center text-slate-400 hover:text-white"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {error && (
            <p className="text-sm font-semibold text-red-400">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:brightness-110 text-white font-black uppercase tracking-[0.22em] py-3.5 transition disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading && <RefreshCw size={16} className="animate-spin" />}
            {loading ? 'Signing In...' : 'Login'}
          </button>
        </form>
      </div>
    </section>
  )
}
