import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase-admin'
import { requireAdminSession } from '@/lib/admin-session'
import { readFinalRoundAdminOverview } from '@/lib/final-round-repository'

interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
}

export async function GET(request: NextRequest) {
  try {
    const supabase = getSupabaseAdmin()
    await requireAdminSession(request, supabase)
    const data = await readFinalRoundAdminOverview(supabase)

    return NextResponse.json<ApiResponse<typeof data>>(
      {
        success: true,
        data,
      },
      { status: 200 }
    )
  } catch (error) {
    const status = error instanceof Error && error.message === 'Not authenticated' ? 401 : 500

    return NextResponse.json<ApiResponse<null>>(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch final round overview',
      },
      { status }
    )
  }
}
