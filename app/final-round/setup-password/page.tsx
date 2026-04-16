'use client'

import { useMemo, useState, type FormEvent } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { KeyRound, ShieldCheck } from 'lucide-react'

interface FinalRoundTeam {
  id: string
  teamId: string
  teamName: string
  selectedProblemStatementId: string | null
  selectedAt: string | null
}

interface FinalRoundProblemStatement {
  id: string
  problemStatementId: string
  title: string
  domain: string
  description: string
  pdfLink: string
  maxSlots: number
  filledSlots: number
  isFull: boolean
}

interface FinalRoundDashboardData {
  team: FinalRoundTeam
  problemStatements: FinalRoundProblemStatement[]
}

interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
}

export default function FinalRoundSetupPasswordPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = useMemo(() => searchParams.get('token')?.trim() ?? '', [searchParams])

  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError(null)

    if (!token) {
      setError('Setup token is missing in the URL.')
      return
    }

    if (!newPassword || !confirmPassword) {
      setError('Please enter and confirm the new password.')
      return
    }

    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters.')
      return
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.')
      return
    }

    setSubmitting(true)

    try {
      const response = await fetch('/api/final-round/setup-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, newPassword }),
      })

      const json = (await response.json()) as ApiResponse<FinalRoundDashboardData>

      if (!response.ok || !json.success || !json.data) {
        throw new Error(json.error || 'Failed to set password')
      }

      router.push('/final-round')
      router.refresh()
    } catch (setupError) {
      setError(setupError instanceof Error ? setupError.message : 'Failed to set password')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <main className="min-h-screen px-4 sm:px-6 lg:px-8 pt-36 pb-10 bg-[radial-gradient(circle_at_top_left,_rgba(34,211,238,0.18),_transparent_28%),radial-gradient(circle_at_bottom_right,_rgba(16,185,129,0.16),_transparent_26%),linear-gradient(180deg,_#020617_0%,_#08111f_48%,_#020617_100%)] text-white">
      <section className="mx-auto max-w-xl rounded-[2rem] border border-white/10 bg-white/6 backdrop-blur-2xl shadow-[0_40px_120px_rgba(2,6,23,0.45)] p-6 sm:p-8 space-y-5">
        <div className="inline-flex items-center gap-2 rounded-full border border-cyan-400/30 bg-cyan-400/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.22em] text-cyan-200">
          <ShieldCheck size={14} /> Final Round Setup
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight">Set your team password</h1>
          <p className="text-sm text-slate-300">
            Use this one-time secure link to create your final round password. Once set, you can log in from the final round portal.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <label className="block space-y-2">
            <span className="text-[11px] uppercase tracking-[0.22em] text-slate-400 font-semibold">New Password</span>
            <input
              type="password"
              value={newPassword}
              onChange={(event) => setNewPassword(event.target.value)}
              placeholder="Minimum 6 characters"
              className="w-full rounded-2xl border border-white/10 bg-slate-900/70 px-4 py-3 text-white outline-none transition focus:border-cyan-400"
              autoComplete="new-password"
              required
            />
          </label>

          <label className="block space-y-2">
            <span className="text-[11px] uppercase tracking-[0.22em] text-slate-400 font-semibold">Confirm Password</span>
            <input
              type="password"
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              placeholder="Re-enter password"
              className="w-full rounded-2xl border border-white/10 bg-slate-900/70 px-4 py-3 text-white outline-none transition focus:border-cyan-400"
              autoComplete="new-password"
              required
            />
          </label>

          {error && <p className="text-sm font-semibold text-rose-300">{error}</p>}

          <button
            type="submit"
            disabled={submitting}
            className="w-full inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-cyan-500 to-emerald-500 px-5 py-3.5 text-sm font-black uppercase tracking-[0.22em] text-slate-950 transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-70"
          >
            <KeyRound size={16} />
            {submitting ? 'Saving Password...' : 'Set Password'}
          </button>
        </form>

        <p className="text-xs text-slate-400">
          Already have a password?{' '}
          <Link href="/final-round" className="text-cyan-200 hover:text-cyan-100 underline underline-offset-4">
            Go to final round login
          </Link>
        </p>
      </section>
    </main>
  )
}
