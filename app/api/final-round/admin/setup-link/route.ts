import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase-admin'
import { requireAdminSession } from '@/lib/admin-session'
import { createFinalRoundSetupToken } from '@/lib/final-round-setup-token'

interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
}

interface TeamRow {
  team_id: string
  team_name: string
  password_hash: string
}

export async function POST(request: NextRequest) {
  try {
    const supabase = getSupabaseAdmin()
    await requireAdminSession(request, supabase)

    const body = (await request.json()) as {
      teamId?: string
      ttlMinutes?: number
    }

    const teamId = String(body.teamId ?? '').trim()
    const ttlMinutesRaw = Number(body.ttlMinutes ?? 180)
    const ttlMinutes = Number.isFinite(ttlMinutesRaw) ? Math.min(Math.max(Math.floor(ttlMinutesRaw), 5), 60 * 24) : 180

    if (!teamId) {
      return NextResponse.json<ApiResponse<null>>(
        {
          success: false,
          error: 'Team ID is required',
        },
        { status: 400 }
      )
    }

    const { data: team, error } = await supabase
      .from('final_round_teams')
      .select('team_id, team_name, password_hash')
      .eq('team_id', teamId)
      .maybeSingle<TeamRow>()

    if (error) {
      throw new Error(error.message)
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

    const ttlSeconds = ttlMinutes * 60
    const token = createFinalRoundSetupToken(team.team_id, team.password_hash, ttlSeconds)
    const expiresAt = new Date(Date.now() + ttlSeconds * 1000).toISOString()
    const setupUrl = new URL('/final-round/setup-password', request.nextUrl.origin)
    setupUrl.searchParams.set('token', token)

    return NextResponse.json<ApiResponse<{
      teamId: string
      teamName: string
      expiresAt: string
      setupLink: string
    }>>(
      {
        success: true,
        data: {
          teamId: team.team_id,
          teamName: team.team_name,
          expiresAt,
          setupLink: setupUrl.toString(),
        },
      },
      { status: 200 }
    )
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to generate setup link'

    return NextResponse.json<ApiResponse<null>>(
      {
        success: false,
        error: message,
      },
      { status: message === 'Not authenticated' ? 401 : 500 }
    )
  }
}
