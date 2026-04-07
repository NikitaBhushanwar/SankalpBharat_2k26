import { NextRequest, NextResponse } from 'next/server'
import {
  deleteAnnouncement,
  type AnnouncementEntry,
  updateAnnouncement,
} from '@/lib/admin-repository'
import { requireAdminSession } from '@/lib/admin-session'
import { getSupabaseAdmin } from '@/lib/supabase-admin'

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
          error: 'Invalid announcement id',
        },
        { status: 400 }
      )
    }

    const title = body.title !== undefined ? String(body.title).trim() : undefined
    const message = body.message !== undefined ? String(body.message).trim() : undefined
    const tag = body.tag !== undefined ? String(body.tag).trim() || 'Update' : undefined

    const updatedAnnouncement = await updateAnnouncement(supabase, id, {
      title,
      message,
      tag,
    })

    return NextResponse.json<ApiResponse<AnnouncementEntry>>(
      {
        success: true,
        data: updatedAnnouncement,
      },
      { status: 200 }
    )
  } catch (error) {
    return NextResponse.json<ApiResponse<null>>(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to update announcement',
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
          error: 'Invalid announcement id',
        },
        { status: 400 }
      )
    }

    await deleteAnnouncement(supabase, id)

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
        error: error instanceof Error ? error.message : 'Failed to delete announcement',
      },
      { status: 500 }
    )
  }
}