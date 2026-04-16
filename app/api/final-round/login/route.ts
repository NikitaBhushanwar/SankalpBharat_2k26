import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase-admin'
import { verifyPassword } from '@/lib/password'
import { createFinalRoundSessionToken, setFinalRoundSessionCookie } from '@/lib/final-round-session'
import { getFinalRoundDashboardData } from '@/lib/final-round-repository'

interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
}

export async function POST(request: NextRequest) {
  try {
    const supabase = getSupabaseAdmin()
    const body = await request.json()
    const teamId = String(body.teamId ?? '').trim()
    const password = String(body.password ?? '')

    if (!teamId || !password) {
      return NextResponse.json<ApiResponse<null>>(
        {
          success: false,
          error: 'Team ID and password are required',
        },
        { status: 400 }
      )
    }

    const { data: teamRow, error } = await supabase
      .from('final_round_teams')
      .select('id, team_id, team_name, password_hash, selected_problem_statement_id, selected_at')
      .eq('team_id', teamId)
      .maybeSingle()

    if (error) {
      throw new Error(error.message)
    }

    if (!teamRow || !verifyPassword(password, teamRow.password_hash)) {
      return NextResponse.json<ApiResponse<null>>(
        {
          success: false,
          error: 'Invalid team ID or password',
        },
        { status: 401 }
      )
    }

    const sessionToken = createFinalRoundSessionToken(teamRow.team_id)
    const dashboardData = await getFinalRoundDashboardData(supabase, teamRow.team_id)
    const response = NextResponse.json<ApiResponse<typeof dashboardData>>(
      {
        success: true,
        data: dashboardData,
      },
      { status: 200 }
    )

    setFinalRoundSessionCookie(response, sessionToken)
    return response
  } catch (error) {
    return NextResponse.json<ApiResponse<null>>(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to login',
      },
      { status: 500 }
    )
  }
}