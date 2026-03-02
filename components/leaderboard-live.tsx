'use client'

import { useEffect, useMemo, useState } from 'react'

interface LeaderboardEntry {
  id: string
  rank: number
  teamName: string
  projectTitle: string
  score: number
  members: number
}

interface ApiResponse<T> {
  success: boolean
  data: T
  error?: string
}

export default function LeaderboardLive() {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      setError(null)

      try {
        const response = await fetch('/api/leaderboard?sortBy=rank', { cache: 'no-store' })
        const json = (await response.json()) as ApiResponse<LeaderboardEntry[]>

        if (!response.ok || !json.success) {
          throw new Error(json.error || 'Failed to fetch leaderboard')
        }

        setEntries(json.data ?? [])
      } catch (fetchError) {
        setError(fetchError instanceof Error ? fetchError.message : 'Failed to load leaderboard')
      } finally {
        setLoading(false)
      }
    }

    void fetchData()
  }, [])

  const totalScore = useMemo(() => entries.reduce((acc, item) => acc + item.score, 0), [entries])

  if (loading) {
    return <div className="p-8 text-center text-slate-400">Loading leaderboard...</div>
  }

  if (error) {
    return <div className="p-8 text-center text-red-400">{error}</div>
  }

  if (entries.length === 0) {
    return <div className="p-8 text-center text-slate-400">No leaderboard entries published yet.</div>
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="glass-effect rounded-xl p-4">
          <p className="text-xs uppercase tracking-wider text-slate-400">Teams</p>
          <p className="text-2xl font-black text-emerald-400">{entries.length}</p>
        </div>
        <div className="glass-effect rounded-xl p-4">
          <p className="text-xs uppercase tracking-wider text-slate-400">Total Score</p>
          <p className="text-2xl font-black text-emerald-400">{totalScore}</p>
        </div>
        <div className="glass-effect rounded-xl p-4">
          <p className="text-xs uppercase tracking-wider text-slate-400">Status</p>
          <p className="text-2xl font-black text-emerald-400">Live</p>
        </div>
      </div>

      <div className="rounded-2xl border border-emerald-500/20 overflow-hidden">
        <div className="hidden md:grid grid-cols-12 bg-slate-900/80 px-4 py-3 text-xs font-bold uppercase tracking-wider text-slate-300">
          <div className="col-span-1">#</div>
          <div className="col-span-3">Team</div>
          <div className="col-span-4">Project</div>
          <div className="col-span-2">Score</div>
          <div className="col-span-2">Members</div>
        </div>
        <div className="hidden md:block">
          {entries.map((entry) => (
            <div key={entry.id} className="grid grid-cols-12 px-4 py-4 border-t border-emerald-500/10 bg-slate-950/40 text-sm text-slate-200">
              <div className="col-span-1 font-bold text-emerald-400">{entry.rank}</div>
              <div className="col-span-3 font-semibold">{entry.teamName}</div>
              <div className="col-span-4 text-slate-300">{entry.projectTitle}</div>
              <div className="col-span-2 font-bold">{entry.score}</div>
              <div className="col-span-2">{entry.members}</div>
            </div>
          ))}
        </div>

        <div className="md:hidden space-y-3 p-3">
          {entries.map((entry) => (
            <div key={entry.id} className="rounded-xl border border-emerald-500/20 bg-slate-900/60 p-3">
              <div className="flex justify-between">
                <p className="text-xs font-bold text-emerald-400">#{entry.rank}</p>
                <p className="text-sm font-bold text-white">{entry.score} pts</p>
              </div>
              <p className="text-lg font-bold text-white mt-1">{entry.teamName}</p>
              <p className="text-sm text-slate-400">{entry.projectTitle}</p>
              <p className="text-xs text-slate-400 mt-2">Members: {entry.members}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
