import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase-admin'
import { mapLeaderboardRow, recomputeLeaderboardRanks } from '@/lib/admin-repository'
import { requireAdminSession } from '@/lib/admin-session'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = getSupabaseAdmin()
    const { id } = await params
    const { data: entry, error } = await supabase
      .from('leaderboard_entries')
      .select('*')
      .eq('id', id)
      .single()

    if (error || !entry) {
      return NextResponse.json(
        { success: false, error: 'Entry not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ success: true, data: mapLeaderboardRow(entry) }, { status: 200 })
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch entry',
      },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = getSupabaseAdmin()
    await requireAdminSession(request, supabase)
    const { id } = await params
    const body = await request.json()
    const { teamName, projectTitle, score, isDisqualified } = body

    const updatePayload: {
      team_name?: string
      project_title?: string
      score?: number
      is_disqualified?: boolean
    } = {}

    if (teamName !== undefined) {
      updatePayload.team_name = String(teamName).trim()
    }

    if (projectTitle !== undefined) {
      updatePayload.project_title = String(projectTitle).trim()
    }

    if (score !== undefined) {
      const parsedScore = Number(score)
      if (!Number.isFinite(parsedScore)) {
        return NextResponse.json({ success: false, error: 'Invalid score' }, { status: 400 })
      }
      updatePayload.score = parsedScore
    }

    if (isDisqualified !== undefined) {
      updatePayload.is_disqualified = Boolean(isDisqualified)
    }

    const { data: updatedRow, error: updateError } = await supabase
      .from('leaderboard_entries')
      .update(updatePayload)
      .eq('id', id)
      .select('*')
      .single()

    if (updateError || !updatedRow) {
      return NextResponse.json(
        { success: false, error: 'Entry not found' },
        { status: 404 }
      )
    }

    await recomputeLeaderboardRanks(supabase)

    const { data: finalRow, error: finalRowError } = await supabase
      .from('leaderboard_entries')
      .select('*')
      .eq('id', updatedRow.id)
      .single()

    if (finalRowError || !finalRow) {
      throw new Error(finalRowError?.message || 'Failed to fetch updated entry')
    }

    return NextResponse.json(
      {
        success: true,
        data: mapLeaderboardRow(finalRow),
        message: 'Entry updated successfully',
      },
      { status: 200 }
    )
  } catch (error) {
    const status = error instanceof Error && error.message === 'Not authenticated' ? 401 : 500

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to update entry',
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

    const { data: deletedRow, error: deleteError } = await supabase
      .from('leaderboard_entries')
      .delete()
      .eq('id', id)
      .select('*')
      .single()

    if (deleteError || !deletedRow) {
      return NextResponse.json(
        { success: false, error: 'Entry not found' },
        { status: 404 }
      )
    }

    await recomputeLeaderboardRanks(supabase)

    return NextResponse.json(
      {
        success: true,
        data: mapLeaderboardRow(deletedRow),
        message: 'Entry deleted successfully',
      },
      { status: 200 }
    )
  } catch (error) {
    const status = error instanceof Error && error.message === 'Not authenticated' ? 401 : 500

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to delete entry',
      },
      { status }
    )
  }
}
