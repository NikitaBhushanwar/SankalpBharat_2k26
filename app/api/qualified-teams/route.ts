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

const sanitizeParticipants = (value: unknown): string[] => {
  if (!Array.isArray(value)) return []
  return value
    .map((item) => String(item).trim())
    .filter((item) => item.length > 0)
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

    const teamName = String(body.teamName ?? '').trim()
    const logoUrl = String(body.logoUrl ?? '').trim()
    const collegeName = String(body.collegeName ?? '').trim()
    const participantNames = sanitizeParticipants(body.participantNames)

    if (!teamName || !logoUrl || !collegeName) {
      return NextResponse.json<ApiResponse<null>>(
        {
          success: false,
          error: 'Team name, logo, and college name are required',
        },
        { status: 400 }
      )
    }

    if (participantNames.length < 2 || participantNames.length > 6) {
      return NextResponse.json<ApiResponse<null>>(
        {
          success: false,
          error: 'Participants must be between 2 and 6',
        },
        { status: 400 }
      )
    }

    const created = await createQualifiedTeam(supabase, {
      teamName,
      logoUrl,
      participantNames,
      collegeName,
    })

    return NextResponse.json<ApiResponse<QualifiedTeamEntry>>(
      {
        success: true,
        data: created,
      },
      { status: 201 }
    )
  } catch (error) {
    return NextResponse.json<ApiResponse<null>>(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create qualified team',
      },
      { status: 500 }
    )
  }
}
