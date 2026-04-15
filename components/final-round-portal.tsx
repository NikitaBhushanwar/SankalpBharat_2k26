'use client'

import { useCallback, useEffect, useMemo, useState, type FormEvent } from 'react'
import { CheckCircle2, Clock3, Lock, RefreshCw, Shield, Sparkles } from 'lucide-react'

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

const POLL_INTERVAL_MS = 3000

export default function FinalRoundPortal() {
  const [teamId, setTeamId] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [data, setData] = useState<FinalRoundDashboardData | null>(null)
  const [lastSyncedAt, setLastSyncedAt] = useState<string | null>(null)
  const [selectedInFlightId, setSelectedInFlightId] = useState<string | null>(null)
  const [pendingSelectionId, setPendingSelectionId] = useState<string>('')
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false)
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmNewPassword, setConfirmNewPassword] = useState('')
  const [passwordChangeLoading, setPasswordChangeLoading] = useState(false)
  const [passwordChangeMessage, setPasswordChangeMessage] = useState<string | null>(null)
  const [showPasswordChangeForm, setShowPasswordChangeForm] = useState(false)
  const [selectionRevealReady, setSelectionRevealReady] = useState(false)

  const selectedProblemStatement = useMemo(() => {
    if (!data?.team.selectedProblemStatementId) {
      return null
    }

    return data.problemStatements.find((item) => item.id === data.team.selectedProblemStatementId) ?? null
  }, [data])

  const pendingSelectionStatement = useMemo(() => {
    if (!pendingSelectionId || !data?.problemStatements) {
      return null
    }

    return data.problemStatements.find((item) => item.id === pendingSelectionId) ?? null
  }, [data, pendingSelectionId])

  const loadSession = useCallback(async () => {
    try {
      const response = await fetch('/api/final-round/session', { cache: 'no-store' })
      const json = (await response.json()) as ApiResponse<FinalRoundDashboardData>

      if (!response.ok || !json.success || !json.data) {
        throw new Error('Not authenticated')
      }

      setData(json.data)
      setError(null)
      setLastSyncedAt(new Date().toISOString())
    } catch {
      setData(null)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    if (!selectedProblemStatement) {
      setSelectionRevealReady(false)
      return
    }

    setSelectionRevealReady(false)
    const frame = window.requestAnimationFrame(() => {
      setSelectionRevealReady(true)
    })

    return () => {
      window.cancelAnimationFrame(frame)
    }
  }, [selectedProblemStatement?.id])

  useEffect(() => {
    void loadSession()
  }, [loadSession])

  useEffect(() => {
    if (!data?.team) {
      return
    }

    const interval = window.setInterval(() => {
      void loadSession()
    }, POLL_INTERVAL_MS)

    return () => {
      window.clearInterval(interval)
    }
  }, [data?.team?.id, loadSession])

  const handleLogin = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setIsSubmitting(true)
    setError(null)

    try {
      const response = await fetch('/api/final-round/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ teamId, password }),
      })

      const json = (await response.json()) as ApiResponse<FinalRoundDashboardData>

      if (!response.ok || !json.success || !json.data) {
        throw new Error(json.error || 'Invalid team ID or password')
      }

      setData(json.data)
      setPassword('')
      setError(null)
      setLastSyncedAt(new Date().toISOString())
    } catch (loginError) {
      setError(loginError instanceof Error ? loginError.message : 'Invalid team ID or password')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleSelect = async (problemStatementId: string) => {
    setSelectedInFlightId(problemStatementId)
    setError(null)

    try {
      const response = await fetch('/api/final-round/select', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ problemStatementId }),
      })

      const json = (await response.json()) as ApiResponse<FinalRoundDashboardData>

      if (!response.ok || !json.success || !json.data) {
        throw new Error(json.error || 'Selection failed')
      }

      setData(json.data)
      setLastSyncedAt(new Date().toISOString())
    } catch (selectionError) {
      setError(selectionError instanceof Error ? selectionError.message : 'Selection failed')
    } finally {
      setSelectedInFlightId(null)
    }
  }

  const openConfirmSelectionModal = () => {
    if (!pendingSelectionId) {
      setError('Please select a problem statement first.')
      return
    }

    setIsConfirmModalOpen(true)
  }

  const handleConfirmSelection = async () => {
    if (!pendingSelectionId) {
      setError('Please select a problem statement first.')
      setIsConfirmModalOpen(false)
      return
    }

    setIsConfirmModalOpen(false)
    await handleSelect(pendingSelectionId)
  }

  const handleLogout = async () => {
    await fetch('/api/final-round/logout', { method: 'POST' })
    setData(null)
    setTeamId('')
    setPassword('')
    setError(null)
    setCurrentPassword('')
    setNewPassword('')
    setConfirmNewPassword('')
    setPasswordChangeMessage(null)
    setShowPasswordChangeForm(false)
  }

  const handleChangePassword = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setPasswordChangeMessage(null)

    if (!currentPassword || !newPassword) {
      setPasswordChangeMessage('Current password and new password are required.')
      return
    }

    if (newPassword !== confirmNewPassword) {
      setPasswordChangeMessage('New password and confirm password do not match.')
      return
    }

    setPasswordChangeLoading(true)

    try {
      const response = await fetch('/api/final-round/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword, newPassword }),
      })

      const json = (await response.json()) as ApiResponse<{ updated: true }>

      if (!response.ok || !json.success) {
        throw new Error(json.error || 'Failed to change password')
      }

      setCurrentPassword('')
      setNewPassword('')
      setConfirmNewPassword('')
      setPasswordChangeMessage('Password updated successfully.')
    } catch (passwordChangeError) {
      setPasswordChangeMessage(passwordChangeError instanceof Error ? passwordChangeError.message : 'Failed to change password')
    } finally {
      setPasswordChangeLoading(false)
    }
  }

  if (isLoading && !data) {
    return <div className="min-h-screen flex items-center justify-center text-slate-300">Loading final round portal...</div>
  }

  return (
    <main className="min-h-screen px-4 sm:px-6 lg:px-8 pt-36 pb-10 bg-[radial-gradient(circle_at_top_left,_rgba(34,211,238,0.18),_transparent_28%),radial-gradient(circle_at_bottom_right,_rgba(16,185,129,0.16),_transparent_26%),linear-gradient(180deg,_#020617_0%,_#08111f_48%,_#020617_100%)] text-white">
      <div className="mx-auto max-w-6xl space-y-6">
        <section className="rounded-[2rem] border border-white/10 bg-white/6 backdrop-blur-2xl shadow-[0_40px_120px_rgba(2,6,23,0.45)] overflow-hidden">
          <div className="grid lg:grid-cols-[1.1fr_0.9fr]">
            <div className="p-6 sm:p-8 lg:p-10 space-y-6">
              <div className="inline-flex items-center gap-2 rounded-full border border-cyan-400/30 bg-cyan-400/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.22em] text-cyan-200">
                <Sparkles size={14} /> Final Round Allocation
              </div>
              <div className="space-y-3">
                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight">Problem Statement allocation portal</h1>
                <p className="max-w-2xl text-sm sm:text-base text-slate-300 leading-relaxed">
                  Each team can lock exactly one problem statement. Slot counts are enforced by the server, so the last seat cannot be overbooked even when multiple teams click at once.
                </p>
              </div>

              {data?.team ? (
                <div className="space-y-4">
                  <div className="grid gap-3 sm:grid-cols-3">
                    <div className="rounded-2xl border border-white/10 bg-slate-950/40 p-4">
                      <p className="text-[11px] uppercase tracking-[0.24em] text-slate-400 font-semibold">Team ID</p>
                      <p className="mt-2 text-lg font-black">{data.team.teamId}</p>
                    </div>
                    <div className="rounded-2xl border border-white/10 bg-slate-950/40 p-4">
                      <p className="text-[11px] uppercase tracking-[0.24em] text-slate-400 font-semibold">Team Name</p>
                      <p className="mt-2 text-lg font-black">{data.team.teamName}</p>
                    </div>
                    <div className="rounded-2xl border border-white/10 bg-slate-950/40 p-4">
                      <p className="text-[11px] uppercase tracking-[0.24em] text-slate-400 font-semibold">Sync</p>
                      <p className="mt-2 text-sm font-semibold text-slate-300">
                        {lastSyncedAt ? `Updated ${new Date(lastSyncedAt).toLocaleTimeString()}` : 'Waiting for sync'}
                      </p>
                    </div>
                  </div>

                  <div className="rounded-2xl border border-white/10 bg-slate-950/40 p-4 space-y-3">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <p className="text-[11px] uppercase tracking-[0.22em] text-slate-400 font-semibold">Account Security</p>
                      <button
                        type="button"
                        onClick={() => {
                          setShowPasswordChangeForm((prev) => !prev)
                          setPasswordChangeMessage(null)
                        }}
                        className="inline-flex items-center justify-center rounded-xl border border-cyan-400/30 bg-cyan-400/10 px-4 py-2 text-xs font-black uppercase tracking-[0.2em] text-cyan-100 transition hover:bg-cyan-400/20"
                      >
                        {showPasswordChangeForm ? 'Close Password Form' : 'Change Password'}
                      </button>
                    </div>

                    {showPasswordChangeForm && (
                      <form onSubmit={handleChangePassword} className="space-y-3">
                        <div className="grid gap-3 sm:grid-cols-3">
                          <input
                            type="password"
                            value={currentPassword}
                            onChange={(event) => setCurrentPassword(event.target.value)}
                            className="rounded-xl border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-white outline-none focus:border-cyan-400"
                            placeholder="Current password"
                            required
                          />
                          <input
                            type="password"
                            value={newPassword}
                            onChange={(event) => setNewPassword(event.target.value)}
                            className="rounded-xl border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-white outline-none focus:border-cyan-400"
                            placeholder="New password"
                            required
                          />
                          <input
                            type="password"
                            value={confirmNewPassword}
                            onChange={(event) => setConfirmNewPassword(event.target.value)}
                            className="rounded-xl border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-white outline-none focus:border-cyan-400"
                            placeholder="Confirm new password"
                            required
                          />
                        </div>
                        <div className="flex items-center justify-between gap-3">
                          <button
                            type="submit"
                            disabled={passwordChangeLoading}
                            className="inline-flex items-center justify-center rounded-xl border border-cyan-400/30 bg-cyan-400/10 px-4 py-2 text-xs font-black uppercase tracking-[0.2em] text-cyan-100 transition hover:bg-cyan-400/20 disabled:cursor-not-allowed disabled:opacity-40"
                          >
                            {passwordChangeLoading ? 'Updating...' : 'Update Password'}
                          </button>
                          {passwordChangeMessage && <p className="text-xs text-slate-300">{passwordChangeMessage}</p>}
                        </div>
                      </form>
                    )}

                    {!showPasswordChangeForm && passwordChangeMessage && <p className="text-xs text-slate-300">{passwordChangeMessage}</p>}
                  </div>
                </div>
              ) : (
                <div className="rounded-3xl border border-white/10 bg-slate-950/40 p-5 sm:p-6">
                  <form onSubmit={handleLogin} className="grid gap-4 sm:grid-cols-2">
                    <label className="space-y-2 sm:col-span-1">
                      <span className="text-[11px] uppercase tracking-[0.22em] text-slate-400 font-semibold">Team ID</span>
                      <input
                        value={teamId}
                        onChange={(event) => setTeamId(event.target.value)}
                        className="w-full rounded-2xl border border-white/10 bg-slate-900/70 px-4 py-3 text-white outline-none transition focus:border-cyan-400"
                        placeholder="Enter team ID"
                        autoComplete="username"
                        required
                      />
                    </label>
                    <label className="space-y-2 sm:col-span-1">
                      <span className="text-[11px] uppercase tracking-[0.22em] text-slate-400 font-semibold">Password</span>
                      <input
                        type="password"
                        value={password}
                        onChange={(event) => setPassword(event.target.value)}
                        className="w-full rounded-2xl border border-white/10 bg-slate-900/70 px-4 py-3 text-white outline-none transition focus:border-cyan-400"
                        placeholder="Enter password"
                        autoComplete="current-password"
                        required
                      />
                    </label>

                    {error && <p className="sm:col-span-2 text-sm font-semibold text-rose-300">{error}</p>}

                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="sm:col-span-2 inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-cyan-500 to-emerald-500 px-5 py-3.5 text-sm font-black uppercase tracking-[0.22em] text-slate-950 transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-70"
                    >
                      {isSubmitting ? <RefreshCw size={16} className="animate-spin" /> : <Lock size={16} />}
                      {isSubmitting ? 'Signing in...' : 'Unlock Dashboard'}
                    </button>
                  </form>
                </div>
              )}
            </div>

            <div className="border-t lg:border-t-0 lg:border-l border-white/10 bg-slate-950/50 p-6 sm:p-8 space-y-5">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-[11px] uppercase tracking-[0.24em] text-slate-400 font-semibold">State</p>
                  <h2 className="mt-1 text-xl font-black">{data?.team.selectedProblemStatementId ? 'Locked' : 'Available'}</h2>
                </div>
                <div className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-semibold text-slate-300 inline-flex items-center gap-2">
                  <Clock3 size={14} /> Polling every 3s
                </div>
              </div>

              {data?.team.selectedProblemStatementId ? (
                <div className="min-h-[520px] flex items-center justify-center">
                  <article
                    className={`w-full max-w-2xl rounded-[2rem] border border-emerald-400/25 bg-gradient-to-br from-emerald-400/10 via-cyan-400/10 to-slate-950/80 p-5 sm:p-7 shadow-[0_30px_90px_rgba(16,185,129,0.18)] transform-gpu transition-all duration-700 ease-out ${selectionRevealReady ? 'translate-y-0 scale-100 opacity-100' : 'translate-y-6 scale-95 opacity-0'}`}
                  >
                    <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                      <div className="inline-flex items-center gap-2 text-emerald-200 text-sm font-semibold">
                        <CheckCircle2 size={16} /> Selection locked
                      </div>
                      <button
                        type="button"
                        onClick={handleLogout}
                        className="text-xs font-semibold text-slate-300 hover:text-white transition"
                      >
                        Logout
                      </button>
                    </div>

                    <div className="space-y-3 text-center sm:text-left">
                      <p className="text-[11px] uppercase tracking-[0.22em] text-cyan-200 font-semibold">
                        {selectedProblemStatement?.problemStatementId || 'Selected PS'}
                      </p>
                      <h3 className="text-2xl sm:text-3xl font-black text-white leading-tight">
                        {selectedProblemStatement?.title ?? 'Your selected problem statement'}
                      </h3>
                      <p className="text-sm text-slate-300 leading-relaxed max-w-3xl">
                        {selectedProblemStatement?.domain ? `Domain: ${selectedProblemStatement.domain}` : ''}
                      </p>
                      <p className="text-sm text-slate-300 leading-relaxed max-w-3xl">
                        {selectedProblemStatement?.description}
                      </p>
                    </div>

                    <div className="mt-6 grid gap-3 sm:grid-cols-2">
                      <div className="rounded-2xl border border-white/10 bg-slate-950/40 p-4">
                        <p className="text-[11px] uppercase tracking-[0.24em] text-slate-400 font-semibold">Team</p>
                        <p className="mt-2 text-lg font-black text-white">{data.team.teamName}</p>
                      </div>
                      <div className="rounded-2xl border border-white/10 bg-slate-950/40 p-4">
                        <p className="text-[11px] uppercase tracking-[0.24em] text-slate-400 font-semibold">Locked At</p>
                        <p className="mt-2 text-sm font-semibold text-slate-300">
                          {data.team.selectedAt ? new Date(data.team.selectedAt).toLocaleString() : 'Just now'}
                        </p>
                      </div>
                    </div>

                    <p className="mt-5 text-xs text-emerald-50/80 text-center sm:text-left">
                      No further changes are allowed. This card now stays as the only visible problem-statement content for your team.
                    </p>
                  </article>
                </div>
              ) : (
                <>
                  <div className="rounded-3xl border border-cyan-400/20 bg-cyan-400/10 p-5 space-y-3">
                    <div className="inline-flex items-center gap-2 text-cyan-200 text-sm font-semibold">
                      <Shield size={16} /> One-time booking
                    </div>
                    <p className="text-sm text-slate-200 leading-relaxed">
                      Pick one problem statement only. The server will reject any second selection, and full slots are blocked immediately.
                    </p>
                  </div>

                  <div className="rounded-3xl border border-white/10 bg-slate-950/40 p-4 sm:p-5 space-y-4">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="text-[11px] uppercase tracking-[0.24em] text-slate-400 font-semibold">Slots</p>
                        <h3 className="mt-1 text-lg font-black">Live availability</h3>
                      </div>
                      {data?.team && (
                        <button
                          type="button"
                          onClick={handleLogout}
                          className="text-xs font-semibold text-slate-300 hover:text-white transition"
                        >
                          Logout
                        </button>
                      )}
                    </div>

                    <div className="rounded-2xl border border-cyan-500/20 bg-slate-900/60 p-3 sm:p-4 space-y-3">
                      <label className="block space-y-2">
                        <span className="text-[11px] uppercase tracking-[0.22em] text-slate-400 font-semibold">Select Problem Statement</span>
                        <select
                          value={pendingSelectionId}
                          onChange={(event) => setPendingSelectionId(event.target.value)}
                          className="w-full rounded-xl border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-white outline-none focus:border-cyan-400"
                        >
                          <option value="">Choose one option</option>
                          {data?.problemStatements
                            .filter((item) => !item.isFull)
                            .map((item) => (
                              <option key={item.id} value={item.id}>
                                {(item.problemStatementId || item.title)} ({item.filledSlots}/{item.maxSlots})
                              </option>
                            ))}
                        </select>
                      </label>
                      <button
                        type="button"
                        disabled={!pendingSelectionId || Boolean(selectedInFlightId)}
                        onClick={openConfirmSelectionModal}
                        className="inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 px-4 py-2 text-xs font-black uppercase tracking-[0.2em] text-slate-950 transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-40"
                      >
                        {selectedInFlightId ? 'Confirming...' : 'Confirm Selection'}
                      </button>
                      <p className="text-xs text-rose-200/90">Warning: once confirmed, this selection cannot be undone.</p>
                      {data?.problemStatements.length === 0 && (
                        <p className="text-xs text-slate-300">No final problem statements are available yet. Please contact admin.</p>
                      )}
                    </div>

                    <div className="space-y-3">
                      {data?.problemStatements?.length === 0 && (
                        <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-slate-300">
                          Problem statements are not published yet.
                        </div>
                      )}

                      {data?.problemStatements?.map((item, index) => {
                        const locked = Boolean(data.team.selectedProblemStatementId)
                        const canSelect = !locked && !item.isFull

                        return (
                          <article key={item.id} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                            <div className="flex items-start justify-between gap-3">
                              <div className="space-y-1">
                                <p className="text-[11px] uppercase tracking-[0.22em] text-cyan-200 font-semibold">{item.problemStatementId || `PS ${index + 1}`}</p>
                                <h4 className="text-base font-black text-white">{item.title}</h4>
                                <p className="text-xs text-slate-400">{item.domain}</p>
                              </div>
                              <div className={`rounded-full px-3 py-1 text-xs font-black ${item.isFull ? 'bg-rose-400/15 text-rose-200' : 'bg-emerald-400/15 text-emerald-200'}`}>
                                {item.filledSlots}/{item.maxSlots}
                              </div>
                            </div>

                            <p className="mt-3 max-h-24 overflow-hidden text-sm text-slate-300 leading-relaxed">{item.description}</p>

                            <div className="mt-4 flex items-center justify-between gap-3 flex-wrap">
                              <span className={`text-xs font-semibold ${item.isFull ? 'text-rose-300' : 'text-emerald-300'}`}>
                                {item.isFull ? 'Full' : 'Available'}
                              </span>
                              <span className="text-xs text-slate-400">{locked ? 'Locked' : canSelect ? 'Selectable' : 'Unavailable'}</span>
                            </div>
                          </article>
                        )
                      })}
                    </div>
                  </div>
                </>
              )}

              {error && <p className="text-sm font-semibold text-rose-300">{error}</p>}
            </div>
          </div>
        </section>
      </div>

      {isConfirmModalOpen && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-slate-950/75 backdrop-blur-sm px-4">
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="confirm-selection-title"
            className="w-full max-w-md rounded-3xl border border-amber-400/30 bg-slate-900 shadow-[0_28px_80px_rgba(2,6,23,0.65)]"
          >
            <div className="p-5 sm:p-6 space-y-4">
              <div className="inline-flex items-center rounded-full border border-amber-400/30 bg-amber-500/15 px-3 py-1 text-xs font-bold uppercase tracking-[0.2em] text-amber-200">
                Final Confirmation
              </div>

              <div className="space-y-2">
                <h3 id="confirm-selection-title" className="text-xl font-black text-white">
                  Confirm Your Selection
                </h3>
                <p className="text-sm text-slate-300 leading-relaxed">
                  You are about to lock:
                  {' '}
                  <span className="font-semibold text-cyan-200">
                    {pendingSelectionStatement?.problemStatementId || 'Selected PS'}
                    {pendingSelectionStatement?.title ? ` - ${pendingSelectionStatement.title}` : ''}
                  </span>
                </p>
                <p className="text-xs text-rose-200">
                  This action is permanent. You cannot undo this after confirmation.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-2 sm:justify-end">
                <button
                  type="button"
                  onClick={() => setIsConfirmModalOpen(false)}
                  className="inline-flex items-center justify-center rounded-xl border border-slate-600 bg-slate-800 px-4 py-2 text-xs font-black uppercase tracking-[0.18em] text-slate-200 transition hover:bg-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => void handleConfirmSelection()}
                  disabled={Boolean(selectedInFlightId)}
                  className="inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-amber-400 to-rose-500 px-4 py-2 text-xs font-black uppercase tracking-[0.18em] text-slate-950 transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {selectedInFlightId ? 'Locking...' : 'Yes, Lock My PS'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  )
}