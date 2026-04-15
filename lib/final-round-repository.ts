import type { SupabaseClient } from '@supabase/supabase-js'
import { hashPassword } from '@/lib/password'

export interface FinalRoundProblemStatementEntry {
  id: string
  problemStatementId: string
  title: string
  domain: string
  description: string
  pdfLink: string
  maxSlots: number
  filledSlots: number
  isFull: boolean
}

export interface FinalRoundTeamEntry {
  id: string
  teamId: string
  teamName: string
  selectedProblemStatementId: string | null
  selectedAt: string | null
}

export interface FinalRoundTeamAllocationEntry {
  id: string
  teamId: string
  teamName: string
  selectedProblemStatementId: string | null
  selectedAt: string | null
  selectedProblemStatement: {
    id: string
    problemStatementId: string
    title: string
  } | null
}

interface FinalProblemStatementRow {
  id: string
  problem_statement_id: string | null
  title: string
  domain: string
  description: string
  pdf_link: string | null
  max_slots: number | null
}

interface FinalRoundTeamRow {
  id: string
  team_id: string
  team_name: string
  selected_problem_statement_id: string | null
  selected_at: string | null
}

interface FinalRoundSelectResultRow {
  team_id: string
  team_name: string
  selected_problem_statement_id: string
  selected_at: string
}

const mapFinalProblemStatementRow = (
  row: FinalProblemStatementRow,
  filledSlots = 0
): FinalRoundProblemStatementEntry => ({
  id: row.id,
  problemStatementId: row.problem_statement_id ?? '',
  title: row.title,
  domain: row.domain,
  description: row.description,
  pdfLink: row.pdf_link ?? '',
  maxSlots: row.max_slots ?? 6,
  filledSlots,
  isFull: filledSlots >= (row.max_slots ?? 6),
})

export async function readFinalRoundTeamByTeamId(
  supabase: SupabaseClient,
  teamId: string
): Promise<FinalRoundTeamEntry | null> {
  const { data, error } = await supabase
    .from('final_round_teams')
    .select('id, team_id, team_name, selected_problem_statement_id, selected_at')
    .eq('team_id', teamId)
    .maybeSingle<FinalRoundTeamRow>()

  if (error) {
    throw new Error(error.message)
  }

  if (!data) {
    return null
  }

  return {
    id: data.id,
    teamId: data.team_id,
    teamName: data.team_name,
    selectedProblemStatementId: data.selected_problem_statement_id,
    selectedAt: data.selected_at,
  }
}

export async function readFinalRoundProblemStatements(supabase: SupabaseClient) {
  const [{ data: problemStatements, error }, { data: teamSelections, error: selectionsError }] = await Promise.all([
    supabase
      .from('final_problem_statements')
      .select('id, problem_statement_id, title, domain, description, pdf_link, max_slots')
      .order('display_order', { ascending: true })
      .order('created_at', { ascending: true }),
    supabase
      .from('final_round_teams')
      .select('selected_problem_statement_id')
      .not('selected_problem_statement_id', 'is', null),
  ])

  if (error) {
    throw new Error(error.message)
  }

  if (selectionsError) {
    throw new Error(selectionsError.message)
  }

  const filledCounts = (teamSelections ?? []).reduce<Record<string, number>>((accumulator, item) => {
    if (!item.selected_problem_statement_id) {
      return accumulator
    }

    accumulator[item.selected_problem_statement_id] = (accumulator[item.selected_problem_statement_id] ?? 0) + 1
    return accumulator
  }, {})

  return (problemStatements ?? []).map((row) => mapFinalProblemStatementRow(row, filledCounts[row.id] ?? 0))
}

export async function getFinalRoundDashboardData(supabase: SupabaseClient, teamId: string) {
  const [team, problemStatements] = await Promise.all([
    readFinalRoundTeamByTeamId(supabase, teamId),
    readFinalRoundProblemStatements(supabase),
  ])

  if (!team) {
    throw new Error('Not authenticated')
  }

  return {
    team,
    problemStatements,
  }
}

