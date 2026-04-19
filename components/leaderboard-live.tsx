'use client'

import { useEffect, useMemo, useState } from 'react'
import AnimatedList from './animated-list'

interface LeaderboardEntry {
  id: string
  teamName: string
  projectTitle: string
  score: number
  isDisqualified: boolean
}

interface RankedLeaderboardEntry extends LeaderboardEntry {
  displayRank: number
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
  problemStatementsDownload: boolean
  qualifiedTeams: boolean
}

export default function LeaderboardLive() {
  const storageKey = 'sb_leaderboard_updated_at'
  const [entries, setEntries] = useState<LeaderboardEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isLive, setIsLive] = useState(false)

  const fetchData = async (mode: 'initial' | 'manual' | 'poll' = 'poll') => {
    if (mode === 'initial') {
      setLoading(true)
    }

    if (mode === 'manual') {
      setRefreshing(true)
    }

    setError(null)

    try {
      const [response, publishResponse] = await Promise.all([
        fetch('/api/leaderboard?sortBy=score', { cache: 'no-store' }),
        fetch('/api/publish-state', { cache: 'no-store' }),
      ])
      const json = (await response.json()) as ApiResponse<LeaderboardEntry[]>
      const publishJson = (await publishResponse.json()) as ApiResponse<PublishState>

      if (!response.ok || !json.success) {
        throw new Error(json.error || 'Failed to fetch leaderboard')
      }

      setEntries(json.data ?? [])
      if (publishJson.success && publishJson.data) {
        setIsLive(Boolean(publishJson.data.leaderboard))
      }
    } catch (fetchError) {
      setError(fetchError instanceof Error ? fetchError.message : 'Failed to load leaderboard')
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => {
    void fetchData('initial')

    let channel: BroadcastChannel | null = null
    let lastSeenUpdate = localStorage.getItem(storageKey) ?? ''
    const watchId = window.setInterval(() => {
      const currentUpdate = localStorage.getItem(storageKey) ?? ''
      if (currentUpdate && currentUpdate !== lastSeenUpdate) {
        lastSeenUpdate = currentUpdate
        void fetchData('poll')
      }
    }, 1000)

    const handleStorageUpdate = (event: StorageEvent) => {
      if (event.key === storageKey) {
        lastSeenUpdate = event.newValue ?? ''
        void fetchData('poll')
      }
    }

    if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
      channel = new BroadcastChannel('sb_admin_updates')
      channel.onmessage = (event: MessageEvent<{ type?: string }>) => {
        if (event.data?.type === 'leaderboard-updated') {
          void fetchData('poll')
        }
      }
    }

    window.addEventListener('storage', handleStorageUpdate)

    return () => {
      window.clearInterval(watchId)
      window.removeEventListener('storage', handleStorageUpdate)
      channel?.close()
    }
  }, [])

  const rankedEntries = useMemo<RankedLeaderboardEntry[]>(() => {
    const sortedEntries = [...entries].sort((left, right) => {
      if (left.isDisqualified !== right.isDisqualified) {
        return left.isDisqualified ? 1 : -1
      }

      return right.score - left.score || left.teamName.localeCompare(right.teamName)
    })

    let previousScore: number | null = null
    let previousWasDisqualified = false
    let previousRank = 0

    return sortedEntries.map((entry, index) => {
      const sameRankingGroup =
        previousScore !== null &&
        entry.score === previousScore &&
        entry.isDisqualified === previousWasDisqualified

      const displayRank = sameRankingGroup ? previousRank : previousRank + 1

      previousScore = entry.score
      previousWasDisqualified = entry.isDisqualified
      previousRank = displayRank

      return {
        ...entry,
        displayRank,
      }
    })
  }, [entries])

  const disqualifiedCount = useMemo(() => rankedEntries.filter((item) => item.isDisqualified).length, [rankedEntries])

  const getRankColor = (rank: number) => {
    if (rank === 1) return 'text-amber-600 dark:text-yellow-300'
    if (rank === 2) return 'text-cyan-700 dark:text-cyan-300'
    if (rank === 3) return 'text-fuchsia-700 dark:text-fuchsia-300'
    return 'text-sky-700 dark:text-sky-300'
  }

  const getContent = () => {
    if (loading) {
      return <div className="p-8 text-center text-muted-foreground">Loading leaderboard...</div>
    }

    if (error) {
      return <div className="p-8 text-center text-red-400">{error}</div>
    }

    if (rankedEntries.length === 0) {
      return <div className="p-8 text-center text-muted-foreground">No leaderboard entries published yet.</div>
    }

    if (!isLive) {
      return <div className="p-8 text-center text-muted-foreground">Leaderboard is not live yet.</div>
    }

    return (
      <>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="glass-effect rounded-xl p-4">
            <p className="text-xs uppercase tracking-wider text-muted-foreground">Teams</p>
            <p className="text-2xl font-black text-cyan-700 dark:text-cyan-300">{entries.length}</p>
          </div>
          <div className="glass-effect rounded-xl p-4">
            <p className="text-xs uppercase tracking-wider text-muted-foreground">Status</p>
            <p className="text-2xl font-black text-cyan-700 dark:text-cyan-300">{isLive ? 'Live' : 'Offline'}</p>
          </div>
          <div className="glass-effect rounded-xl p-4">
            <p className="text-xs uppercase tracking-wider text-muted-foreground">Disqualified</p>
            <p className="text-2xl font-black text-red-500 dark:text-red-300">{disqualifiedCount}</p>
          </div>
        </div>

        <div className="rounded-2xl border border-secondary/20 bg-card/75 backdrop-blur p-2 sm:p-3">
          <div className="hidden sm:grid grid-cols-10 px-4 py-2 mb-1 text-[11px] uppercase tracking-wider text-muted-foreground font-semibold">
            <p className="col-span-1">Rank</p>
            <p className="col-span-4">Team</p>
            <p className="col-span-3">Team ID</p>
            <p className="col-span-2 text-right">Score</p>
          </div>

          <AnimatedList
            items={rankedEntries}
            getItemKey={(item) => (item as RankedLeaderboardEntry).id}
            onItemSelect={(item, index) =>
              console.log('Selected leaderboard item:', (item as RankedLeaderboardEntry).teamName, index)
            }
            renderItem={(item, _index, isSelected) => {
              const entry = item as RankedLeaderboardEntry

              return (
                <div
                  className={`rounded-xl border p-3 sm:p-4 transition-all duration-200 ${
                    isSelected
                      ? 'bg-cyan-500/15 border-cyan-400/50 shadow-[0_0_18px_rgba(6,182,212,0.2)]'
                      : 'bg-background/85 border-secondary/20'
                  }`}
                >
                  <div className="sm:grid sm:grid-cols-10 sm:items-center gap-2">
                    <div className="sm:col-span-1 flex items-center justify-between sm:justify-start">
                      <div className="flex flex-col gap-1">
                        <p className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground sm:hidden">Rank</p>
                        <div className={`inline-flex items-center justify-center rounded-full px-3 py-1 text-sm font-black border ${
                          entry.isDisqualified
                            ? 'bg-red-500/10 text-red-500 dark:text-red-300 border-red-500/30'
                            : 'bg-cyan-500/10 border-cyan-500/30 '
                        }`}>
                          <span className={entry.isDisqualified ? '' : getRankColor(entry.displayRank)}>
                            {entry.isDisqualified ? 'DQ' : `#${entry.displayRank}`}
                          </span>
                        </div>
                      </div>
                      <p className="sm:hidden text-sm font-black text-cyan-700 dark:text-cyan-300">{entry.score} pts</p>
                    </div>

                    <div className="sm:col-span-4 mt-1 sm:mt-0">
                      <p className="text-sm sm:text-base font-bold text-foreground leading-tight">{entry.teamName}</p>
                      {entry.isDisqualified && (
                        <span className="mt-1 inline-flex rounded-full px-2 py-0.5 text-[10px] font-bold uppercase bg-red-500/20 text-red-500 dark:text-red-300 border border-red-500/40">
                          Disqualified
                        </span>
                      )}
                    </div>

                    <div className="sm:col-span-3 mt-1 sm:mt-0">
                      <p className="text-[11px] uppercase tracking-wider text-muted-foreground">Team ID</p>
                      <p className="text-xs sm:text-sm text-foreground/90 leading-tight font-semibold">{entry.projectTitle || '-'}</p>
                    </div>

                    <div className="hidden sm:block sm:col-span-2 text-right">
                      <p className="text-sm font-black text-cyan-700 dark:text-cyan-300">{entry.score} pts</p>
                    </div>
                  </div>
                </div>
              )
            }}
            showGradients
            enableArrowNavigation
            displayScrollbar
          />
        </div>
      </>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <button
          onClick={() => void fetchData('manual')}
          disabled={refreshing}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider bg-cyan-500 text-slate-950 hover:brightness-110 transition disabled:opacity-60"
        >
          {refreshing ? 'Refreshing...' : 'Refresh'}
        </button>
      </div>

      {getContent()}
    </div>
  )
}
