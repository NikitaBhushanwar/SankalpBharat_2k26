import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase-admin'
import { mapWinnerRow } from '@/lib/admin-repository'
import { requireAdminSession } from '@/lib/admin-session'

export async function GET() {
  try {
    const supabase = getSupabaseAdmin()

    const { data, error, count } = await supabase
      .from('winners')
      .select('*', { count: 'exact' })
      .order('rank', { ascending: true })

    if (error) {
      throw new Error(error.message)
    }

    const mappedData = (data ?? []).map((item) => mapWinnerRow(item))

    return NextResponse.json(
      {
        success: true,
        data: mappedData,
        total: count ?? mappedData.length,
      },
      { status: 200 }
    )
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch winners',
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
    const { teamName, title, placeTitle, collegeName, members, imageUrl, prizeAmount } = body

    const finalPlaceTitle = String(placeTitle ?? title ?? '').trim()
    const finalMembers = Array.isArray(members)
      ? members.map((member) => String(member).trim()).filter(Boolean)
      : []

    if (!teamName || !finalPlaceTitle || !prizeAmount) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing required fields',
        },
        { status: 400 }
      )
    }

    const { count } = await supabase
      .from('winners')
      .select('*', { count: 'exact', head: true })

    const rank = (count ?? 0) + 1

    const { data: createdWinner, error: createError } = await supabase
      .from('winners')
      .insert({
        rank,
        team_name: String(teamName).trim(),
        title: finalPlaceTitle,
        place_title: finalPlaceTitle,
        college_name: String(collegeName ?? '').trim(),
        members: finalMembers,
        image_url: String(imageUrl ?? '').trim(),
        prize_amount: String(prizeAmount).trim(),
      })
      .select('*')
      .single()

    if (createError || !createdWinner) {
      throw new Error(createError?.message || 'Failed to create winner')
    }

    return NextResponse.json(
      {
        success: true,
        data: mapWinnerRow(createdWinner),
        message: 'Winner added successfully',
      },
      { status: 201 }
    )
  } catch (error) {
    const status = error instanceof Error && error.message === 'Not authenticated' ? 401 : 500

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create winner',
      },
      { status }
    )
  }
}
