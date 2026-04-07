import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase-admin'
import { requireAdminSession } from '@/lib/admin-session'
import { readVisitStats, type VisitStats } from '@/lib/visit-analytics'

interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
}

export async function GET(request: NextRequest) {
  try {
    const supabase = getSupabaseAdmin()
    await requireAdminSession(request, supabase)

    const stats = await readVisitStats(supabase)

    return NextResponse.json<ApiResponse<VisitStats>>(
      {
        success: true,
        data: stats,
      },
      { status: 200 }
    )
  } catch (error) {
    const status = error instanceof Error && error.message === 'Not authenticated' ? 401 : 500

    return NextResponse.json<ApiResponse<VisitStats>>(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch visit stats',
      },
      { status }
    )
  }
}