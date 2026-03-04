import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase-admin'
import { encryptPassword, hashPassword, verifyPassword } from '@/lib/password'
import { requireAdminSession } from '@/lib/admin-session'

interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
}

export async function POST(request: NextRequest) {
  try {
    const supabase = getSupabaseAdmin()
    const requester = await requireAdminSession(request, supabase)
    const body = await request.json()

    const { currentPassword, newPassword } = body as {
      currentPassword?: string
      newPassword?: string
    }

    if (!currentPassword || !newPassword) {
      return NextResponse.json<ApiResponse<null>>(
        {
          success: false,
          error: 'Current password and new password are required',
        },
        { status: 400 }
      )
    }

    if (String(newPassword).length < 8) {
      return NextResponse.json<ApiResponse<null>>(
        {
          success: false,
          error: 'New password must be at least 8 characters',
        },
        { status: 400 }
      )
    }

    const { data: adminRow, error: fetchError } = await supabase
      .from('admin_users')
      .select('*')
      .eq('email', requester.email)
      .maybeSingle()

    if (fetchError) {
      throw new Error(fetchError.message)
    }

    if (!adminRow || !adminRow.is_active) {
      return NextResponse.json<ApiResponse<null>>(
        {
          success: false,
          error: 'Admin user not found or inactive',
        },
        { status: 404 }
      )
    }

    const currentPasswordMatches = verifyPassword(String(currentPassword), adminRow.password_hash)

    if (!currentPasswordMatches) {
      return NextResponse.json<ApiResponse<null>>(
        {
          success: false,
          error: 'Current password is incorrect',
        },
        { status: 401 }
      )
    }

    const normalizedNewPassword = String(newPassword)

    const { error: updateError } = await supabase
      .from('admin_users')
      .update({
        password_hash: hashPassword(normalizedNewPassword),
        password_encrypted: encryptPassword(normalizedNewPassword),
      })
      .eq('id', adminRow.id)

    if (updateError) {
      throw new Error(updateError.message)
    }

    return NextResponse.json<ApiResponse<null>>(
      {
        success: true,
      },
      { status: 200 }
    )
  } catch (error) {
    const status = error instanceof Error && error.message === 'Not authenticated' ? 401 : 500

    return NextResponse.json<ApiResponse<null>>(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to change password',
      },
      { status }
    )
  }
}
