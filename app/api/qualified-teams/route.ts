import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase-admin'
import { requireAdminSession } from '@/lib/admin-session'
import {
  createQualifiedTeam,
  readAllQualifiedTeams,
  type QualifiedTeamEntry,
} from '@/lib/admin-repository'

interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
}

export async function GET() {
  try {
    const supabase = getSupabaseAdmin()
    const teams = await readAllQualifiedTeams(supabase)

    return NextResponse.json<ApiResponse<QualifiedTeamEntry[]>>(
      {
        success: true,
        data: teams,
      },
      { status: 200 }
    )
  } catch (error) {
    return NextResponse.json<ApiResponse<null>>(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch qualified teams',
      },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = getSupabaseAdmin()
    await requireAdminSession(request, supabase)
    const body = await request.json()

    const teamId = String(body.teamId ?? '').trim()
    const teamName = String(body.teamName ?? '').trim()
    const logoUrl = String(body.logoUrl ?? '').trim()
    const collegeName = String(body.collegeName ?? '').trim()
    const sequenceNo = Number(body.sequenceNo ?? 0)

    if (!teamId || !teamName || !collegeName) {
      return NextResponse.json<ApiResponse<null>>(
        {
          success: false,
          error: 'Team ID, team name, and college name are required',
        },
        { status: 400 }
      )
    }

    if (!Number.isInteger(sequenceNo) || sequenceNo < 0) {
      return NextResponse.json<ApiResponse<null>>(
        {
          success: false,
          error: 'Sequence number must be a non-negative integer',
        },
        { status: 400 }
      )
    }

    const created = await createQualifiedTeam(supabase, {
      teamId,
      teamName,
      logoUrl,
      collegeName,
      sequenceNo,
    })

    return NextResponse.json<ApiResponse<QualifiedTeamEntry>>(
      {
        success: true,
        data: created,
      },
      { status: 201 }
    )
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to create qualified team'

    if (message.toLowerCase().includes('duplicate key') && message.toLowerCase().includes('team_id')) {
      return NextResponse.json<ApiResponse<null>>(
        {
          success: false,
          error: 'Team ID already exists. Please use a unique Team ID.',
        },
        { status: 409 }
      )
    }

    return NextResponse.json<ApiResponse<null>>(
      {
        success: false,
        error: message,
      },
      { status: 500 }
    )
  }
}
