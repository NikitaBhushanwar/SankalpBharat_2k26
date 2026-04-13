import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase-admin'
import { requireAdminSession } from '@/lib/admin-session'
import {
  createFinalistTeam,
  readAllFinalistTeams,
  type FinalistTeamEntry,
} from '@/lib/admin-repository'

interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
}

export async function GET() {
  try {
    const supabase = getSupabaseAdmin()
    const teams = await readAllFinalistTeams(supabase)

    return NextResponse.json<ApiResponse<FinalistTeamEntry[]>>(
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
        error: error instanceof Error ? error.message : 'Failed to fetch finalist teams',
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
    const teamLeaderName = String(body.teamLeaderName ?? '').trim()
    const collegeName = String(body.collegeName ?? '').trim()
    const sequenceNo = Number(body.sequenceNo ?? 0)

    if (!teamId || !teamName || !teamLeaderName || !collegeName) {
      return NextResponse.json<ApiResponse<null>>(
        {
          success: false,
          error: 'Team ID, team name, team leader name, and college name are required',
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

    const created = await createFinalistTeam(supabase, {
      teamId,
      teamName,
      logoUrl,
      teamLeaderName,
      collegeName,
      sequenceNo,
    })

    return NextResponse.json<ApiResponse<FinalistTeamEntry>>(
      {
        success: true,
        data: created,
      },
      { status: 201 }
    )
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to create finalist team'

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
