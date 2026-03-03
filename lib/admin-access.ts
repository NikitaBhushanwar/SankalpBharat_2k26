import type { NextRequest } from 'next/server'
import type { SupabaseClient } from '@supabase/supabase-js'
import { decryptPassword, encryptPassword, hashPassword } from './password'
import { requireSuperAdminSession } from './admin-session'

export const PRIMARY_SUPER_ADMIN_EMAIL = 'swadhin@sankalp.com'
export const PRIMARY_SUPER_ADMIN_PASSWORD = 'Swadhin@1109'

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
  isSuperAdmin: boolean
  isActive: boolean
  createdAt: string
}

export const mapAdminUserRow = (
  row: AdminUserRow,
  options?: { includePassword?: boolean }
): AdminUserDTO => {
  const includePassword = Boolean(options?.includePassword)

  return {
    id: row.id,
    email: row.email,
    password: includePassword ? decryptPassword(row.password_encrypted) : undefined,
    isSuperAdmin: Boolean(row.is_super_admin),
    isActive: Boolean(row.is_active),
    createdAt: row.created_at,
  }
}

export async function ensurePrimarySuperAdmin(supabase: SupabaseClient) {
  const { data: existingRow, error: fetchError } = await supabase
    .from('admin_users')
    .select('*')
    .eq('email', PRIMARY_SUPER_ADMIN_EMAIL)
    .maybeSingle()

  if (fetchError) {
    throw new Error(fetchError.message)
  }

  if (!existingRow) {
    const { error: createError } = await supabase.from('admin_users').insert({
      email: PRIMARY_SUPER_ADMIN_EMAIL,
      password_hash: hashPassword(PRIMARY_SUPER_ADMIN_PASSWORD),
      password_encrypted: encryptPassword(PRIMARY_SUPER_ADMIN_PASSWORD),
      is_super_admin: true,
      is_active: true,
    })

    if (createError) {
      throw new Error(createError.message)
    }

    return
  }

  if (!existingRow.is_super_admin || !existingRow.is_active || !existingRow.password_encrypted) {
    const { error: enforceError } = await supabase
      .from('admin_users')
      .update({
        is_super_admin: true,
        is_active: true,
        password_encrypted: existingRow.password_encrypted || encryptPassword(PRIMARY_SUPER_ADMIN_PASSWORD),
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
