import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase-admin'
import {
  createAdminSessionToken,
  requireAdminSession,
  setAdminSessionCookie,
} from '@/lib/admin-session'
import { mapAdminUserRow } from '@/lib/admin-access'

interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
}

export async function GET(request: NextRequest) {
  try {
    const supabase = getSupabaseAdmin()
    const sessionUser = await requireAdminSession(request, supabase)

    const { data: adminRow, error } = await supabase
      .from('admin_users')
      .select('*')
      .eq('id', sessionUser.id)
      .maybeSingle()

    if (error) {
      throw new Error(error.message)
    }

    if (!adminRow) {
      return NextResponse.json<ApiResponse<null>>(
        {
          success: false,
          error: 'Session not found',
        },
        { status: 401 }
      )
    }

    const response = NextResponse.json<ApiResponse<ReturnType<typeof mapAdminUserRow>>>(
      {
        success: true,
        data: mapAdminUserRow(adminRow),
      },
      { status: 200 }
    )

    // Sliding expiration: keep admin session alive while the user stays active.
    const refreshedToken = createAdminSessionToken(sessionUser.email)
    setAdminSessionCookie(response, refreshedToken)

    return response
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
