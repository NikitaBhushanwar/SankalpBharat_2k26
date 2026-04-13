'use client'

import { useEffect, useMemo, useState } from 'react'
import { Search } from 'lucide-react'

interface QualifiedTeamEntry {
  id: string
  teamId: string
  teamName: string
  logoUrl?: string
  collegeName: string
  sequenceNo: number
}

interface FinalistTeamEntry {
  id: string
  teamId: string
  teamName: string
  logoUrl?: string
  teamLeaderName: string
  collegeName: string
  sequenceNo: number
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

type SearchScope = 'grandFinalists' | 'qualified'

export default function QualifiedTeamsLive() {
  const [teams, setTeams] = useState<QualifiedTeamEntry[]>([])
  const [finalistTeams, setFinalistTeams] = useState<FinalistTeamEntry[]>([])
  const [search, setSearch] = useState('')
  const [searchScope, setSearchScope] = useState<SearchScope>('grandFinalists')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isLive, setIsLive] = useState(false)
  const [isFinalistsLive, setIsFinalistsLive] = useState(false)

  useEffect(() => {
    const fetchTeams = async () => {
      try {
        const [response, finalistResponse, publishResponse] = await Promise.all([
          fetch('/api/qualified-teams', { cache: 'no-store' }),
          fetch('/api/finalist-teams', { cache: 'no-store' }),
          fetch('/api/publish-state', { cache: 'no-store' }),
        ])

        const json = (await response.json()) as ApiResponse<QualifiedTeamEntry[]>
        const finalistJson = (await finalistResponse.json()) as ApiResponse<FinalistTeamEntry[]>
        const publishJson = (await publishResponse.json()) as ApiResponse<PublishState>

        if (!response.ok || !json.success) {
          throw new Error(json.error || 'Failed to fetch qualified teams')
        }

        if (!finalistResponse.ok || !finalistJson.success) {
          throw new Error(finalistJson.error || 'Failed to fetch finalist teams')
        }

        setTeams(json.data ?? [])
        setFinalistTeams(finalistJson.data ?? [])
        if (publishJson.success && publishJson.data) {
          setIsLive(Boolean(publishJson.data.qualifiedTeams))
          setIsFinalistsLive(Boolean(publishJson.data.finalistTeams))
        }
      } catch (fetchError) {
        setError(fetchError instanceof Error ? fetchError.message : 'Failed to fetch qualified teams')
      } finally {
        setLoading(false)
      }
    }

    void fetchTeams()
  }, [])

  const filteredTeams = useMemo(() => {
    const query = search.trim().toLowerCase()
    if (!query) return teams

    return teams.filter((team) => {
      const teamMatch = team.teamName.toLowerCase().includes(query)
      const collegeMatch = team.collegeName.toLowerCase().includes(query)
      const idMatch = team.teamId.toLowerCase().includes(query)
      return teamMatch || collegeMatch || idMatch
    })
  }, [teams, search])

  const filteredFinalistTeams = useMemo(() => {
    const query = search.trim().toLowerCase()
    if (!query) return finalistTeams

    return finalistTeams.filter((team) => {
      const teamMatch = team.teamName.toLowerCase().includes(query)
      const collegeMatch = team.collegeName.toLowerCase().includes(query)
      const idMatch = team.teamId.toLowerCase().includes(query)
      const leaderMatch = team.teamLeaderName.toLowerCase().includes(query)
      return teamMatch || collegeMatch || idMatch || leaderMatch
    })
  }, [finalistTeams, search])

  const visibleFinalists = useMemo(
    () => (searchScope === 'grandFinalists' ? filteredFinalistTeams : finalistTeams),
    [filteredFinalistTeams, finalistTeams, searchScope]
  )

  const visibleQualified = useMemo(
    () => (searchScope === 'qualified' ? filteredTeams : teams),
    [filteredTeams, teams, searchScope]
  )

  const showGrandFinalistsSection = searchScope === 'grandFinalists'
  const showQualifiedSection = searchScope === 'qualified'

  if (loading) {
    return <div className="p-8 text-center text-slate-400">Loading qualified teams...</div>
  }

  if (error) {
    return <div className="p-8 text-center text-red-400">{error}</div>
  }

  if (!isLive && !isFinalistsLive) {
    return <div className="p-8 text-center text-slate-400">Teams are not live yet.</div>
  }

