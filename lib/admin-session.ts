import { createHmac, randomBytes, timingSafeEqual } from 'crypto'
import type { NextRequest, NextResponse } from 'next/server'
import type { SupabaseClient } from '@supabase/supabase-js'

export const ADMIN_SESSION_COOKIE = 'sb_admin_session'

interface SessionPayload {
  email: string
  exp: number
  nonce: string
}

const resolveSessionSecret = () =>
  process.env.ADMIN_SESSION_SECRET

const base64UrlEncode = (input: string) => Buffer.from(input, 'utf8').toString('base64url')
const base64UrlDecode = (input: string) => Buffer.from(input, 'base64url').toString('utf8')

const signValue = (value: string) =>
  (() => {
    const secret = resolveSessionSecret()

    if (!secret) {
      throw new Error('ADMIN_SESSION_SECRET is missing')
    }

    return createHmac('sha256', secret).update(value).digest('base64url')
  })()

export function createAdminSessionToken(email: string, ttlSeconds = 60 * 60 * 12) {
  const payload: SessionPayload = {
    email,
    exp: Math.floor(Date.now() / 1000) + ttlSeconds,
    nonce: randomBytes(12).toString('hex'),
  }

  const encodedPayload = base64UrlEncode(JSON.stringify(payload))
  const signature = signValue(encodedPayload)

  return `${encodedPayload}.${signature}`
}

export function verifyAdminSessionToken(token?: string | null): SessionPayload | null {
  if (!token) {
    return null
  }

  const [encodedPayload, signature] = token.split('.')

  if (!encodedPayload || !signature) {
    return null
  }

  const expectedSignature = signValue(encodedPayload)

  if (
    signature.length !== expectedSignature.length ||
    !timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSignature))
  ) {
    return null
  }

  try {
    const payload = JSON.parse(base64UrlDecode(encodedPayload)) as SessionPayload

    if (!payload?.email || !payload.exp || payload.exp < Math.floor(Date.now() / 1000)) {
      return null
    }

    return payload
  } catch {
    return null
  }
}

export function setAdminSessionCookie(response: NextResponse, token: string) {
  response.cookies.set({
    name: ADMIN_SESSION_COOKIE,
    value: token,
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/',
    maxAge: 60 * 60 * 12,
  })
}

export function clearAdminSessionCookie(response: NextResponse) {
  response.cookies.set({
    name: ADMIN_SESSION_COOKIE,
    value: '',
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/',
    maxAge: 0,
  })
}

interface AdminUserRow {
  id: string
  email: string
  is_super_admin: boolean
  is_active: boolean
}

export async function requireAdminSession(request: NextRequest, supabase: SupabaseClient) {
  const token = request.cookies.get(ADMIN_SESSION_COOKIE)?.value
  const payload = verifyAdminSessionToken(token)

  if (!payload?.email) {
    throw new Error('Not authenticated')
  }

  const { data: adminRow, error } = await supabase
    .from('admin_users')
    .select('id, email, is_super_admin, is_active')
    .eq('email', payload.email)
    .maybeSingle<AdminUserRow>()

  if (error) {
    throw new Error(error.message)
  }

  if (!adminRow || !adminRow.is_active) {
    throw new Error('Not authenticated')
  }

  return adminRow
}

export async function requireSuperAdminSession(request: NextRequest, supabase: SupabaseClient) {
  const adminRow = await requireAdminSession(request, supabase)

  if (!adminRow.is_super_admin) {
    throw new Error('Not authorized')
  }

  return adminRow
}
