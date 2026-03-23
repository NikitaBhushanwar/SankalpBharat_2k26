import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase-admin'
import { requireAdminSession } from '@/lib/admin-session'
import {
  deleteQualifiedTeam,
  updateQualifiedTeam,
  type QualifiedTeamEntry,
} from '@/lib/admin-repository'

interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
}

const isValidRouteId = (id: unknown): id is string =>
  typeof id === 'string' && id.trim().length > 0 && id !== 'undefined' && id !== 'null'

const sanitizeParticipants = (value: unknown): string[] => {
  if (!Array.isArray(value)) return []
  return value
    .map((item) => String(item).trim())
    .filter((item) => item.length > 0)
}

const getQualifiedTeamsStoragePathFromUrl = (url?: string | null): string | null => {
  if (!url || typeof url !== 'string') {
    return null
  }

  const publicMarker = '/storage/v1/object/public/qualified-teams/'
  const publicMarkerIndex = url.indexOf(publicMarker)

  if (publicMarkerIndex !== -1) {
    return decodeURIComponent(url.slice(publicMarkerIndex + publicMarker.length))
  }

  if (!url.includes('://') && !url.startsWith('data:')) {
    return url
  }

  return null
}

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

    const updatePayload: Partial<Omit<QualifiedTeamEntry, 'id'>> = {}

    if (body.teamName !== undefined) {
      updatePayload.teamName = String(body.teamName).trim()
    }

    if (body.logoUrl !== undefined) {
      updatePayload.logoUrl = String(body.logoUrl).trim()
    }

    if (body.collegeName !== undefined) {
      updatePayload.collegeName = String(body.collegeName).trim()
    }

    if (body.participantNames !== undefined) {
      const participantNames = sanitizeParticipants(body.participantNames)
      if (participantNames.length < 2 || participantNames.length > 6) {
        return NextResponse.json<ApiResponse<null>>(
          {
            success: false,
            error: 'Participants must be between 2 and 6',
          },
          { status: 400 }
        )
      }
      updatePayload.participantNames = participantNames
    }

    const updated = await updateQualifiedTeam(supabase, id, updatePayload)

    return NextResponse.json<ApiResponse<QualifiedTeamEntry>>(
      {
        success: true,
        data: updated,
      },
      { status: 200 }
    )
  } catch (error) {
    return NextResponse.json<ApiResponse<null>>(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to update qualified team',
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
      .from('qualified_teams')
      .select('logo_url')
      .eq('id', id)
      .maybeSingle<{ logo_url: string | null }>()

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

    const storagePath = getQualifiedTeamsStoragePathFromUrl(teamRow.logo_url)
    if (storagePath) {
      const { error: removeImageError } = await supabase.storage
        .from('qualified-teams')
        .remove([storagePath])

      if (removeImageError) {
        console.warn('Failed to remove qualified team logo from storage:', removeImageError.message)
      }
    }

    await deleteQualifiedTeam(supabase, id)

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
        error: error instanceof Error ? error.message : 'Failed to delete qualified team',
      },
      { status: 500 }
    )
  }
}
