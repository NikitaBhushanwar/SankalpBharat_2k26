'use client'

import { useEffect, useMemo, useState } from 'react'
import { Search } from 'lucide-react'

interface QualifiedTeamEntry {
  id: string
  teamName: string
  logoUrl: string
  participantNames: string[]
  collegeName: string
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

export default function QualifiedTeamsLive() {
  const [teams, setTeams] = useState<QualifiedTeamEntry[]>([])
  const [search, setSearch] = useState('')
  const [activeCardId, setActiveCardId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isLive, setIsLive] = useState(false)

  useEffect(() => {
    const fetchTeams = async () => {
      try {
        const [response, publishResponse] = await Promise.all([
          fetch('/api/qualified-teams', { cache: 'no-store' }),
          fetch('/api/publish-state', { cache: 'no-store' }),
        ])

        const json = (await response.json()) as ApiResponse<QualifiedTeamEntry[]>
        const publishJson = (await publishResponse.json()) as ApiResponse<PublishState>

        if (!response.ok || !json.success) {
          throw new Error(json.error || 'Failed to fetch qualified teams')
        }

        setTeams(json.data ?? [])
        if (publishJson.success && publishJson.data) {
          setIsLive(Boolean(publishJson.data.qualifiedTeams))
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
      const participantMatch = team.participantNames.some((name) => name.toLowerCase().includes(query))
      return teamMatch || collegeMatch || participantMatch
    })
  }, [teams, search])

  if (loading) {
    return <div className="p-8 text-center text-slate-400">Loading qualified teams...</div>
  }

  if (error) {
    return <div className="p-8 text-center text-red-400">{error}</div>
  }

  if (!isLive) {
    return <div className="p-8 text-center text-slate-400">Qualified teams are not live yet.</div>
  }

  return (
    <div className="space-y-6">
      <div className="relative max-w-xl mx-auto">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by team, participant, or college"
          className="w-full rounded-xl border border-cyan-500/30 bg-slate-900/70 pl-10 pr-4 py-2.5 text-sm text-white placeholder:text-slate-400 focus:outline-none focus:border-cyan-400"
        />
      </div>

      {filteredTeams.length === 0 ? (
        <div className="rounded-2xl border border-cyan-500/20 bg-slate-900/50 p-10 text-center text-slate-400">
          No matching qualified teams found.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredTeams.map((team) => (
            <div key={team.id} className="group [perspective:1000px]">
              <button
                type="button"
                onClick={() => setActiveCardId((prev) => (prev === team.id ? null : team.id))}
                className={`relative h-[360px] w-full rounded-2xl transition-transform duration-500 [transform-style:preserve-3d] text-left ${
                  activeCardId === team.id ? '[transform:rotateY(180deg)]' : 'group-hover:[transform:rotateY(180deg)]'
                }`}
              >
                <div className="absolute inset-0 rounded-2xl border border-cyan-500/20 bg-slate-900/80 p-5 [backface-visibility:hidden]">
                  <div className="h-44 rounded-xl border border-slate-700 bg-slate-950 flex items-center justify-center p-4 mb-4">
                    <img
                      src={team.logoUrl}
                      alt={team.teamName}
                      className="max-h-full max-w-full object-contain"
                      onError={(e) => {
                        e.currentTarget.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="120" height="80" viewBox="0 0 120 80"%3E%3Crect fill="%23f0f0f0" width="120" height="80"/%3E%3Ctext x="60" y="40" font-size="12" text-anchor="middle" dy=".3em" fill="%23999"%3ELogo%3C/text%3E%3C/svg%3E'
                      }}
                    />
                  </div>
                  <h3 className="text-xl font-black text-white mb-2 line-clamp-2">{team.teamName}</h3>
                  <p className="text-sm text-slate-400 line-clamp-2">{team.collegeName}</p>
                  <p className="mt-3 text-xs uppercase tracking-wider text-cyan-300 font-bold">
                    <span className="hidden sm:inline">Hover to see members</span>
                    <span className="sm:hidden">Tap to see details</span>
                  </p>
                </div>

                <div className="absolute inset-0 rounded-2xl border border-cyan-400/30 bg-gradient-to-br from-cyan-950/80 to-slate-900/90 p-5 [backface-visibility:hidden] [transform:rotateY(180deg)]">
                  <h4 className="text-xs uppercase tracking-widest text-cyan-300 font-bold mb-2">Team Members</h4>
                  <ul className="space-y-2 mb-4">
                    {team.participantNames.map((name, index) => (
                      <li key={`${team.id}-${name}-${index}`} className="text-sm text-slate-100 rounded-lg bg-slate-800/70 border border-slate-700 px-3 py-2">
                        {name}
                      </li>
                    ))}
                  </ul>
                  <div className="mt-auto">
                    <p className="text-xs uppercase tracking-widest text-cyan-300 font-bold mb-1">College</p>
                    <p className="text-sm text-slate-200">{team.collegeName}</p>
                  </div>
                  <p className="mt-3 text-xs uppercase tracking-wider text-cyan-300 font-bold sm:hidden">Tap again to flip back</p>
                </div>
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