  return (
    <div className="space-y-6">
      <div className="max-w-xl mx-auto flex flex-col sm:flex-row gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={searchScope === 'grandFinalists' ? 'Search grand finalists by team, leader, college, or team id' : 'Search qualified teams by team, college, or team id'}
            className="w-full rounded-xl border border-cyan-500/30 bg-slate-900/70 pl-10 pr-4 py-2.5 text-sm text-white placeholder:text-slate-400 focus:outline-none focus:border-cyan-400"
          />
        </div>
        <select
          value={searchScope}
          onChange={(e) => setSearchScope(e.target.value as SearchScope)}
          className="rounded-xl border border-cyan-500/30 bg-slate-900/70 px-3 py-2.5 text-sm font-semibold text-white focus:outline-none focus:border-cyan-400"
        >
          <option value="grandFinalists">Grand Finalists</option>
          <option value="qualified">Qualified Teams</option>
        </select>
      </div>

      <div className="space-y-8">
          {showGrandFinalistsSection && (
          <div className="space-y-4">
            <div className="text-center">
              <h2 className="text-xl sm:text-2xl font-black text-emerald-300">Grand Finalist Teams</h2>
              <p className="text-xs text-slate-400 mt-1">Teams selected for the grand finalist stage with team leader details.</p>
            </div>

            {!isFinalistsLive ? (
              <div className="rounded-2xl border border-emerald-500/20 bg-slate-900/50 p-8 text-center text-slate-400">
                Grand finalist teams are not live yet.
              </div>
            ) : visibleFinalists.length === 0 ? (
              <div className="rounded-2xl border border-emerald-500/20 bg-slate-900/50 p-8 text-center text-slate-400">
                No matching grand finalist teams found.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {visibleFinalists.map((team) => (
                  <div key={team.id} className="relative rounded-[1.5rem] border border-emerald-500/20 bg-slate-900/80 p-5 shadow-[0_18px_60px_rgba(2,6,23,0.32)] overflow-hidden">
                    <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(16,185,129,0.16),transparent_34%),radial-gradient(circle_at_bottom_right,rgba(6,182,212,0.08),transparent_30%)]" />
                    <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-emerald-300/60 to-transparent" />

                    <div className="relative space-y-4">
                      <div>
                        <p className="text-[10px] uppercase tracking-[0.2em] text-emerald-300 font-bold">Team Name</p>
                        <h3 className="mt-2 text-[1.45rem] sm:text-[1.65rem] font-black leading-[1.04] text-white line-clamp-2">
                          {team.teamName}
                        </h3>
                      </div>

                      <div className="rounded-[1.15rem] border border-slate-700 bg-slate-950/70 px-4 py-3">
                        <p className="text-[10px] uppercase tracking-[0.2em] text-emerald-300 font-bold">Team Leader</p>
                        <p className="mt-2 text-base font-semibold text-slate-100 line-clamp-2">{team.teamLeaderName}</p>
                      </div>

                      <div className="rounded-[1.15rem] border border-slate-700 bg-slate-950/70 px-4 py-3">
                        <p className="text-[10px] uppercase tracking-[0.2em] text-emerald-300 font-bold">College Name</p>
                        <p className="mt-2 text-base font-semibold text-slate-100 line-clamp-2">{team.collegeName}</p>
                      </div>

                      <div className="rounded-[1.15rem] border border-slate-700 bg-slate-950/70 px-4 py-3">
                        <p className="text-[10px] uppercase tracking-[0.2em] text-emerald-300 font-bold">Team ID</p>
                        <p className="mt-2 text-sm font-mono text-slate-200 break-all">{team.teamId}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          )}

          {showQualifiedSection && (
          <div className="space-y-4">
            <div className="text-center">
              <h2 className="text-xl sm:text-2xl font-black text-cyan-300">Qualified Teams (General)</h2>
              <p className="text-xs text-slate-400 mt-1">Teams qualified for the online round.</p>
            </div>

            {!isLive ? (
              <div className="rounded-2xl border border-cyan-500/20 bg-slate-900/50 p-8 text-center text-slate-400">
                Qualified teams are not live yet.
              </div>
            ) : visibleQualified.length === 0 ? (
              <div className="rounded-2xl border border-cyan-500/20 bg-slate-900/50 p-8 text-center text-slate-400">
                No matching qualified teams found.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {visibleQualified.map((team) => (
                  <div key={team.id} className="relative rounded-[1.5rem] border border-cyan-500/20 bg-slate-900/80 p-5 shadow-[0_18px_60px_rgba(2,6,23,0.32)] overflow-hidden">
                    <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(6,182,212,0.12),transparent_34%),radial-gradient(circle_at_bottom_right,rgba(52,211,153,0.08),transparent_30%)]" />
                    <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-cyan-300/60 to-transparent" />

                    <div className="relative space-y-4">
                      <div>
                        <p className="text-[10px] uppercase tracking-[0.2em] text-cyan-300 font-bold">Team Name</p>
                        <h3 className="mt-2 text-[1.45rem] sm:text-[1.65rem] font-black leading-[1.04] text-white line-clamp-2">
                          {team.teamName}
                        </h3>
                      </div>

                      <div className="rounded-[1.15rem] border border-slate-700 bg-slate-950/70 px-4 py-3">
                        <p className="text-[10px] uppercase tracking-[0.2em] text-cyan-300 font-bold">College Name</p>
                        <p className="mt-2 text-base font-semibold text-slate-100 line-clamp-2">{team.collegeName}</p>
                      </div>

                      <div className="rounded-[1.15rem] border border-slate-700 bg-slate-950/70 px-4 py-3">
                        <p className="text-[10px] uppercase tracking-[0.2em] text-cyan-300 font-bold">Team ID</p>
                        <p className="mt-2 text-sm font-mono text-slate-200 break-all">{team.teamId}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          )}
      </div>
    </div>
  )
}
