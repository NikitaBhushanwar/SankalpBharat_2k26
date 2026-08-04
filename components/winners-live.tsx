'use client'

import { useEffect, useState } from 'react'

interface WinnerEntry {
  id: string
  rank: number
  teamName: string
  title: string
  placeTitle: string
  collegeName: string
  members: string[]
  imageUrl: string
  prizeAmount: string
}

interface WinnerMeta {
  placeTitle?: string
  collegeName?: string
  members?: string[]
  imageUrl?: string
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
  finalistTeams: boolean
}

const WINNER_META_PREFIX = '__SB_WINNER_META__'

function parseLegacyWinnerMeta(title: string): { displayTitle: string; meta: WinnerMeta } {
  if (!title.startsWith(WINNER_META_PREFIX)) {
    return { displayTitle: title, meta: {} }
  }

  const raw = title.slice(WINNER_META_PREFIX.length)
  try {
    const parsed = JSON.parse(raw) as WinnerMeta
    return {
      displayTitle: parsed.placeTitle?.trim() || '',
      meta: {
        placeTitle: parsed.placeTitle?.trim() || undefined,
        collegeName: parsed.collegeName?.trim() || undefined,
        members: Array.isArray(parsed.members)
          ? parsed.members
              .map((member) => String(member).trim())
              .filter(Boolean)
          : [],
        imageUrl: parsed.imageUrl?.trim() || undefined,
      },
    }
  } catch {
    return { displayTitle: title, meta: {} }
  }
}

function getRankStyle(rank: number) {
  if (rank === 1) {
    return {
      border: 'border-amber-400/45',
      badge: 'bg-amber-500/20 text-amber-300 border-amber-400/50',
      ring: 'shadow-[0_0_0_1px_rgba(251,191,36,0.22),0_28px_70px_rgba(251,191,36,0.12)]',
    }
  }

  if (rank === 2) {
    return {
      border: 'border-slate-300/35',
      badge: 'bg-slate-300/15 text-slate-200 border-slate-300/40',
      ring: 'shadow-[0_0_0_1px_rgba(203,213,225,0.2),0_24px_64px_rgba(148,163,184,0.12)]',
    }
  }

  return {
    border: 'border-orange-400/35',
    badge: 'bg-orange-500/15 text-orange-300 border-orange-400/45',
    ring: 'shadow-[0_0_0_1px_rgba(251,146,60,0.2),0_24px_64px_rgba(249,115,22,0.11)]',
  }
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
    return <div className="p-8 text-center text-muted-foreground">Loading winners...</div>
  }

  if (error) {
    return <div className="p-8 text-center text-red-400">{error}</div>
  }

  if (winners.length === 0) {
    return <div className="p-8 text-center text-muted-foreground">Winners have not been announced yet.</div>
  }

  if (!isLive) {
    return <div className="p-8 text-center text-muted-foreground">Winners are not live yet.</div>
  }

  return (
    <div className="space-y-5">
      {winners.map((winner) => {
        const { displayTitle: legacyDisplayTitle, meta: legacyMeta } = parseLegacyWinnerMeta(winner.title)
        const displayTitle = winner.placeTitle || legacyDisplayTitle
        const imageUrl = winner.imageUrl || legacyMeta.imageUrl
        const collegeName = winner.collegeName || legacyMeta.collegeName
        const members = winner.members?.length ? winner.members : legacyMeta.members
        const rankStyle = getRankStyle(winner.rank)

        return (
          <article
            key={winner.id}
            className={`relative overflow-hidden rounded-2xl border bg-card/75 backdrop-blur p-4 sm:p-5 ${rankStyle.border} ${rankStyle.ring}`}
          >
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(8,145,178,0.12),transparent_34%),radial-gradient(circle_at_bottom_left,rgba(14,116,144,0.1),transparent_36%)]" />

            <div className="relative grid gap-4 lg:grid-cols-[260px_minmax(0,1fr)]">
              <div className="rounded-xl border border-cyan-500/20 bg-slate-900/65 p-2">
                <div className="relative h-56 w-full overflow-hidden rounded-lg bg-slate-950 flex items-center justify-center">
                  <div className="absolute inset-0 flex items-center justify-center text-xs font-semibold uppercase tracking-widest text-slate-400">
                    Team image
                  </div>
                  {imageUrl ? (
                    <img
                      src={imageUrl}
                      alt={`${winner.teamName} team photo`}
                      className="relative h-full w-full object-contain"
                      onError={(event) => {
                        event.currentTarget.style.display = 'none'
                      }}
                    />
                  ) : null}
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex flex-wrap items-center gap-2">
                  <span className={`inline-flex rounded-full border px-3 py-1 text-xs font-black uppercase tracking-wider ${rankStyle.badge}`}>
                    {displayTitle || `Rank #${winner.rank}`}
                  </span>
                  <span className="inline-flex rounded-full border border-cyan-500/30 bg-cyan-500/10 px-3 py-1 text-xs font-bold uppercase tracking-wider text-cyan-200">
                    Prize {winner.prizeAmount}
                  </span>
                </div>

                <div>
                  <h3 className="text-2xl sm:text-3xl font-black text-white">Team {winner.teamName}</h3>
                  {collegeName ? (
                    <p className="mt-1 text-sm sm:text-base font-semibold text-slate-200">{collegeName}</p>
                  ) : null}
                </div>

                {members && members.length > 0 ? (
                  <div className="rounded-xl border border-cyan-500/20 bg-slate-900/60 p-3">
                    <p className="text-[11px] uppercase tracking-[0.22em] font-bold text-cyan-300">Team Members</p>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {members.map((member) => (
                        <span
                          key={member}
                          className="inline-flex rounded-full border border-slate-600 bg-slate-800/70 px-2.5 py-1 text-xs font-semibold text-slate-100"
                        >
                          {member}
                        </span>
                      ))}
                    </div>
                  </div>
                ) : null}
              </div>
            </div>
          </article>
        )
      })}
    </div>
  )
}
