import type { SupabaseClient } from '@supabase/supabase-js'

export const DEFAULT_REGISTRATION_LINK = 'https://unstop.com/'
const REGISTRATION_LINK_SETTING_KEY = 'registration_link'
const NAVBAR_SHOW_LEADERBOARD_KEY = 'navbar_show_leaderboard'
const NAVBAR_SHOW_WINNERS_KEY = 'navbar_show_winners'
const NAVBAR_SHOW_QUALIFIED_TEAMS_KEY = 'navbar_show_qualified_teams'
const LOADING_POPUP_ENABLED_KEY = 'loading_popup_enabled'
const LOADING_POPUP_TITLE_KEY = 'loading_popup_title'
const LOADING_POPUP_MESSAGE_KEY = 'loading_popup_message'

export const DEFAULT_LOADING_POPUP_SETTINGS = {
  enabled: true,
  title: 'Qualified Teams Are Live',
  message: 'Qualified teams are now live and can be viewed in the Qualified Teams section. Check the latest list to see the updated entries.',
}

export interface LeaderboardEntry {
  id: string
  rank: number
  teamName: string
  projectTitle: string
  score: number
  isDisqualified: boolean
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

export interface FinalProblemStatementEntry {
  id: string
  problemStatementId: string
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
  finalProblemStatements: boolean
  finalProblemStatementsDownload: boolean
  qualifiedTeams: boolean
  finalistTeams: boolean
  finalRoundSelector: boolean
}

export interface LoadingPopupSettings {
  enabled: boolean
  title: string
  message: string
}

export interface NavbarVisibilityState {
  leaderboard: boolean
  winners: boolean
  qualifiedTeams: boolean
}

export type PublishSection = 'leaderboard' | 'winners' | 'problemStatements' | 'problemStatementsDownload' | 'finalProblemStatements' | 'finalProblemStatementsDownload' | 'qualifiedTeams' | 'finalistTeams' | 'finalRoundSelector'

interface LeaderboardRow {
  id: string
  rank: number
  team_name: string
  project_title: string
  score: number
  is_disqualified: boolean
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

interface FinalProblemStatementRow {
  id: string
  problem_statement_id: string | null
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
  section: 'leaderboard' | 'winners' | 'problemStatements' | 'problemStatementsDownload' | 'finalProblemStatements' | 'finalProblemStatementsDownload' | 'qualifiedTeams' | 'finalistTeams' | 'finalRoundSelector'
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

export const mapFinalProblemStatementRow = (row: FinalProblemStatementRow): FinalProblemStatementEntry => ({
  id: row.id,
  problemStatementId: row.problem_statement_id ?? '',
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

export async function readAllProblemStatements(supabase: SupabaseClient): Promise<ProblemStatementEntry[]> {
  const { data, error } = await supabase
    .from('problem_statements')
    .select('*')
    .order('created_at', { ascending: true })

  if (error) {
    throw new Error(error.message)
  }

  return (data as ProblemStatementRow[] | null)?.map(mapProblemStatementRow) ?? []
}

export async function createProblemStatement(
  supabase: SupabaseClient,
  statement: Omit<ProblemStatementEntry, 'id'>
) {
  const { data, error } = await supabase
    .from('problem_statements')
    .insert({
      title: statement.title,
      domain: statement.domain,
      description: statement.description,
      pdf_link: statement.pdfLink,
    })
    .select('*')
    .single<ProblemStatementRow>()

  if (error) {
    throw new Error(error.message)
  }

  return mapProblemStatementRow(data)
}

export async function updateProblemStatement(
  supabase: SupabaseClient,
  id: string,
  statement: Partial<Omit<ProblemStatementEntry, 'id'>>
) {
  const updateData: Record<string, unknown> = {}

  if (statement.title !== undefined) updateData.title = statement.title
  if (statement.domain !== undefined) updateData.domain = statement.domain
  if (statement.description !== undefined) updateData.description = statement.description
  if (statement.pdfLink !== undefined) updateData.pdf_link = statement.pdfLink

  const { data, error } = await supabase
    .from('problem_statements')
    .update(updateData)
    .eq('id', id)
    .select('*')
    .single<ProblemStatementRow>()

  if (error) {
    throw new Error(error.message)
  }

  return mapProblemStatementRow(data)
}

export async function deleteProblemStatement(supabase: SupabaseClient, id: string) {
  const { error } = await supabase
    .from('problem_statements')
    .delete()
    .eq('id', id)

  if (error) {
    throw new Error(error.message)
  }
}

export async function readAllFinalProblemStatements(supabase: SupabaseClient): Promise<FinalProblemStatementEntry[]> {
  const { data, error } = await supabase
    .from('final_problem_statements')
    .select('*')
    .order('created_at', { ascending: true })

  if (error) {
    throw new Error(error.message)
  }

  return (data as FinalProblemStatementRow[] | null)?.map(mapFinalProblemStatementRow) ?? []
}

export async function createFinalProblemStatement(
  supabase: SupabaseClient,
  statement: Omit<FinalProblemStatementEntry, 'id'>
) {
  const { data, error } = await supabase
    .from('final_problem_statements')
    .insert({
      problem_statement_id: statement.problemStatementId,
      title: statement.title,
      domain: statement.domain,
      description: statement.description,
      pdf_link: statement.pdfLink,
    })
    .select('*')
    .single<FinalProblemStatementRow>()

  if (error) {
    throw new Error(error.message)
  }

  return mapFinalProblemStatementRow(data)
}

export async function updateFinalProblemStatement(
  supabase: SupabaseClient,
  id: string,
  statement: Partial<Omit<FinalProblemStatementEntry, 'id'>>
) {
  const updateData: Record<string, unknown> = {}

  if (statement.problemStatementId !== undefined) updateData.problem_statement_id = statement.problemStatementId
  if (statement.title !== undefined) updateData.title = statement.title
  if (statement.domain !== undefined) updateData.domain = statement.domain
  if (statement.description !== undefined) updateData.description = statement.description
  if (statement.pdfLink !== undefined) updateData.pdf_link = statement.pdfLink

  const { data, error } = await supabase
    .from('final_problem_statements')
    .update(updateData)
    .eq('id', id)
    .select('*')
    .single<FinalProblemStatementRow>()

  if (error) {
    throw new Error(error.message)
  }

  return mapFinalProblemStatementRow(data)
}

export async function deleteFinalProblemStatement(supabase: SupabaseClient, id: string) {
  const { error } = await supabase
    .from('final_problem_statements')
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

  let previousScore: number | null = null
  let previousRank = 0

  const updates = orderedRows.map((entry, index) => {
    const nextRank = previousScore !== null && entry.score === previousScore ? previousRank : previousRank + 1

    previousScore = entry.score
    previousRank = nextRank

    return supabase
      .from('leaderboard_entries')
      .update({ rank: nextRank })
      .eq('id', entry.id)
  })

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
    finalProblemStatements: false,
    finalProblemStatementsDownload: false,
    qualifiedTeams: false,
    finalistTeams: false,
    finalRoundSelector: true,
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

export async function readLoadingPopupSettings(supabase: SupabaseClient): Promise<LoadingPopupSettings> {
  const defaults: LoadingPopupSettings = {
    enabled: DEFAULT_LOADING_POPUP_SETTINGS.enabled,
    title: DEFAULT_LOADING_POPUP_SETTINGS.title,
    message: DEFAULT_LOADING_POPUP_SETTINGS.message,
  }

  const { data, error } = await supabase
    .from('site_settings')
    .select('key, value_text')
    .in('key', [
      LOADING_POPUP_ENABLED_KEY,
      LOADING_POPUP_TITLE_KEY,
      LOADING_POPUP_MESSAGE_KEY,
    ])

  if (error) {
    throw new Error(error.message)
  }

  for (const row of (data as SiteSettingRow[] | null) ?? []) {
    if (row.key === LOADING_POPUP_ENABLED_KEY) {
      defaults.enabled = parseBooleanSetting(row.value_text, defaults.enabled)
    } else if (row.key === LOADING_POPUP_TITLE_KEY) {
      defaults.title = row.value_text?.trim() || defaults.title
    } else if (row.key === LOADING_POPUP_MESSAGE_KEY) {
      defaults.message = row.value_text?.trim() || defaults.message
    }
  }

  return defaults
}

export async function writeLoadingPopupSettings(
  supabase: SupabaseClient,
  settings: LoadingPopupSettings
) {
  const { error } = await supabase
    .from('site_settings')
    .upsert(
      [
        { key: LOADING_POPUP_ENABLED_KEY, value_text: String(settings.enabled) },
        { key: LOADING_POPUP_TITLE_KEY, value_text: settings.title },
        { key: LOADING_POPUP_MESSAGE_KEY, value_text: settings.message },
      ],
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
  teamId: string
  teamName: string
  logoUrl?: string
  collegeName: string
  sequenceNo: number
}

export interface FinalistTeamEntry {
  id: string
  teamId: string
  teamName: string
  logoUrl?: string
  teamLeaderName: string
  collegeName: string
  sequenceNo: number
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
  team_id: string | null
  team_name: string
  logo_url: string | null
  college_name: string
  sequence_no: number | null
  created_at: string
}

interface FinalistTeamRow {
  id: string
  team_id: string | null
  team_name: string
  logo_url: string | null
  team_leader_name: string | null
  college_name: string
  sequence_no: number | null
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
  teamId: row.team_id ?? '',
  teamName: row.team_name,
  logoUrl: row.logo_url ?? '',
  collegeName: row.college_name,
  sequenceNo: row.sequence_no ?? 0,
})

export const mapFinalistTeamRow = (row: FinalistTeamRow): FinalistTeamEntry => ({
  id: row.id,
  teamId: row.team_id ?? '',
  teamName: row.team_name,
  logoUrl: row.logo_url ?? '',
  teamLeaderName: row.team_leader_name ?? '',
  collegeName: row.college_name,
  sequenceNo: row.sequence_no ?? 0,
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
    .order('sequence_no', { ascending: true })
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
      team_id: team.teamId,
      team_name: team.teamName,
      logo_url: team.logoUrl?.trim() || '',
      college_name: team.collegeName,
      sequence_no: team.sequenceNo,
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

  if (team.teamId !== undefined) updateData.team_id = team.teamId
  if (team.teamName !== undefined) updateData.team_name = team.teamName
  if (team.logoUrl !== undefined) updateData.logo_url = team.logoUrl.trim() || ''
  if (team.collegeName !== undefined) updateData.college_name = team.collegeName
  if (team.sequenceNo !== undefined) updateData.sequence_no = team.sequenceNo

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

export async function readAllFinalistTeams(supabase: SupabaseClient): Promise<FinalistTeamEntry[]> {
  const { data, error } = await supabase
    .from('finalist_teams')
    .select('*')
    .order('sequence_no', { ascending: true })
    .order('team_name', { ascending: true })

  if (error) {
    throw new Error(error.message)
  }

  return (data as FinalistTeamRow[] | null)?.map(mapFinalistTeamRow) ?? []
}

export async function createFinalistTeam(
  supabase: SupabaseClient,
  team: Omit<FinalistTeamEntry, 'id'>
) {
  const { data, error } = await supabase
    .from('finalist_teams')
    .insert({
      team_id: team.teamId,
      team_name: team.teamName,
      logo_url: team.logoUrl?.trim() || '',
      team_leader_name: team.teamLeaderName,
      college_name: team.collegeName,
      sequence_no: team.sequenceNo,
    })
    .select()
    .single<FinalistTeamRow>()

  if (error) {
    throw new Error(error.message)
  }

  return mapFinalistTeamRow(data)
}

export async function updateFinalistTeam(
  supabase: SupabaseClient,
  id: string,
  team: Partial<Omit<FinalistTeamEntry, 'id'>>
) {
  const updateData: Record<string, unknown> = {}

  if (team.teamId !== undefined) updateData.team_id = team.teamId
  if (team.teamName !== undefined) updateData.team_name = team.teamName
  if (team.logoUrl !== undefined) updateData.logo_url = team.logoUrl.trim() || ''
  if (team.teamLeaderName !== undefined) updateData.team_leader_name = team.teamLeaderName
  if (team.collegeName !== undefined) updateData.college_name = team.collegeName
  if (team.sequenceNo !== undefined) updateData.sequence_no = team.sequenceNo

  const { data, error } = await supabase
    .from('finalist_teams')
    .update(updateData)
    .eq('id', id)
    .select()
    .single<FinalistTeamRow>()

  if (error) {
    throw new Error(error.message)
  }

  return mapFinalistTeamRow(data)
}

export async function deleteFinalistTeam(supabase: SupabaseClient, id: string) {
  const { error } = await supabase
    .from('finalist_teams')
    .delete()
    .eq('id', id)

  if (error) {
    throw new Error(error.message)
  }
}
