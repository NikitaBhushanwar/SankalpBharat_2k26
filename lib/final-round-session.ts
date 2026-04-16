import { createHmac, randomBytes, timingSafeEqual } from 'crypto'
import type { NextRequest, NextResponse } from 'next/server'
import type { SupabaseClient } from '@supabase/supabase-js'

export const FINAL_ROUND_SESSION_COOKIE = 'sb_final_round_session'

interface SessionPayload {
  teamId: string
  exp: number
  nonce: string
}

const resolveSessionSecret = () => process.env.FINAL_ROUND_SESSION_SECRET

const base64UrlEncode = (input: string) => Buffer.from(input, 'utf8').toString('base64url')
const base64UrlDecode = (input: string) => Buffer.from(input, 'base64url').toString('utf8')

const signValue = (value: string) => {
  const secret = resolveSessionSecret()

  if (!secret) {
    throw new Error('FINAL_ROUND_SESSION_SECRET is missing')
  }

  return createHmac('sha256', secret).update(value).digest('base64url')
}

export function createFinalRoundSessionToken(teamId: string, ttlSeconds = 60 * 60 * 12) {
  const payload: SessionPayload = {
    teamId,
    exp: Math.floor(Date.now() / 1000) + ttlSeconds,
    nonce: randomBytes(12).toString('hex'),
  }

  const encodedPayload = base64UrlEncode(JSON.stringify(payload))
  const signature = signValue(encodedPayload)

  return `${encodedPayload}.${signature}`
}

export function verifyFinalRoundSessionToken(token?: string | null): SessionPayload | null {
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

    if (!payload?.teamId || !payload.exp || payload.exp < Math.floor(Date.now() / 1000)) {
      return null
    }

    return payload
  } catch {
    return null
  }
}

export function setFinalRoundSessionCookie(response: NextResponse, token: string) {
  response.cookies.set({
    name: FINAL_ROUND_SESSION_COOKIE,
    value: token,
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/',
    maxAge: 60 * 60 * 12,
  })
}

export function clearFinalRoundSessionCookie(response: NextResponse) {
  response.cookies.set({
    name: FINAL_ROUND_SESSION_COOKIE,
    value: '',
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/',
    maxAge: 0,
  })
}

interface FinalRoundTeamRow {
  id: string
  team_id: string
  team_name: string
  password_hash: string
  selected_problem_statement_id: string | null
  selected_at: string | null
}

export async function requireFinalRoundSession(request: NextRequest, supabase: SupabaseClient) {
  const token = request.cookies.get(FINAL_ROUND_SESSION_COOKIE)?.value
  const payload = verifyFinalRoundSessionToken(token)

  if (!payload?.teamId) {
    throw new Error('Not authenticated')
  }

  const { data: teamRow, error } = await supabase
    .from('final_round_teams')
    .select('id, team_id, team_name, password_hash, selected_problem_statement_id, selected_at')
    .eq('team_id', payload.teamId)
    .maybeSingle<FinalRoundTeamRow>()

  if (error) {
    throw new Error(error.message)
  }

  if (!teamRow) {
    throw new Error('Not authenticated')
  }

  return teamRow
}