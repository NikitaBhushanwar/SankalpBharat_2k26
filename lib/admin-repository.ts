import type { SupabaseClient } from '@supabase/supabase-js'

export const DEFAULT_REGISTRATION_LINK = 'https://unstop.com/'
const REGISTRATION_LINK_SETTING_KEY = 'registration_link'

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

export type PublishSection = 'leaderboard' | 'winners' | 'problemStatements' | 'problemStatementsDownload'

interface LeaderboardRow {
  id: string
  rank: number
  team_name: string
  project_title: string
  score: number
  members: number
  created_at: string
}

interface WinnerRow {
  id: string
  rank: number
  team_name: string
  title: string
  prize_amount: string
  created_at: string
}

interface ProblemStatementRow {
  id: string
  title: string
  domain: string
  description: string
  pdf_link: string | null
  created_at: string
}

interface PublishStateRow {
  section: 'leaderboard' | 'winners' | 'problemStatements' | 'problemStatementsDownload'
  is_live: boolean
}

interface SiteSettingRow {
  key: string
  value_text: string | null
}

export const mapLeaderboardRow = (row: LeaderboardRow): LeaderboardEntry => ({
  id: row.id,
  rank: row.rank,
  teamName: row.team_name,
  projectTitle: row.project_title,
  score: row.score,
  members: row.members,
})

export const mapWinnerRow = (row: WinnerRow): WinnerEntry => ({
  id: row.id,
  rank: row.rank,
  teamName: row.team_name,
  title: row.title,
  prizeAmount: row.prize_amount,
})

export const mapProblemStatementRow = (row: ProblemStatementRow): ProblemStatementEntry => ({
  id: row.id,
  title: row.title,
  domain: row.domain,
  description: row.description,
  pdfLink: row.pdf_link ?? '',
})

export async function recomputeLeaderboardRanks(supabase: SupabaseClient) {
  const { data, error } = await supabase
    .from('leaderboard_entries')
    .select('id, score, created_at')
    .order('score', { ascending: false })
    .order('created_at', { ascending: true })

  if (error) {
    throw new Error(error.message)
  }

  const updates = (data ?? []).map((entry, index) =>
    supabase
      .from('leaderboard_entries')
      .update({ rank: index + 1 })
      .eq('id', entry.id)
  )

  await Promise.all(updates)
}

export async function recomputeWinnerRanks(supabase: SupabaseClient) {
  const { data, error } = await supabase
    .from('winners')
    .select('id, rank, created_at')
    .order('rank', { ascending: true })
    .order('created_at', { ascending: true })

  if (error) {
    throw new Error(error.message)
  }

  const updates = (data ?? []).map((entry, index) =>
    supabase
      .from('winners')
      .update({ rank: index + 1 })
      .eq('id', entry.id)
  )

  await Promise.all(updates)
}

export async function readPublishState(supabase: SupabaseClient): Promise<PublishState> {
  const defaults: PublishState = {
    leaderboard: false,
    winners: false,
    problemStatements: false,
    problemStatementsDownload: false,
  }

  const { data, error } = await supabase
    .from('publish_state')
    .select('section, is_live')

  if (error) {
    throw new Error(error.message)
  }

  ;(data as PublishStateRow[] | null)?.forEach((row) => {
    defaults[row.section] = Boolean(row.is_live)
  })

  return defaults
}

export async function writePublishState(
  supabase: SupabaseClient,
  section: PublishSection,
  value: boolean
) {
  const { error } = await supabase
    .from('publish_state')
    .upsert(
      {
        section,
        is_live: value,
      },
      { onConflict: 'section' }
    )

  if (error) {
    throw new Error(error.message)
  }
}

export async function readRegistrationLink(supabase: SupabaseClient): Promise<string> {
  const { data, error } = await supabase
    .from('site_settings')
    .select('key, value_text')
    .eq('key', REGISTRATION_LINK_SETTING_KEY)
    .maybeSingle<SiteSettingRow>()

  if (error) {
    throw new Error(error.message)
  }

  const value = data?.value_text?.trim()
  return value || DEFAULT_REGISTRATION_LINK
}

export async function writeRegistrationLink(supabase: SupabaseClient, link: string) {
  const { error } = await supabase
    .from('site_settings')
    .upsert(
      {
        key: REGISTRATION_LINK_SETTING_KEY,
        value_text: link,
      },
      { onConflict: 'key' }
    )

  if (error) {
    throw new Error(error.message)
  }
}
