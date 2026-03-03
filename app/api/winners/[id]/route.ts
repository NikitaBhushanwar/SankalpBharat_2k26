import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase-admin'
import { mapWinnerRow, recomputeWinnerRanks } from '@/lib/admin-repository'
import { requireAdminSession } from '@/lib/admin-session'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = getSupabaseAdmin()
    const { id } = await params
    const { data: winner, error } = await supabase
      .from('winners')
      .select('*')
      .eq('id', id)
      .single()

    if (error || !winner) {
      return NextResponse.json(
        { success: false, error: 'Winner not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ success: true, data: mapWinnerRow(winner) }, { status: 200 })
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch winner',
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
    const { teamName, title, prizeAmount } = body

    const updatePayload: {
      team_name?: string
      title?: string
      prize_amount?: string
    } = {}

    if (teamName !== undefined) {
      updatePayload.team_name = String(teamName).trim()
    }

    if (title !== undefined) {
      updatePayload.title = String(title).trim()
    }

    if (prizeAmount !== undefined) {
      updatePayload.prize_amount = String(prizeAmount).trim()
    }

    const { data: winner, error: updateError } = await supabase
      .from('winners')
      .update(updatePayload)
      .eq('id', id)
      .select('*')
      .single()

    if (updateError || !winner) {
      return NextResponse.json(
        { success: false, error: 'Winner not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(
      {
        success: true,
        data: mapWinnerRow(winner),
        message: 'Winner updated successfully',
      },
      { status: 200 }
    )
  } catch (error) {
    const status = error instanceof Error && error.message === 'Not authenticated' ? 401 : 500

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to update winner',
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

    const { data: deletedWinner, error: deleteError } = await supabase
      .from('winners')
      .delete()
      .eq('id', id)
      .select('*')
      .single()

    if (deleteError || !deletedWinner) {
      return NextResponse.json(
        { success: false, error: 'Winner not found' },
        { status: 404 }
      )
    }

    await recomputeWinnerRanks(supabase)

    return NextResponse.json(
      {
        success: true,
        data: mapWinnerRow(deletedWinner),
        message: 'Winner deleted successfully',
      },
      { status: 200 }
    )
  } catch (error) {
    const status = error instanceof Error && error.message === 'Not authenticated' ? 401 : 500

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to delete winner',
      },
      { status }
    )
  }
}
