import { NextResponse } from 'next/server'
import { clearFinalRoundSessionCookie } from '@/lib/final-round-session'

export async function POST() {
  const response = NextResponse.json({ success: true }, { status: 200 })
  clearFinalRoundSessionCookie(response)
  return response
}