export async function selectFinalRoundProblemStatement(
  supabase: SupabaseClient,
  teamId: string,
  problemStatementId: string
) {
  const { data, error } = await supabase.rpc('final_round_select_problem_statement', {
    p_team_id: teamId,
    p_problem_statement_id: problemStatementId,
  })

  if (error) {
    throw new Error(error.message)
  }

  const result = (data as FinalRoundSelectResultRow[] | null)?.[0]

  if (!result) {
    throw new Error('Failed to allocate problem statement')
  }

  return result
}

export async function readFinalRoundAdminOverview(supabase: SupabaseClient) {
  const [problemStatements, teamRows] = await Promise.all([
    readFinalRoundProblemStatements(supabase),
    supabase
      .from('final_round_teams')
      .select('id, team_id, team_name, selected_problem_statement_id, selected_at')
      .order('team_id', { ascending: true }),
  ])

  if (teamRows.error) {
    throw new Error(teamRows.error.message)
  }

  const statementLookup = new Map(problemStatements.map((item) => [item.id, item]))

  const teams = (teamRows.data as FinalRoundTeamRow[] | null)?.map<FinalRoundTeamAllocationEntry>((team) => {
    const selectedStatement = team.selected_problem_statement_id
      ? statementLookup.get(team.selected_problem_statement_id) ?? null
      : null

    return {
      id: team.id,
      teamId: team.team_id,
      teamName: team.team_name,
      selectedProblemStatementId: team.selected_problem_statement_id,
      selectedAt: team.selected_at,
      selectedProblemStatement: selectedStatement
        ? {
            id: selectedStatement.id,
            problemStatementId: selectedStatement.problemStatementId,
            title: selectedStatement.title,
          }
        : null,
    }
  }) ?? []

  return {
    problemStatements,
    teams,
  }
}

export async function resetFinalRoundTeamSelection(supabase: SupabaseClient, teamId: string) {
  const normalizedTeamId = teamId.trim()

  if (!normalizedTeamId) {
    throw new Error('Team ID is required')
  }

  const { data: existing, error: existingError } = await supabase
    .from('final_round_teams')
    .select('id, team_id')
    .eq('team_id', normalizedTeamId)
    .maybeSingle()

  if (existingError) {
    throw new Error(existingError.message)
  }

  if (!existing) {
    throw new Error('Team not found')
  }

  const { error } = await supabase
    .from('final_round_teams')
    .update({
      selected_problem_statement_id: null,
      selected_at: null,
    })
    .eq('team_id', normalizedTeamId)

  if (error) {
    throw new Error(error.message)
  }
}

export async function upsertFinalRoundTeamCredentials(
  supabase: SupabaseClient,
  input: {
    teamId: string
    teamName?: string
    password: string
  }
) {
  const teamId = input.teamId.trim()
  const teamName = (input.teamName ?? '').trim() || teamId
  const password = input.password.trim()

  if (!teamId) {
    throw new Error('Team ID is required')
  }

  if (!password) {
    throw new Error('Password is required')
  }

  const { data, error } = await supabase
    .from('final_round_teams')
    .upsert(
      {
        team_id: teamId,
        team_name: teamName,
        password_hash: hashPassword(password),
      },
      { onConflict: 'team_id' }
    )
    .select('id, team_id, team_name, selected_problem_statement_id, selected_at')
    .single<FinalRoundTeamRow>()

  if (error) {
    throw new Error(error.message)
  }

  return {
    id: data.id,
    teamId: data.team_id,
    teamName: data.team_name,
    selectedProblemStatementId: data.selected_problem_statement_id,
    selectedAt: data.selected_at,
  }
}

export async function deleteFinalRoundTeamCredentials(supabase: SupabaseClient, teamId: string) {
  const normalizedTeamId = teamId.trim()

  if (!normalizedTeamId) {
    throw new Error('Team ID is required')
  }

  const { error } = await supabase
    .from('final_round_teams')
    .delete()
    .eq('team_id', normalizedTeamId)

  if (error) {
    throw new Error(error.message)
  }
}