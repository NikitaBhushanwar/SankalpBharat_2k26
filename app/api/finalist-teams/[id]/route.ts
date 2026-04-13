import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase-admin'
import { requireAdminSession } from '@/lib/admin-session'
import {
  deleteFinalistTeam,
  updateFinalistTeam,
  type FinalistTeamEntry,
} from '@/lib/admin-repository'

interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
}

const isValidRouteId = (id: unknown): id is string =>
  typeof id === 'string' && id.trim().length > 0 && id !== 'undefined' && id !== 'null'

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = getSupabaseAdmin()
    await requireAdminSession(request, supabase)
    const body = await request.json()
    const { id } = await params

    if (!isValidRouteId(id)) {
      return NextResponse.json<ApiResponse<null>>(
        {
          success: false,
          error: 'Invalid team id',
        },
        { status: 400 }
      )
    }

    const updatePayload: Partial<Omit<FinalistTeamEntry, 'id'>> = {}

    if (body.teamId !== undefined) {
      const teamId = String(body.teamId).trim()
      if (!teamId) {
        return NextResponse.json<ApiResponse<null>>(
          {
            success: false,
            error: 'Team ID cannot be empty',
          },
          { status: 400 }
        )
      }
      updatePayload.teamId = teamId
    }

    if (body.teamName !== undefined) {
      updatePayload.teamName = String(body.teamName).trim()
    }

    if (body.logoUrl !== undefined) {
      updatePayload.logoUrl = String(body.logoUrl).trim()
    }

    if (body.teamLeaderName !== undefined) {
      const teamLeaderName = String(body.teamLeaderName).trim()
      if (!teamLeaderName) {
        return NextResponse.json<ApiResponse<null>>(
          {
            success: false,
            error: 'Team leader name cannot be empty',
          },
          { status: 400 }
        )
      }
      updatePayload.teamLeaderName = teamLeaderName
    }

    if (body.collegeName !== undefined) {
      updatePayload.collegeName = String(body.collegeName).trim()
    }

    if (body.sequenceNo !== undefined) {
      const sequenceNo = Number(body.sequenceNo)
      if (!Number.isInteger(sequenceNo) || sequenceNo < 0) {
        return NextResponse.json<ApiResponse<null>>(
          {
            success: false,
            error: 'Sequence number must be a non-negative integer',
          },
          { status: 400 }
        )
      }
      updatePayload.sequenceNo = sequenceNo
    }

    const updated = await updateFinalistTeam(supabase, id, updatePayload)

    return NextResponse.json<ApiResponse<FinalistTeamEntry>>(
      {
        success: true,
        data: updated,
      },
      { status: 200 }
    )
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to update finalist team'

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

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = getSupabaseAdmin()
    await requireAdminSession(request, supabase)
    const { id } = await params

    if (!isValidRouteId(id)) {
      return NextResponse.json<ApiResponse<null>>(
        {
          success: false,
          error: 'Invalid team id',
        },
        { status: 400 }
      )
    }

    const { data: teamRow, error: teamError } = await supabase
      .from('finalist_teams')
      .select('id')
      .eq('id', id)
      .maybeSingle<{ id: string }>()

    if (teamError) {
      throw new Error(teamError.message)
    }

    if (!teamRow) {
      return NextResponse.json<ApiResponse<null>>(
        {
          success: false,
          error: 'Team not found',
        },
        { status: 404 }
      )
    }

    await deleteFinalistTeam(supabase, id)

    return NextResponse.json<ApiResponse<null>>(
      {
        success: true,
      },
      { status: 200 }
    )
  } catch (error) {
    return NextResponse.json<ApiResponse<null>>(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to delete finalist team',
      },
      { status: 500 }
    )
  }
}
