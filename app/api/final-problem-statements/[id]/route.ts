import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase-admin'
import { requireAdminSession } from '@/lib/admin-session'
import {
  deleteFinalProblemStatement,
  updateFinalProblemStatement,
  type FinalProblemStatementEntry,
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
          error: 'Invalid statement id',
        },
        { status: 400 }
      )
    }

    const updatePayload: Partial<Omit<FinalProblemStatementEntry, 'id'>> = {}

    if (body.title !== undefined) updatePayload.title = String(body.title).trim()
    if (body.domain !== undefined) updatePayload.domain = String(body.domain).trim()
    if (body.description !== undefined) updatePayload.description = String(body.description).trim()
    if (body.pdfLink !== undefined) updatePayload.pdfLink = String(body.pdfLink).trim()

    const updated = await updateFinalProblemStatement(supabase, id, updatePayload)

    return NextResponse.json<ApiResponse<FinalProblemStatementEntry>>(
      {
        success: true,
        data: updated,
      },
      { status: 200 }
    )
  } catch (error) {
    const status = error instanceof Error && error.message === 'Not authenticated' ? 401 : 500

    return NextResponse.json<ApiResponse<null>>(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to update final problem statement',
      },
      { status }
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
          error: 'Invalid statement id',
        },
        { status: 400 }
      )
    }

    await deleteFinalProblemStatement(supabase, id)

    return NextResponse.json<ApiResponse<null>>(
      {
        success: true,
      },
      { status: 200 }
    )
  } catch (error) {
    const status = error instanceof Error && error.message === 'Not authenticated' ? 401 : 500

    return NextResponse.json<ApiResponse<null>>(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to delete final problem statement',
      },
      { status }
    )
  }
}
