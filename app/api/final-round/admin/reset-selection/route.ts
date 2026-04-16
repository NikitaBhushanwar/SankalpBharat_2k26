import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase-admin'
import { requireAdminSession } from '@/lib/admin-session'
import { readFinalRoundAdminOverview, resetFinalRoundTeamSelection } from '@/lib/final-round-repository'

interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
}

export async function POST(request: NextRequest) {
  try {
    const supabase = getSupabaseAdmin()
    await requireAdminSession(request, supabase)
    const body = await request.json()
    const teamId = String(body.teamId ?? '').trim()

    if (!teamId) {
      return NextResponse.json<ApiResponse<null>>(
        {
          success: false,
          error: 'Team ID is required',
        },
        { status: 400 }
      )
    }

    await resetFinalRoundTeamSelection(supabase, teamId)
    const data = await readFinalRoundAdminOverview(supabase)

    return NextResponse.json<ApiResponse<typeof data>>(
      {
        success: true,
        data,
      },
      { status: 200 }
    )
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to reset team selection'
    const status =
      message === 'Not authenticated' ? 401 : message === 'Team not found' ? 404 : 500

    return NextResponse.json<ApiResponse<null>>(
      {
        success: false,
        error: message,
      },
      { status }
    )
  }
}
