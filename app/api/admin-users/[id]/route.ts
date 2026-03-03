import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase-admin'
import {
  assertSuperAdminRequest,
  getPrimarySuperAdminEmail,
  mapAdminUserRow,
} from '@/lib/admin-access'
import { encryptPassword, hashPassword } from '@/lib/password'

interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = getSupabaseAdmin()
    await assertSuperAdminRequest(request, supabase)
    const primarySuperAdminEmail = getPrimarySuperAdminEmail()

    const { id } = await params
    const body = await request.json()
    const {
      email,
      password,
      isSuperAdmin,
      isActive,
    } = body as {
      email?: string
      password?: string
      isSuperAdmin?: boolean
      isActive?: boolean
    }

    const { data: existing, error: fetchError } = await supabase
      .from('admin_users')
      .select('*')
      .eq('id', id)
      .maybeSingle()

    if (fetchError) {
      throw new Error(fetchError.message)
    }

    if (!existing) {
      return NextResponse.json<ApiResponse<null>>(
        {
          success: false,
          error: 'Admin user not found',
        },
        { status: 404 }
      )
    }

    const isPrimarySuperAdmin = existing.email === primarySuperAdminEmail

    const updatePayload: {
      email?: string
      password_hash?: string
      password_encrypted?: string
      is_super_admin?: boolean
      is_active?: boolean
    } = {}

    if (email !== undefined) {
      const normalizedEmail = String(email).trim().toLowerCase()
      if (isPrimarySuperAdmin && normalizedEmail !== primarySuperAdminEmail) {
        return NextResponse.json<ApiResponse<null>>(
          {
            success: false,
            error: 'Primary super admin email cannot be changed',
          },
          { status: 400 }
        )
      }
      updatePayload.email = normalizedEmail
    }

    if (password !== undefined && String(password).trim() !== '') {
      const normalizedPassword = String(password)
      updatePayload.password_hash = hashPassword(normalizedPassword)
      updatePayload.password_encrypted = encryptPassword(normalizedPassword)
    }

    if (isSuperAdmin !== undefined) {
      if (isPrimarySuperAdmin && !isSuperAdmin) {
        return NextResponse.json<ApiResponse<null>>(
          {
            success: false,
            error: 'Primary super admin cannot be demoted',
          },
          { status: 400 }
        )
      }
      updatePayload.is_super_admin = Boolean(isSuperAdmin)
    }

    if (isActive !== undefined) {
      if (isPrimarySuperAdmin && !isActive) {
        return NextResponse.json<ApiResponse<null>>(
          {
            success: false,
            error: 'Primary super admin cannot be deactivated',
          },
          { status: 400 }
        )
      }
      updatePayload.is_active = Boolean(isActive)
    }

    const { data: updated, error: updateError } = await supabase
      .from('admin_users')
      .update(updatePayload)
      .eq('id', id)
      .select('*')
      .single()

    if (updateError || !updated) {
      throw new Error(updateError?.message || 'Failed to update admin user')
    }

    return NextResponse.json<ApiResponse<ReturnType<typeof mapAdminUserRow>>>(
      {
        success: true,
        data: mapAdminUserRow(updated, { includePassword: true }),
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
        error: error instanceof Error ? error.message : 'Failed to update admin user',
      },
      { status }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = getSupabaseAdmin()
    await assertSuperAdminRequest(request, supabase)
    const primarySuperAdminEmail = getPrimarySuperAdminEmail()

    const { id } = await params

    const { data: existing, error: fetchError } = await supabase
      .from('admin_users')
      .select('*')
      .eq('id', id)
      .maybeSingle()

    if (fetchError) {
      throw new Error(fetchError.message)
    }

    if (!existing) {
      return NextResponse.json<ApiResponse<null>>(
        {
          success: false,
          error: 'Admin user not found',
        },
        { status: 404 }
      )
    }

    if (existing.email === primarySuperAdminEmail) {
      return NextResponse.json<ApiResponse<null>>(
        {
          success: false,
          error: 'Primary super admin cannot be removed',
        },
        { status: 400 }
      )
    }

    const { data: deleted, error: deleteError } = await supabase
      .from('admin_users')
      .delete()
      .eq('id', id)
      .select('*')
      .single()

    if (deleteError || !deleted) {
      throw new Error(deleteError?.message || 'Failed to delete admin user')
    }

    return NextResponse.json<ApiResponse<ReturnType<typeof mapAdminUserRow>>>(
      {
        success: true,
        data: mapAdminUserRow(deleted),
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
        error: error instanceof Error ? error.message : 'Failed to delete admin user',
      },
      { status }
    )
  }
}
