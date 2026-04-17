export interface LeaderboardEntry {
  id: string
  rank: number
  teamName: string
  projectTitle: string
  score: number
}

export interface WinnerEntry {
  id: string
  rank: number
  teamName: string
  title: string
  prizeAmount: string
}

export interface ProblemStatementEntry {
  id: string
  title: string
  domain: string
  description: string
  pdfLink: string
}

export interface PublishState {
  leaderboard: boolean
  winners: boolean
  problemStatements: boolean
  problemStatementsDownload: boolean
}

const globalStore = globalThis as unknown as {
  __sb_leaderboard__?: LeaderboardEntry[]
  __sb_winners__?: WinnerEntry[]
  __sb_problem_statements__?: ProblemStatementEntry[]
  __sb_publish_state__?: PublishState
}

if (!globalStore.__sb_leaderboard__) {
  globalStore.__sb_leaderboard__ = []
}

if (!globalStore.__sb_winners__) {
  globalStore.__sb_winners__ = []
}

if (!globalStore.__sb_problem_statements__) {
  globalStore.__sb_problem_statements__ = []
}

if (!globalStore.__sb_publish_state__) {
  globalStore.__sb_publish_state__ = {
    leaderboard: false,
    winners: false,
    problemStatements: false,
    problemStatementsDownload: false,
  }
}

export const leaderboardStore = globalStore.__sb_leaderboard__
export const winnersStore = globalStore.__sb_winners__
export const problemStatementsStore = globalStore.__sb_problem_statements__
export const publishStateStore = globalStore.__sb_publish_state__
