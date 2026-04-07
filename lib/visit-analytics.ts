import type { SupabaseClient } from '@supabase/supabase-js'

const STARTING_TOTAL_VISITS = 23875

interface WebsiteVisitorRow {
  visitor_id: string
  visit_count: number
}

export interface VisitStats {
  totalVisits: number
  uniqueVisitors: number
  repeatedVisits: number
}

const isMissingTableError = (message: string) =>
  message.includes('relation') && message.includes('website_visitors') && message.includes('does not exist')

export async function recordVisit(supabase: SupabaseClient, visitorId: string, path: string) {
  const { data, error } = await supabase
    .from('website_visitors')
    .select('visitor_id, visit_count')
    .eq('visitor_id', visitorId)
    .maybeSingle<WebsiteVisitorRow>()

  if (error) {
    if (isMissingTableError(error.message)) {
      return
    }
    throw new Error(error.message)
  }

  if (!data) {
    const { error: insertError } = await supabase
      .from('website_visitors')
      .insert({
        visitor_id: visitorId,
        visit_count: 1,
        first_visited_at: new Date().toISOString(),
        last_visited_at: new Date().toISOString(),
        last_path: path,
      })

    if (insertError && !isMissingTableError(insertError.message)) {
      throw new Error(insertError.message)
    }

    return
  }

  const { error: updateError } = await supabase
    .from('website_visitors')
    .update({
      visit_count: data.visit_count + 1,
      last_visited_at: new Date().toISOString(),
      last_path: path,
    })
    .eq('visitor_id', visitorId)

  if (updateError && !isMissingTableError(updateError.message)) {
    throw new Error(updateError.message)
  }
}

export async function readVisitStats(supabase: SupabaseClient): Promise<VisitStats> {
  const { data, error } = await supabase
    .from('website_visitors')
    .select('visitor_id, visit_count')

  if (error) {
    if (isMissingTableError(error.message)) {
      return {
        totalVisits: STARTING_TOTAL_VISITS,
        uniqueVisitors: 0,
        repeatedVisits: 0,
      }
    }

    throw new Error(error.message)
  }

  const rows = (data as WebsiteVisitorRow[] | null) ?? []
  const trackedVisits = rows.reduce((sum, row) => sum + Math.max(0, row.visit_count || 0), 0)
  const totalVisits = STARTING_TOTAL_VISITS + trackedVisits
  const uniqueVisitors = rows.length
  const repeatedVisits = Math.max(0, trackedVisits - uniqueVisitors)

  return {
    totalVisits,
    uniqueVisitors,
    repeatedVisits,
  }
}