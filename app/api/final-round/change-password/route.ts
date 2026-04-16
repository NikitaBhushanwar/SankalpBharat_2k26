import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase-admin'
import { hashPassword, verifyPassword } from '@/lib/password'
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

    const currentPassword = String(body.currentPassword ?? '')
    const newPassword = String(body.newPassword ?? '')

    if (!currentPassword || !newPassword) {
      return NextResponse.json<ApiResponse<null>>(
        {
          success: false,
          error: 'Current password and new password are required',
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

    if (!verifyPassword(currentPassword, sessionTeam.password_hash)) {
      return NextResponse.json<ApiResponse<null>>(
        {
          success: false,
          error: 'Current password is incorrect',
        },
        { status: 401 }
      )
    }

    const { error } = await supabase
      .from('final_round_teams')
      .update({ password_hash: hashPassword(newPassword) })
      .eq('id', sessionTeam.id)

    if (error) {
      throw new Error(error.message)
    }

    return NextResponse.json<ApiResponse<{ updated: true }>>(
      {
        success: true,
        data: { updated: true },
      },
      { status: 200 }
    )
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to change password'
    const status = message === 'Not authenticated' ? 401 : 500

    return NextResponse.json<ApiResponse<null>>(
      {
        success: false,
        error: message,
      },
      { status }
    )
  }
}
