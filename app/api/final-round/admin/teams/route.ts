import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase-admin'
import { requireSuperAdminSession } from '@/lib/admin-session'
import {
  deleteFinalRoundTeamCredentials,
  readFinalRoundAdminOverview,
  upsertFinalRoundTeamCredentials,
} from '@/lib/final-round-repository'

interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
}

export async function POST(request: NextRequest) {
  try {
    const supabase = getSupabaseAdmin()
    await requireSuperAdminSession(request, supabase)
    const body = (await request.json()) as {
      teamId?: string
      teamName?: string
      password?: string
    }

    await upsertFinalRoundTeamCredentials(supabase, {
      teamId: body.teamId ?? '',
      teamName: body.teamName,
      password: body.password ?? '',
    })
    const data = await readFinalRoundAdminOverview(supabase)

    return NextResponse.json<ApiResponse<typeof data>>(
      {
        success: true,
        data,
      },
      { status: 200 }
    )
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to save final round team credentials'
    return NextResponse.json<ApiResponse<null>>(
      {
        success: false,
        error: message,
      },
      { status: message === 'Not authenticated' ? 401 : message === 'Not authorized' ? 403 : 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const supabase = getSupabaseAdmin()
    await requireSuperAdminSession(request, supabase)

    let teamId = request.nextUrl.searchParams.get('teamId') ?? ''

    if (!teamId) {
      try {
        const body = (await request.json()) as { teamId?: string }
        teamId = body.teamId ?? ''
      } catch {
        teamId = ''
      }
    }

    await deleteFinalRoundTeamCredentials(supabase, teamId)
    const data = await readFinalRoundAdminOverview(supabase)

    return NextResponse.json<ApiResponse<typeof data>>(
      {
        success: true,
        data,
      },
      { status: 200 }
    )
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to delete final round team credentials'
    return NextResponse.json<ApiResponse<null>>(
      {
        success: false,
        error: message,
      },
      { status: message === 'Not authenticated' ? 401 : message === 'Not authorized' ? 403 : 500 }
    )
  }
}
