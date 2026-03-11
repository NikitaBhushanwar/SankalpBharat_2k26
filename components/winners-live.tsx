'use client'

import { useEffect, useState } from 'react'

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

interface PublishState {
  leaderboard: boolean
  winners: boolean
  problemStatements: boolean
}

export default function WinnersLive() {
  const [winners, setWinners] = useState<WinnerEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isLive, setIsLive] = useState(false)

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      setError(null)

      try {
        const [response, publishResponse] = await Promise.all([
          fetch('/api/winners', { cache: 'no-store' }),
          fetch('/api/publish-state', { cache: 'no-store' }),
        ])
        const json = (await response.json()) as ApiResponse<WinnerEntry[]>
        const publishJson = (await publishResponse.json()) as ApiResponse<PublishState>

        if (!response.ok || !json.success) {
          throw new Error(json.error || 'Failed to fetch winners')
        }

        setWinners(json.data ?? [])
        if (publishJson.success && publishJson.data) {
          setIsLive(Boolean(publishJson.data.winners))
        }
      } catch (fetchError) {
        setError(fetchError instanceof Error ? fetchError.message : 'Failed to load winners')
      } finally {
        setLoading(false)
      }
    }

    void fetchData()
  }, [])

  if (loading) {
    return <div className="p-8 text-center text-slate-500 dark:text-slate-400">Loading winners...</div>
  }

  if (error) {
    return <div className="p-8 text-center text-red-400">{error}</div>
  }

  if (winners.length === 0) {
    return <div className="p-8 text-center text-slate-500 dark:text-slate-400">Winners have not been announced yet.</div>
  }

  if (!isLive) {
    return <div className="p-8 text-center text-slate-500 dark:text-slate-400">Winners are not live yet.</div>
  }

  return (
    <div className="space-y-3">
      {winners.map((winner) => (
        <div key={winner.id} className="rounded-xl border border-cyan-500/20 bg-white/80 dark:bg-teal-900/60 dark:backdrop-blur p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <p className="text-xs text-cyan-700 dark:text-cyan-300 font-bold uppercase tracking-wider">Rank #{winner.rank}</p>
            <p className="text-xl font-bold text-slate-900 dark:text-white">{winner.teamName}</p>
            <p className="text-sm text-slate-600 dark:text-slate-400">{winner.title}</p>
          </div>
          <p className="text-lg font-black text-cyan-700 dark:text-cyan-300">{winner.prizeAmount}</p>
        </div>
      ))}
    </div>
  )
}
