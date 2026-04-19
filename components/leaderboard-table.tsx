'use client'

import { useState } from 'react'
import { ChevronUp, ChevronDown, Trophy } from 'lucide-react'

interface LeaderboardEntry {
  rank: number
  teamName: string
  projectTitle: string
  score: number
}

const leaderboardData: LeaderboardEntry[] = []

type SortField = 'rank' | 'score' | 'name'
type SortOrder = 'asc' | 'desc'

export function LeaderboardTable() {
  const [sortField, setSortField] = useState<SortField>('rank')
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc')

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortOrder('asc')
    }
  }

  const sortedData = [...leaderboardData].sort((a, b) => {
    let compareValue = 0

    switch (sortField) {
      case 'rank':
        compareValue = a.rank - b.rank
        break
      case 'score':
        compareValue = a.score - b.score
        break
      case 'name':
        compareValue = a.teamName.localeCompare(b.teamName)
        break
    }

    return sortOrder === 'asc' ? compareValue : -compareValue
  })

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) return null
    return sortOrder === 'asc' ? (
      <ChevronUp className="w-4 h-4" />
    ) : (
      <ChevronDown className="w-4 h-4" />
    )
  }

  if (sortedData.length === 0) {
    return (
      <div className="py-14 text-center">
        <p className="text-lg font-semibold text-muted-foreground">No leaderboard data available yet.</p>
      </div>
    )
  }

  return (
    <div className="w-full overflow-x-auto">
      {/* Desktop table */}
      <div className="hidden md:block">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left py-4 px-6 font-semibold text-muted-foreground text-sm">
                <button
                  onClick={() => handleSort('rank')}
                  className="flex items-center gap-2 hover:text-accent transition-colors"
                >
                  Rank <SortIcon field="rank" />
                </button>
              </th>
              <th className="text-left py-4 px-6 font-semibold text-muted-foreground text-sm">
                <button
                  onClick={() => handleSort('name')}
                  className="flex items-center gap-2 hover:text-accent transition-colors"
                >
                  Team Name <SortIcon field="name" />
                </button>
              </th>
              <th className="text-left py-4 px-6 font-semibold text-muted-foreground text-sm">
                Project Title
              </th>
              <th className="text-right py-4 px-6 font-semibold text-muted-foreground text-sm">
                <button
                  onClick={() => handleSort('score')}
                  className="flex items-center justify-end gap-2 w-full hover:text-accent transition-colors"
                >
                  Score <SortIcon field="score" />
                </button>
              </th>
            </tr>
          </thead>
          <tbody>
            {sortedData.map((entry, index) => (
              <tr
                key={entry.rank}
                className="border-b border-border/50 hover:bg-muted/30 transition-colors duration-300 group"
              >
                {/* Rank */}
                <td className="py-4 px-6">
                  <div className="flex items-center gap-3">
                    {index < 3 && (
                      <Trophy className="w-5 h-5 text-accent" />
                    )}
                    <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-accent/10 border border-accent/30 group-hover:glow-accent transition-all">
                      <span className="font-bold text-accent text-sm">#{entry.rank}</span>
                    </div>
                  </div>
                </td>

                {/* Team name */}
                <td className="py-4 px-6">
                  <p className="font-semibold text-foreground">{entry.teamName}</p>
                </td>

                {/* Project */}
                <td className="py-4 px-6">
                  <p className="text-foreground truncate">{entry.projectTitle}</p>
                </td>

                {/* Score */}
                <td className="py-4 px-6">
                  <div className="text-right">
                    <span className="text-2xl font-bold text-accent group-hover:text-secondary transition-colors">
                      {entry.score.toLocaleString()}
                    </span>
                    <p className="text-xs text-muted-foreground mt-1">pts</p>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile cards */}
      <div className="md:hidden space-y-4">
        {sortedData.map((entry, index) => (
          <div
            key={entry.rank}
            className="glass-effect rounded-lg p-4 hover:glow-accent transition-all duration-300 group"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-2">
                {index < 3 && (
                  <Trophy className="w-4 h-4 text-accent" />
                )}
                <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-accent/10 border border-accent/30">
                  <span className="font-bold text-accent text-sm">#{entry.rank}</span>
                </div>
              </div>
              <span className="text-2xl font-bold text-accent">{entry.score.toLocaleString()}</span>
            </div>
            <h4 className="font-semibold text-foreground mb-1">{entry.teamName}</h4>
            <p className="text-sm text-muted-foreground mb-3">{entry.projectTitle}</p>
            <div className="flex items-center justify-end text-xs text-muted-foreground">
              <span className="text-secondary font-semibold">pts</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
