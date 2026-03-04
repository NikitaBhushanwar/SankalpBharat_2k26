import type { NextRequest } from 'next/server'
import type { SupabaseClient } from '@supabase/supabase-js'
import { decryptPassword } from './password'
import { requireSuperAdminSession } from './admin-session'

export const getPrimarySuperAdminEmail = () => {
  const configuredEmail = process.env.PRIMARY_SUPER_ADMIN_EMAIL?.trim().toLowerCase()

  if (!configuredEmail) {
    throw new Error('PRIMARY_SUPER_ADMIN_EMAIL is missing')
  }

  return configuredEmail
}

interface AdminUserRow {
  id: string
  email: string
  password_hash: string
  password_encrypted?: string | null
  is_super_admin: boolean
  is_active: boolean
  created_at: string
}

export interface AdminUserDTO {
  id: string
  email: string
  password?: string | null
  isPrimarySuperAdmin: boolean
  isSuperAdmin: boolean
  isActive: boolean
  createdAt: string
}

export const mapAdminUserRow = (
  row: AdminUserRow,
  options?: { includePassword?: boolean }
): AdminUserDTO => {
  const includePassword = Boolean(options?.includePassword)
  const primarySuperAdminEmail = getPrimarySuperAdminEmail()

  return {
    id: row.id,
    email: row.email,
    password: includePassword ? decryptPassword(row.password_encrypted) : undefined,
    isPrimarySuperAdmin: row.email === primarySuperAdminEmail,
    isSuperAdmin: Boolean(row.is_super_admin),
    isActive: Boolean(row.is_active),
    createdAt: row.created_at,
  }
}

export async function ensurePrimarySuperAdmin(supabase: SupabaseClient) {
  const primarySuperAdminEmail = getPrimarySuperAdminEmail()

  const { data: existingRow, error: fetchError } = await supabase
    .from('admin_users')
    .select('*')
    .eq('email', primarySuperAdminEmail)
    .maybeSingle()

  if (fetchError) {
    throw new Error(fetchError.message)
  }

  if (!existingRow) {
    throw new Error('Primary super admin user not found in admin_users table')
  }

  if (!existingRow.is_super_admin || !existingRow.is_active) {
    const { error: enforceError } = await supabase
      .from('admin_users')
      .update({
        is_super_admin: true,
        is_active: true,
      })
      .eq('id', existingRow.id)

    if (enforceError) {
      throw new Error(enforceError.message)
    }
  }
}

export async function assertSuperAdminRequest(request: NextRequest, supabase: SupabaseClient) {
  await ensurePrimarySuperAdmin(supabase)
  return requireSuperAdminSession(request, supabase)
}
