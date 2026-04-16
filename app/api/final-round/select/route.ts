import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase-admin'
import { getFinalRoundDashboardData, selectFinalRoundProblemStatement } from '@/lib/final-round-repository'
import { requireFinalRoundSession } from '@/lib/final-round-session'

interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
}

export async function POST(request: NextRequest) {
  try {
    const supabase = getSupabaseAdmin()
    const sessionTeam = await requireFinalRoundSession(request, supabase)
    const body = await request.json()
    const problemStatementId = String(body.problemStatementId ?? '').trim()

    if (!problemStatementId) {
      return NextResponse.json<ApiResponse<null>>(
        {
          success: false,
          error: 'Problem statement ID is required',
        },
        { status: 400 }
      )
    }

    await selectFinalRoundProblemStatement(supabase, sessionTeam.team_id, problemStatementId)
    const data = await getFinalRoundDashboardData(supabase, sessionTeam.team_id)

    return NextResponse.json<ApiResponse<typeof data>>(
      {
        success: true,
        data,
      },
      { status: 200 }
    )
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to allocate problem statement'
    const status =
      message === 'Not authenticated' ? 401 : message.includes('full') ? 409 : message.includes('already selected') ? 409 : 500

    return NextResponse.json<ApiResponse<null>>(
      {
        success: false,
        error: message,
      },
      { status }
    )
  }
}