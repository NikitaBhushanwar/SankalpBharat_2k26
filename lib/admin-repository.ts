import type { SupabaseClient } from '@supabase/supabase-js'

export const DEFAULT_REGISTRATION_LINK = 'https://unstop.com/'
const REGISTRATION_LINK_SETTING_KEY = 'registration_link'
const NAVBAR_SHOW_LEADERBOARD_KEY = 'navbar_show_leaderboard'
const NAVBAR_SHOW_WINNERS_KEY = 'navbar_show_winners'
const NAVBAR_SHOW_QUALIFIED_TEAMS_KEY = 'navbar_show_qualified_teams'

export interface LeaderboardEntry {
  id: string
  rank: number
  teamName: string
  projectTitle: string
  score: number
  isDisqualified: boolean
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

export interface AnnouncementEntry {
  id: string
  title: string
  message: string
  tag: string
  createdAt: string
  updatedAt: string
}

export interface PublishState {
  leaderboard: boolean
  winners: boolean
  problemStatements: boolean
  problemStatementsDownload: boolean
  qualifiedTeams: boolean
}

export interface NavbarVisibilityState {
  leaderboard: boolean
  winners: boolean
  qualifiedTeams: boolean
}

export type PublishSection = 'leaderboard' | 'winners' | 'problemStatements' | 'problemStatementsDownload' | 'qualifiedTeams'

interface LeaderboardRow {
  id: string
  rank: number
  team_name: string
  project_title: string
  score: number
  is_disqualified: boolean
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

interface AnnouncementRow {
  id: string
  title: string
  message: string
  tag: string | null
  created_at: string
  updated_at: string
}

interface PublishStateRow {
  section: 'leaderboard' | 'winners' | 'problemStatements' | 'problemStatementsDownload' | 'qualifiedTeams'
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
  isDisqualified: row.is_disqualified,
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

export const mapAnnouncementRow = (row: AnnouncementRow): AnnouncementEntry => ({
  id: row.id,
  title: row.title,
  message: row.message,
  tag: row.tag?.trim() || 'Update',
  createdAt: row.created_at,
  updatedAt: row.updated_at,
})

export async function readAnnouncements(supabase: SupabaseClient, limit?: number): Promise<AnnouncementEntry[]> {
  let query = supabase
    .from('announcements')
    .select('*')
    .order('created_at', { ascending: false })
    .order('updated_at', { ascending: false })

  if (typeof limit === 'number' && Number.isFinite(limit) && limit > 0) {
    query = query.limit(limit)
  }

  const { data, error } = await query

  if (error) {
    throw new Error(error.message)
  }

  return (data as AnnouncementRow[] | null)?.map(mapAnnouncementRow) ?? []
}

export async function createAnnouncement(
  supabase: SupabaseClient,
  announcement: Omit<AnnouncementEntry, 'id' | 'createdAt' | 'updatedAt'>
) {
  const { data, error } = await supabase
    .from('announcements')
    .insert({
      title: announcement.title,
      message: announcement.message,
      tag: announcement.tag,
    })
    .select('*')
    .single<AnnouncementRow>()

  if (error) {
    throw new Error(error.message)
  }

  return mapAnnouncementRow(data)
}

export async function updateAnnouncement(
  supabase: SupabaseClient,
  id: string,
  announcement: Partial<Omit<AnnouncementEntry, 'id' | 'createdAt' | 'updatedAt'>>
) {
  const updateData: Record<string, unknown> = {
    updated_at: new Date().toISOString(),
  }

  if (announcement.title !== undefined) updateData.title = announcement.title
  if (announcement.message !== undefined) updateData.message = announcement.message
  if (announcement.tag !== undefined) updateData.tag = announcement.tag

  const { data, error } = await supabase
    .from('announcements')
    .update(updateData)
    .eq('id', id)
    .select('*')
    .single<AnnouncementRow>()

  if (error) {
    throw new Error(error.message)
  }

  return mapAnnouncementRow(data)
}

export async function deleteAnnouncement(supabase: SupabaseClient, id: string) {
  const { error } = await supabase
    .from('announcements')
    .delete()
    .eq('id', id)

  if (error) {
    throw new Error(error.message)
  }
}

export async function recomputeLeaderboardRanks(supabase: SupabaseClient) {
  const { data, error } = await supabase
    .from('leaderboard_entries')
    .select('id, score, is_disqualified, created_at')
    .order('created_at', { ascending: true })

  if (error) {
    throw new Error(error.message)
  }

  const rows = data ?? []
  const qualified = rows
    .filter((entry) => !entry.is_disqualified)
    .sort((a, b) => b.score - a.score || a.created_at.localeCompare(b.created_at))
  const disqualified = rows
    .filter((entry) => entry.is_disqualified)
    .sort((a, b) => b.score - a.score || a.created_at.localeCompare(b.created_at))

  const orderedRows = [...qualified, ...disqualified]

  const updates = orderedRows.map((entry, index) =>
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
    qualifiedTeams: false,
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

const parseBooleanSetting = (value: string | null | undefined, fallback: boolean) => {
  if (value == null) return fallback
  const normalized = value.trim().toLowerCase()
  if (normalized === 'true' || normalized === '1') return true
  if (normalized === 'false' || normalized === '0') return false
  return fallback
}

export async function readNavbarVisibilityState(supabase: SupabaseClient): Promise<NavbarVisibilityState> {
  const defaults: NavbarVisibilityState = {
    leaderboard: true,
    winners: true,
    qualifiedTeams: true,
  }

  const { data, error } = await supabase
    .from('site_settings')
    .select('key, value_text')
    .in('key', [
      NAVBAR_SHOW_LEADERBOARD_KEY,
      NAVBAR_SHOW_WINNERS_KEY,
      NAVBAR_SHOW_QUALIFIED_TEAMS_KEY,
    ])

  if (error) {
    throw new Error(error.message)
  }

  for (const row of (data as SiteSettingRow[] | null) ?? []) {
    if (row.key === NAVBAR_SHOW_LEADERBOARD_KEY) {
      defaults.leaderboard = parseBooleanSetting(row.value_text, defaults.leaderboard)
    } else if (row.key === NAVBAR_SHOW_WINNERS_KEY) {
      defaults.winners = parseBooleanSetting(row.value_text, defaults.winners)
    } else if (row.key === NAVBAR_SHOW_QUALIFIED_TEAMS_KEY) {
      defaults.qualifiedTeams = parseBooleanSetting(row.value_text, defaults.qualifiedTeams)
    }
  }

  return defaults
}

export async function writeNavbarVisibilityState(
  supabase: SupabaseClient,
  state: NavbarVisibilityState
) {
  const { error } = await supabase
    .from('site_settings')
    .upsert(
      [
        { key: NAVBAR_SHOW_LEADERBOARD_KEY, value_text: String(state.leaderboard) },
        { key: NAVBAR_SHOW_WINNERS_KEY, value_text: String(state.winners) },
        { key: NAVBAR_SHOW_QUALIFIED_TEAMS_KEY, value_text: String(state.qualifiedTeams) },
      ],
      { onConflict: 'key' }
    )

  if (error) {
    throw new Error(error.message)
  }
}

// Sponsor types and functions
export interface SponsorEntry {
  id: string
  name: string
  logoUrl: string
  secondaryLogoUrl: string | null
  websiteUrl: string | null
  category: string
  titlePrimary: string | null
  titleSecondary: string | null
  description: string | null
  displayOrder: number
  isFeatured: boolean
}

export interface QualifiedTeamEntry {
  id: string
  teamName: string
  logoUrl: string
  participantNames: string[]
  collegeName: string
}

interface SponsorRow {
  id: string
  name: string
  logo_url: string
  secondary_logo_url: string | null
  website_url: string | null
  category: string
  title_primary: string | null
  title_secondary: string | null
  description: string | null
  display_order: number
  is_featured: boolean
  created_at: string
  updated_at: string
}

interface QualifiedTeamRow {
  id: string
  team_name: string
  logo_url: string
  participant_names: string[]
  college_name: string
  created_at: string
}

export const mapSponsorRow = (row: SponsorRow): SponsorEntry => ({
  id: row.id,
  name: row.name,
  logoUrl: row.logo_url,
  secondaryLogoUrl: row.secondary_logo_url,
  websiteUrl: row.website_url,
  category: row.category,
  titlePrimary: row.title_primary,
  titleSecondary: row.title_secondary,
  description: row.description,
  displayOrder: row.display_order,
  isFeatured: row.is_featured,
})

export const mapQualifiedTeamRow = (row: QualifiedTeamRow): QualifiedTeamEntry => ({
  id: row.id,
  teamName: row.team_name,
  logoUrl: row.logo_url,
  participantNames: row.participant_names,
  collegeName: row.college_name,
})

export async function readAllSponsors(supabase: SupabaseClient): Promise<SponsorEntry[]> {
  const { data, error } = await supabase
    .from('sponsors')
    .select('*')
    .order('is_featured', { ascending: false })
    .order('display_order', { ascending: true })

  if (error) {
    throw new Error(error.message)
  }

  return (data as SponsorRow[] | null)?.map(mapSponsorRow) ?? []
}

export async function readFeaturedSponsors(supabase: SupabaseClient): Promise<SponsorEntry[]> {
  const { data, error } = await supabase
    .from('sponsors')
    .select('*')
    .eq('is_featured', true)
    .order('display_order', { ascending: true })

  if (error) {
    throw new Error(error.message)
  }

  return (data as SponsorRow[] | null)?.map(mapSponsorRow) ?? []
}

export async function createSponsor(
  supabase: SupabaseClient,
  sponsor: Omit<SponsorEntry, 'id'>
) {
  const { data, error } = await supabase
    .from('sponsors')
    .insert({
      name: sponsor.name,
      logo_url: sponsor.logoUrl,
      secondary_logo_url: sponsor.secondaryLogoUrl,
      website_url: sponsor.websiteUrl,
      category: sponsor.category,
      title_primary: sponsor.titlePrimary,
      title_secondary: sponsor.titleSecondary,
      description: sponsor.description,
      display_order: sponsor.displayOrder,
      is_featured: sponsor.isFeatured,
    })
    .select()
    .single<SponsorRow>()

  if (error) {
    throw new Error(error.message)
  }

  return mapSponsorRow(data)
}

export async function updateSponsor(
  supabase: SupabaseClient,
  id: string,
  sponsor: Partial<Omit<SponsorEntry, 'id'>>
) {
  const updateData: Record<string, unknown> = {}

  if (sponsor.name !== undefined) updateData.name = sponsor.name
  if (sponsor.logoUrl !== undefined) updateData.logo_url = sponsor.logoUrl
  if (sponsor.secondaryLogoUrl !== undefined) updateData.secondary_logo_url = sponsor.secondaryLogoUrl
  if (sponsor.websiteUrl !== undefined) updateData.website_url = sponsor.websiteUrl
  if (sponsor.category !== undefined) updateData.category = sponsor.category
  if (sponsor.titlePrimary !== undefined) updateData.title_primary = sponsor.titlePrimary
  if (sponsor.titleSecondary !== undefined) updateData.title_secondary = sponsor.titleSecondary
  if (sponsor.description !== undefined) updateData.description = sponsor.description
  if (sponsor.displayOrder !== undefined) updateData.display_order = sponsor.displayOrder
  if (sponsor.isFeatured !== undefined) updateData.is_featured = sponsor.isFeatured

  const { data, error } = await supabase
    .from('sponsors')
    .update(updateData)
    .eq('id', id)
    .select()
    .single<SponsorRow>()

  if (error) {
    throw new Error(error.message)
  }

  return mapSponsorRow(data)
}

export async function deleteSponsor(supabase: SupabaseClient, id: string) {
  const { error } = await supabase
    .from('sponsors')
    .delete()
    .eq('id', id)

  if (error) {
    throw new Error(error.message)
  }
}

export async function readAllQualifiedTeams(supabase: SupabaseClient): Promise<QualifiedTeamEntry[]> {
  const { data, error } = await supabase
    .from('qualified_teams')
    .select('*')
    .order('team_name', { ascending: true })

  if (error) {
    throw new Error(error.message)
  }

  return (data as QualifiedTeamRow[] | null)?.map(mapQualifiedTeamRow) ?? []
}

export async function createQualifiedTeam(
  supabase: SupabaseClient,
  team: Omit<QualifiedTeamEntry, 'id'>
) {
  const { data, error } = await supabase
    .from('qualified_teams')
    .insert({
      team_name: team.teamName,
      logo_url: team.logoUrl,
      participant_names: team.participantNames,
      college_name: team.collegeName,
    })
    .select()
    .single<QualifiedTeamRow>()

  if (error) {
    throw new Error(error.message)
  }

  return mapQualifiedTeamRow(data)
}

export async function updateQualifiedTeam(
  supabase: SupabaseClient,
  id: string,
  team: Partial<Omit<QualifiedTeamEntry, 'id'>>
) {
  const updateData: Record<string, unknown> = {}

  if (team.teamName !== undefined) updateData.team_name = team.teamName
  if (team.logoUrl !== undefined) updateData.logo_url = team.logoUrl
  if (team.participantNames !== undefined) updateData.participant_names = team.participantNames
  if (team.collegeName !== undefined) updateData.college_name = team.collegeName

  const { data, error } = await supabase
    .from('qualified_teams')
    .update(updateData)
    .eq('id', id)
    .select()
    .single<QualifiedTeamRow>()

  if (error) {
    throw new Error(error.message)
  }

  return mapQualifiedTeamRow(data)
}

export async function deleteQualifiedTeam(supabase: SupabaseClient, id: string) {
  const { error } = await supabase
    .from('qualified_teams')
    .delete()
    .eq('id', id)

  if (error) {
    throw new Error(error.message)
  }
}
