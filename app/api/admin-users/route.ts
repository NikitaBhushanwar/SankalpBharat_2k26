import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase-admin'
import {
  assertSuperAdminRequest,
  ensurePrimarySuperAdmin,
  getPrimarySuperAdminEmail,
  mapAdminUserRow,
} from '@/lib/admin-access'
import { encryptPassword, hashPassword } from '@/lib/password'

interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
}

export async function GET(request: NextRequest) {
  try {
    const supabase = getSupabaseAdmin()
    const requester = await assertSuperAdminRequest(request, supabase)
    const primarySuperAdminEmail = getPrimarySuperAdminEmail()

    const isPrimarySuperAdminRequester = requester.email === primarySuperAdminEmail

    const { data, error } = await supabase
      .from('admin_users')
      .select('*')
      .order('created_at', { ascending: true })

    if (error) {
      throw new Error(error.message)
    }

    return NextResponse.json<ApiResponse<ReturnType<typeof mapAdminUserRow>[]>>(
      {
        success: true,
        data: (data ?? []).map((entry) => {
          const isTargetSuperAdmin = Boolean(entry.is_super_admin)
          const isOwnAccount = entry.email === requester.email
          const canSeePassword =
            !isTargetSuperAdmin ||
            isOwnAccount ||
            isPrimarySuperAdminRequester

          return mapAdminUserRow(entry, { includePassword: canSeePassword })
        }),
      },
      { status: 200 }
    )
  } catch (error) {
    const status =
      error instanceof Error && error.message === 'Not authenticated'
        ? 401
        : error instanceof Error && error.message === 'Not authorized'
          ? 403
          : 500

    return NextResponse.json<ApiResponse<null>>(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch admin users',
      },
      { status }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = getSupabaseAdmin()
    await assertSuperAdminRequest(request, supabase)
    await ensurePrimarySuperAdmin(supabase)
    const primarySuperAdminEmail = getPrimarySuperAdminEmail()

    const body = await request.json()
    const { email, password, isSuperAdmin } = body as {
      email?: string
      password?: string
      isSuperAdmin?: boolean
    }

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

    const { data: existing, error: existingError } = await supabase
      .from('admin_users')
      .select('id')
      .eq('email', normalizedEmail)
      .maybeSingle()

    if (existingError) {
      throw new Error(existingError.message)
    }

    if (existing) {
      return NextResponse.json<ApiResponse<null>>(
        {
          success: false,
          error: 'Admin email already exists',
        },
        { status: 409 }
      )
    }

    const { data: created, error } = await supabase
      .from('admin_users')
      .insert({
        email: normalizedEmail,
        password_hash: hashPassword(String(password)),
        password_encrypted: encryptPassword(String(password)),
        is_super_admin: normalizedEmail === primarySuperAdminEmail ? true : Boolean(isSuperAdmin),
        is_active: true,
      })
      .select('*')
      .single()

    if (error || !created) {
      throw new Error(error?.message || 'Failed to create admin user')
    }

    return NextResponse.json<ApiResponse<ReturnType<typeof mapAdminUserRow>>>(
      {
        success: true,
        data: mapAdminUserRow(created, { includePassword: true }),
      },
      { status: 201 }
    )
  } catch (error) {
    const status =
      error instanceof Error && error.message === 'Not authenticated'
        ? 401
        : error instanceof Error && error.message === 'Not authorized'
          ? 403
          : 500

    return NextResponse.json<ApiResponse<null>>(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create admin user',
      },
      { status }
    )
  }
}
