import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase-admin'
import { ensurePrimarySuperAdmin, mapAdminUserRow } from '@/lib/admin-access'
import { encryptPassword, verifyPassword } from '@/lib/password'
import { createAdminSessionToken, setAdminSessionCookie } from '@/lib/admin-session'

interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
}

export async function POST(request: NextRequest) {
  try {
    const supabase = getSupabaseAdmin()
    await ensurePrimarySuperAdmin(supabase)

    const body = await request.json()
    const { email, password } = body as { email?: string; password?: string }

    if (!email || !password) {
      return NextResponse.json<ApiResponse<null>>(
        {
          success: false,
          error: 'Email and password are required',
        },
        { status: 400 }
      )
    }

    const normalizedEmail = String(email).trim().toLowerCase()

    const { data: adminRow, error } = await supabase
      .from('admin_users')
      .select('*')
      .eq('email', normalizedEmail)
      .maybeSingle()

    if (error) {
      throw new Error(error.message)
    }

    if (!adminRow || !adminRow.is_active) {
      return NextResponse.json<ApiResponse<null>>(
        {
          success: false,
          error: 'Invalid email or password',
        },
        { status: 401 }
      )
    }

    const passwordMatches = verifyPassword(String(password), adminRow.password_hash)

    if (!passwordMatches) {
      return NextResponse.json<ApiResponse<null>>(
        {
          success: false,
          error: 'Invalid email or password',
        },
        { status: 401 }
      )
    }

    if (!adminRow.password_encrypted) {
      const { error: passwordEncryptUpdateError } = await supabase
        .from('admin_users')
        .update({
          password_encrypted: encryptPassword(String(password)),
        })
        .eq('id', adminRow.id)

      if (passwordEncryptUpdateError) {
        throw new Error(passwordEncryptUpdateError.message)
      }
    }

    const response = NextResponse.json<ApiResponse<ReturnType<typeof mapAdminUserRow>>>(
      {
        success: true,
        data: mapAdminUserRow(adminRow),
      },
      { status: 200 }
    )

    const token = createAdminSessionToken(adminRow.email)
    setAdminSessionCookie(response, token)

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
