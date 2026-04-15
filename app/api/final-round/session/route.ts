import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase-admin'
import { getFinalRoundDashboardData } from '@/lib/final-round-repository'
import { requireFinalRoundSession } from '@/lib/final-round-session'

interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
}

export async function GET(request: NextRequest) {
  try {
    const supabase = getSupabaseAdmin()
    const sessionTeam = await requireFinalRoundSession(request, supabase)
    const data = await getFinalRoundDashboardData(supabase, sessionTeam.team_id)

    return NextResponse.json<ApiResponse<typeof data>>(
      {
        success: true,
        data,
      },
      { status: 200 }
    )
  } catch {
    return NextResponse.json<ApiResponse<null>>(
      {
        success: false,
        error: 'Not authenticated',
      },
      { status: 401 }
    )
  }
}