import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase-admin'
import { recordVisit } from '@/lib/visit-analytics'

interface ApiResponse {
  success: boolean
  error?: string
}

const isValidVisitorId = (value: string) => /^[a-zA-Z0-9_-]{8,128}$/.test(value)

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as { visitorId?: string; path?: string }
    const visitorId = String(body.visitorId ?? '').trim()
    const path = String(body.path ?? '/').slice(0, 300)

    if (!isValidVisitorId(visitorId)) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: 'Invalid visitor id',
        },
        { status: 400 }
      )
    }

    const supabase = getSupabaseAdmin()
    await recordVisit(supabase, visitorId, path)

    return NextResponse.json<ApiResponse>({ success: true }, { status: 200 })
  } catch (error) {
    return NextResponse.json<ApiResponse>(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to track visit',
      },
      { status: 500 }
    )
  }
}