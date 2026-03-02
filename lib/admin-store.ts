export interface LeaderboardEntry {
  id: string
  rank: number
  teamName: string
  projectTitle: string
  score: number
  members: number
}

export interface WinnerEntry {
  id: string
  rank: number
  teamName: string
  title: string
  prizeAmount: string
}

const globalStore = globalThis as unknown as {
  __sb_leaderboard__?: LeaderboardEntry[]
  __sb_winners__?: WinnerEntry[]
}

if (!globalStore.__sb_leaderboard__) {
  globalStore.__sb_leaderboard__ = []
}

if (!globalStore.__sb_winners__) {
  globalStore.__sb_winners__ = []
}

export const leaderboardStore = globalStore.__sb_leaderboard__
export const winnersStore = globalStore.__sb_winners__
