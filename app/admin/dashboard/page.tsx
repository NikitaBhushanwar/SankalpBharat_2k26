'use client'

import { FormEvent, useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  ArrowLeft,
  LogOut,
  Trophy,
  Medal,
  Plus,
  Pencil,
  Trash2,
} from 'lucide-react'
import { useAuth } from '@/context/auth-context'

interface LeaderboardEntry {
  id: string
  rank: number
  teamName: string
  projectTitle: string
  score: number
  members: number
}

interface WinnerEntry {
  id: string
  rank: number
  teamName: string
  title: string
  prizeAmount: string
}

interface ApiResponse<T> {
  success: boolean
  data: T
  error?: string
}

const emptyTeamForm = {
  teamName: '',
  projectTitle: '',
  score: '',
  members: '',
}

const emptyWinnerForm = {
  teamName: '',
  title: '',
  prizeAmount: '',
}

export default function AdminDashboardPage() {
  const router = useRouter()
  const { isAuthenticated, logout } = useAuth()

  const [activeTab, setActiveTab] = useState<'leaderboard' | 'winners'>('leaderboard')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([])
  const [winners, setWinners] = useState<WinnerEntry[]>([])

  const [showTeamForm, setShowTeamForm] = useState(false)
  const [showWinnerForm, setShowWinnerForm] = useState(false)

  const [editingTeamId, setEditingTeamId] = useState<string | null>(null)
  const [editingWinnerId, setEditingWinnerId] = useState<string | null>(null)

  const [teamForm, setTeamForm] = useState(emptyTeamForm)
  const [winnerForm, setWinnerForm] = useState(emptyWinnerForm)

  useEffect(() => {
    if (!isAuthenticated) {
      router.replace('/admin/login')
      return
    }

    void loadData()
  }, [isAuthenticated, router])

  const loadData = async () => {
    setLoading(true)
    setError(null)

    try {
      const [leaderboardRes, winnersRes] = await Promise.all([
        fetch('/api/leaderboard?sortBy=rank', { cache: 'no-store' }),
        fetch('/api/winners', { cache: 'no-store' }),
      ])

      const leaderboardJson = (await leaderboardRes.json()) as ApiResponse<LeaderboardEntry[]>
      const winnersJson = (await winnersRes.json()) as ApiResponse<WinnerEntry[]>

      if (!leaderboardRes.ok || !leaderboardJson.success) {
        throw new Error(leaderboardJson.error || 'Failed to fetch leaderboard')
      }

      if (!winnersRes.ok || !winnersJson.success) {
        throw new Error(winnersJson.error || 'Failed to fetch winners')
      }

      setLeaderboard(leaderboardJson.data ?? [])
      setWinners(winnersJson.data ?? [])
    } catch (fetchError) {
      setError(fetchError instanceof Error ? fetchError.message : 'Failed to load data')
    } finally {
      setLoading(false)
    }
  }

  const resetTeamForm = () => {
    setEditingTeamId(null)
    setTeamForm(emptyTeamForm)
    setShowTeamForm(false)
  }

  const resetWinnerForm = () => {
    setEditingWinnerId(null)
    setWinnerForm(emptyWinnerForm)
    setShowWinnerForm(false)
  }

  const onSaveTeam = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const payload = {
        teamName: teamForm.teamName.trim(),
        projectTitle: teamForm.projectTitle.trim(),
        score: Number(teamForm.score),
        members: Number(teamForm.members),
      }

      const endpoint = editingTeamId ? `/api/leaderboard/${editingTeamId}` : '/api/leaderboard'
      const method = editingTeamId ? 'PUT' : 'POST'

      const response = await fetch(endpoint, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      const json = (await response.json()) as ApiResponse<LeaderboardEntry>
      if (!response.ok || !json.success) {
        throw new Error(json.error || 'Failed to save team')
      }

      await loadData()
      resetTeamForm()
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : 'Failed to save team')
      setLoading(false)
    }
  }

  const onDeleteTeam = async (id: string) => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/leaderboard/${id}`, { method: 'DELETE' })
      const json = (await response.json()) as ApiResponse<LeaderboardEntry>

      if (!response.ok || !json.success) {
        throw new Error(json.error || 'Failed to delete team')
      }

      await loadData()
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : 'Failed to delete team')
      setLoading(false)
    }
  }

  const onSaveWinner = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const payload = {
        teamName: winnerForm.teamName.trim(),
        title: winnerForm.title.trim(),
        prizeAmount: winnerForm.prizeAmount.trim(),
      }

      const endpoint = editingWinnerId ? `/api/winners/${editingWinnerId}` : '/api/winners'
      const method = editingWinnerId ? 'PUT' : 'POST'

      const response = await fetch(endpoint, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      const json = (await response.json()) as ApiResponse<WinnerEntry>
      if (!response.ok || !json.success) {
        throw new Error(json.error || 'Failed to save winner')
      }

      await loadData()
      resetWinnerForm()
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : 'Failed to save winner')
      setLoading(false)
    }
  }

  const onDeleteWinner = async (id: string) => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/winners/${id}`, { method: 'DELETE' })
      const json = (await response.json()) as ApiResponse<WinnerEntry>

      if (!response.ok || !json.success) {
        throw new Error(json.error || 'Failed to delete winner')
      }

      await loadData()
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : 'Failed to delete winner')
      setLoading(false)
    }
  }

  const sortedLeaderboard = useMemo(
    () => [...leaderboard].sort((a, b) => a.rank - b.rank),
    [leaderboard]
  )

  const sortedWinners = useMemo(
    () => [...winners].sort((a, b) => a.rank - b.rank),
    [winners]
  )

  if (!isAuthenticated) {
    return null
  }

  return (
    <section className="min-h-screen px-4 sm:px-6 lg:px-8 pt-28 pb-10">
      <div className="max-w-7xl mx-auto rounded-3xl border border-emerald-500/20 bg-slate-950/80 backdrop-blur-xl shadow-2xl p-4 sm:p-6 lg:p-8">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
          <button
            onClick={() => router.push('/')}
            className="inline-flex items-center gap-2 text-sm font-semibold text-slate-300 hover:text-emerald-400 transition"
          >
            <ArrowLeft size={16} /> Back
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={() => void loadData()}
              className="px-3 py-2 rounded-xl text-xs font-bold uppercase tracking-wider bg-slate-800 text-slate-200 hover:bg-slate-700 transition"
            >
              Refresh
            </button>
            <button
              onClick={() => {
                logout()
                router.replace('/admin/login')
              }}
              className="inline-flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold uppercase tracking-wider bg-red-500/20 text-red-300 hover:bg-red-500/30 transition"
            >
              <LogOut size={14} /> Logout
            </button>
          </div>
        </div>

        <div className="mb-6">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white">Admin Dashboard</h1>
          <p className="text-sm text-slate-400 mt-1">Manage leaderboard and winner data in real-time.</p>
        </div>

        <div className="flex w-full sm:w-auto rounded-xl bg-slate-900 border border-emerald-500/20 p-1 mb-6">
          <button
            onClick={() => setActiveTab('leaderboard')}
            className={`flex-1 sm:flex-none px-4 py-2 rounded-lg text-sm font-bold transition ${
              activeTab === 'leaderboard' ? 'bg-emerald-500 text-slate-950' : 'text-slate-300'
            }`}
          >
            <span className="inline-flex items-center gap-2 justify-center">
              <Trophy size={16} /> Leaderboard
            </span>
          </button>
          <button
            onClick={() => setActiveTab('winners')}
            className={`flex-1 sm:flex-none px-4 py-2 rounded-lg text-sm font-bold transition ${
              activeTab === 'winners' ? 'bg-cyan-500 text-slate-950' : 'text-slate-300'
            }`}
          >
            <span className="inline-flex items-center gap-2 justify-center">
              <Medal size={16} /> Winners
            </span>
          </button>
        </div>

        {error && (
          <div className="mb-5 rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-300">
            {error}
          </div>
        )}

        {activeTab === 'leaderboard' && (
          <div className="space-y-4">
            <div className="flex justify-end">
              <button
                onClick={() => {
                  setShowTeamForm((prev) => !prev)
                  if (editingTeamId) {
                    setEditingTeamId(null)
                    setTeamForm(emptyTeamForm)
                  }
                }}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-500 text-slate-950 text-sm font-black hover:brightness-110 transition"
              >
                <Plus size={16} /> {showTeamForm ? 'Close' : 'Add Team'}
              </button>
            </div>

            {showTeamForm && (
              <form onSubmit={onSaveTeam} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 rounded-2xl border border-emerald-500/20 bg-slate-900/80 p-4">
                <input
                  value={teamForm.teamName}
                  onChange={(e) => setTeamForm((prev) => ({ ...prev, teamName: e.target.value }))}
                  placeholder="Team name"
                  className="rounded-xl bg-slate-800 border border-slate-700 px-3 py-2 text-sm text-white"
                  required
                />
                <input
                  value={teamForm.projectTitle}
                  onChange={(e) => setTeamForm((prev) => ({ ...prev, projectTitle: e.target.value }))}
                  placeholder="Project"
                  className="rounded-xl bg-slate-800 border border-slate-700 px-3 py-2 text-sm text-white"
                  required
                />
                <input
                  type="number"
                  min="0"
                  value={teamForm.score}
                  onChange={(e) => setTeamForm((prev) => ({ ...prev, score: e.target.value }))}
                  placeholder="Score"
                  className="rounded-xl bg-slate-800 border border-slate-700 px-3 py-2 text-sm text-white"
                  required
                />
                <input
                  type="number"
                  min="1"
                  value={teamForm.members}
                  onChange={(e) => setTeamForm((prev) => ({ ...prev, members: e.target.value }))}
                  placeholder="Members"
                  className="rounded-xl bg-slate-800 border border-slate-700 px-3 py-2 text-sm text-white"
                  required
                />

                <div className="sm:col-span-2 lg:col-span-4 flex gap-2 justify-end">
                  <button
                    type="button"
                    onClick={resetTeamForm}
                    className="px-3 py-2 rounded-lg text-xs font-bold uppercase tracking-wider bg-slate-700 text-slate-200"
                  >
                    Cancel
                  </button>
                  <button
                    disabled={loading}
                    type="submit"
                    className="px-3 py-2 rounded-lg text-xs font-bold uppercase tracking-wider bg-emerald-500 text-slate-950 disabled:opacity-60"
                  >
                    {editingTeamId ? 'Update Team' : 'Save Team'}
                  </button>
                </div>
              </form>
            )}

            <div className="rounded-2xl border border-emerald-500/20 overflow-hidden">
              <div className="hidden md:grid grid-cols-12 bg-slate-900/90 text-slate-300 text-xs font-bold uppercase tracking-wider px-4 py-3">
                <div className="col-span-1">#</div>
                <div className="col-span-3">Team</div>
                <div className="col-span-4">Project</div>
                <div className="col-span-1">Score</div>
                <div className="col-span-1">Members</div>
                <div className="col-span-2 text-right">Actions</div>
              </div>

              {sortedLeaderboard.length === 0 ? (
                <div className="p-10 text-center text-slate-400 font-semibold">No leaderboard teams added yet.</div>
              ) : (
                <>
                  <div className="hidden md:block">
                    {sortedLeaderboard.map((entry) => (
                      <div key={entry.id} className="grid grid-cols-12 px-4 py-4 border-t border-emerald-500/10 bg-slate-950/40 text-sm text-slate-200">
                        <div className="col-span-1 font-bold text-emerald-400">{entry.rank}</div>
                        <div className="col-span-3 font-semibold">{entry.teamName}</div>
                        <div className="col-span-4 text-slate-300">{entry.projectTitle}</div>
                        <div className="col-span-1 font-bold">{entry.score}</div>
                        <div className="col-span-1">{entry.members}</div>
                        <div className="col-span-2 flex items-center justify-end gap-2">
                          <button
                            onClick={() => {
                              setEditingTeamId(entry.id)
                              setTeamForm({
                                teamName: entry.teamName,
                                projectTitle: entry.projectTitle,
                                score: String(entry.score),
                                members: String(entry.members),
                              })
                              setShowTeamForm(true)
                            }}
                            className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700"
                          >
                            <Pencil size={14} />
                          </button>
                          <button
                            onClick={() => void onDeleteTeam(entry.id)}
                            className="p-2 rounded-lg bg-slate-800 hover:bg-red-500/40"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="md:hidden space-y-3 p-3">
                    {sortedLeaderboard.map((entry) => (
                      <div key={entry.id} className="rounded-xl border border-emerald-500/20 bg-slate-900/60 p-3">
                        <div className="flex justify-between items-start gap-2">
                          <div>
                            <p className="text-xs text-emerald-400 font-bold">#{entry.rank}</p>
                            <p className="text-lg font-bold text-white">{entry.teamName}</p>
                            <p className="text-sm text-slate-400">{entry.projectTitle}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-bold text-white">{entry.score} pts</p>
                            <p className="text-xs text-slate-400">{entry.members} members</p>
                          </div>
                        </div>
                        <div className="mt-3 flex justify-end gap-2">
                          <button
                            onClick={() => {
                              setEditingTeamId(entry.id)
                              setTeamForm({
                                teamName: entry.teamName,
                                projectTitle: entry.projectTitle,
                                score: String(entry.score),
                                members: String(entry.members),
                              })
                              setShowTeamForm(true)
                            }}
                            className="px-3 py-2 text-xs rounded-lg bg-slate-800 text-slate-200"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => void onDeleteTeam(entry.id)}
                            className="px-3 py-2 text-xs rounded-lg bg-red-500/20 text-red-300"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        {activeTab === 'winners' && (
          <div className="space-y-4">
            <div className="flex justify-end">
              <button
                onClick={() => {
                  setShowWinnerForm((prev) => !prev)
                  if (editingWinnerId) {
                    setEditingWinnerId(null)
                    setWinnerForm(emptyWinnerForm)
                  }
                }}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-cyan-500 text-slate-950 text-sm font-black hover:brightness-110 transition"
              >
                <Plus size={16} /> {showWinnerForm ? 'Close' : 'Add Winner'}
              </button>
            </div>

            {showWinnerForm && (
              <form onSubmit={onSaveWinner} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 rounded-2xl border border-cyan-500/20 bg-slate-900/80 p-4">
                <input
                  value={winnerForm.teamName}
                  onChange={(e) => setWinnerForm((prev) => ({ ...prev, teamName: e.target.value }))}
                  placeholder="Team name"
                  className="rounded-xl bg-slate-800 border border-slate-700 px-3 py-2 text-sm text-white"
                  required
                />
                <input
                  value={winnerForm.title}
                  onChange={(e) => setWinnerForm((prev) => ({ ...prev, title: e.target.value }))}
                  placeholder="Winner title (e.g. Overall Best)"
                  className="rounded-xl bg-slate-800 border border-slate-700 px-3 py-2 text-sm text-white"
                  required
                />
                <input
                  value={winnerForm.prizeAmount}
                  onChange={(e) => setWinnerForm((prev) => ({ ...prev, prizeAmount: e.target.value }))}
                  placeholder="Prize (e.g. ₹50,000)"
                  className="rounded-xl bg-slate-800 border border-slate-700 px-3 py-2 text-sm text-white"
                  required
                />

                <div className="sm:col-span-2 lg:col-span-3 flex gap-2 justify-end">
                  <button
                    type="button"
                    onClick={resetWinnerForm}
                    className="px-3 py-2 rounded-lg text-xs font-bold uppercase tracking-wider bg-slate-700 text-slate-200"
                  >
                    Cancel
                  </button>
                  <button
                    disabled={loading}
                    type="submit"
                    className="px-3 py-2 rounded-lg text-xs font-bold uppercase tracking-wider bg-cyan-500 text-slate-950 disabled:opacity-60"
                  >
                    {editingWinnerId ? 'Update Winner' : 'Save Winner'}
                  </button>
                </div>
              </form>
            )}

            <div className="rounded-2xl border border-cyan-500/20 overflow-hidden">
              {sortedWinners.length === 0 ? (
                <div className="p-10 text-center text-slate-400 font-semibold">No winners added yet.</div>
              ) : (
                <div className="space-y-3 p-3 sm:p-4">
                  {sortedWinners.map((winner) => (
                    <div key={winner.id} className="rounded-xl border border-cyan-500/20 bg-slate-900/60 p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                      <div>
                        <p className="text-xs text-cyan-300 font-bold uppercase tracking-wider">Rank #{winner.rank}</p>
                        <p className="text-lg font-bold text-white">{winner.teamName}</p>
                        <p className="text-sm text-slate-400">{winner.title}</p>
                      </div>
                      <div className="flex items-center gap-3 justify-between sm:justify-end">
                        <p className="text-base font-black text-cyan-300">{winner.prizeAmount}</p>
                        <div className="flex gap-2">
                          <button
                            onClick={() => {
                              setEditingWinnerId(winner.id)
                              setWinnerForm({
                                teamName: winner.teamName,
                                title: winner.title,
                                prizeAmount: winner.prizeAmount,
                              })
                              setShowWinnerForm(true)
                            }}
                            className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700"
                          >
                            <Pencil size={14} />
                          </button>
                          <button
                            onClick={() => void onDeleteWinner(winner.id)}
                            className="p-2 rounded-lg bg-slate-800 hover:bg-red-500/40"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {loading && <p className="mt-4 text-xs text-slate-400">Processing...</p>}
      </div>
    </section>
  )
}
