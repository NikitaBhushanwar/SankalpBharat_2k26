import { NextRequest, NextResponse } from 'next/server'
import {
  readNavbarVisibilityState,
  writeNavbarVisibilityState,
  type NavbarVisibilityState,
} from '@/lib/admin-repository'
import { assertSuperAdminRequest } from '@/lib/admin-access'
import { getSupabaseAdmin } from '@/lib/supabase-admin'

interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
}

export async function GET() {
  try {
    const supabase = getSupabaseAdmin()
    const visibility = await readNavbarVisibilityState(supabase)

    return NextResponse.json<ApiResponse<NavbarVisibilityState>>(
      {
        success: true,
        data: visibility,
      },
      { status: 200 }
    )
  } catch (error) {
    return NextResponse.json<ApiResponse<NavbarVisibilityState>>(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch navbar visibility',
      },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const supabase = getSupabaseAdmin()
    await assertSuperAdminRequest(request, supabase)

    const body = (await request.json()) as Partial<NavbarVisibilityState>

    if (
      typeof body.leaderboard !== 'boolean' ||
      typeof body.winners !== 'boolean' ||
      typeof body.qualifiedTeams !== 'boolean'
    ) {
      return NextResponse.json<ApiResponse<NavbarVisibilityState>>(
        {
          success: false,
          error: 'Invalid payload',
        },
        { status: 400 }
      )
    }

    const nextState: NavbarVisibilityState = {
      leaderboard: body.leaderboard,
      winners: body.winners,
      qualifiedTeams: body.qualifiedTeams,
    }

    await writeNavbarVisibilityState(supabase, nextState)

    return NextResponse.json<ApiResponse<NavbarVisibilityState>>(
      {
        success: true,
        data: nextState,
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

    return NextResponse.json<ApiResponse<NavbarVisibilityState>>(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to update navbar visibility',
      },
      { status }
    )
  }
}
