import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase-admin'
import { hashPassword } from '@/lib/password'
import { createFinalRoundSessionToken, setFinalRoundSessionCookie } from '@/lib/final-round-session'
import { getFinalRoundDashboardData } from '@/lib/final-round-repository'
import { verifyFinalRoundSetupToken } from '@/lib/final-round-setup-token'

interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
}

interface TeamRow {
  id: string
  team_id: string
  password_hash: string
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as {
      token?: string
      newPassword?: string
    }

    const token = String(body.token ?? '').trim()
    const newPassword = String(body.newPassword ?? '')

    if (!token || !newPassword) {
      return NextResponse.json<ApiResponse<null>>(
        {
          success: false,
          error: 'Setup token and new password are required',
        },
        { status: 400 }
      )
    }

    if (newPassword.length < 6) {
      return NextResponse.json<ApiResponse<null>>(
        {
          success: false,
          error: 'New password must be at least 6 characters',
        },
        { status: 400 }
      )
    }

    const payload = verifyFinalRoundSetupToken(token)

    if (!payload) {
      return NextResponse.json<ApiResponse<null>>(
        {
          success: false,
          error: 'Setup link is invalid or expired',
        },
        { status: 401 }
      )
    }

    const supabase = getSupabaseAdmin()
    const { data: team, error: findError } = await supabase
      .from('final_round_teams')
      .select('id, team_id, password_hash')
      .eq('team_id', payload.teamId)
      .maybeSingle<TeamRow>()

    if (findError) {
      throw new Error(findError.message)
    }

    if (!team) {
      return NextResponse.json<ApiResponse<null>>(
        {
          success: false,
          error: 'Team not found',
        },
        { status: 404 }
      )
    }

    const { error: updateError } = await supabase
      .from('final_round_teams')
      .update({ password_hash: hashPassword(newPassword) })
      .eq('id', team.id)

    if (updateError) {
      throw new Error(updateError.message)
    }

    const sessionToken = createFinalRoundSessionToken(team.team_id)
    const dashboardData = await getFinalRoundDashboardData(supabase, team.team_id)
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
        error: error instanceof Error ? error.message : 'Failed to set final round password',
      },
      { status: 500 }
    )
  }
}
