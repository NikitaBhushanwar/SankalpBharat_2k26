import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase-admin'
import { mapLeaderboardRow, recomputeLeaderboardRanks } from '@/lib/admin-repository'
import { requireAdminSession } from '@/lib/admin-session'

export async function GET(request: NextRequest) {
  try {
    const supabase = getSupabaseAdmin()

    // Get query parameters for filtering/sorting
    const searchParams = request.nextUrl.searchParams
    const limit = searchParams.get('limit')
    const sortBy = searchParams.get('sortBy') || 'rank'

    let query = supabase
      .from('leaderboard_entries')
      .select('*', { count: 'exact' })

    if (sortBy === 'score') {
      query = query.order('score', { ascending: false })
    } else {
      query = query.order('rank', { ascending: true })
    }

    const parsedLimit = limit ? parseInt(limit, 10) : null
    if (parsedLimit && parsedLimit > 0) {
      query = query.limit(parsedLimit)
    }

    const { data, count, error } = await query

    if (error) {
      throw new Error(error.message)
    }

    const mappedData = (data ?? []).map((item) => mapLeaderboardRow(item))

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
        error: error instanceof Error ? error.message : 'Failed to fetch leaderboard',
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
    const { teamName, projectTitle, score, members } = body

    // Validation
    if (!teamName || !projectTitle || score === undefined || members === undefined) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing required fields',
        },
        { status: 400 }
      )
    }

    const parsedScore = Number(score)
    const parsedMembers = Number(members)

    if (!Number.isFinite(parsedScore) || !Number.isFinite(parsedMembers)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Score and members must be valid numbers',
        },
        { status: 400 }
      )
    }

    const { data: createdRow, error: createError } = await supabase
      .from('leaderboard_entries')
      .insert({
        team_name: String(teamName).trim(),
        project_title: String(projectTitle).trim(),
        score: parsedScore,
        members: parsedMembers,
        rank: 0,
      })
      .select('*')
      .single()

    if (createError || !createdRow) {
      throw new Error(createError?.message || 'Failed to create leaderboard entry')
    }

    await recomputeLeaderboardRanks(supabase)

    const { data: finalRow, error: finalRowError } = await supabase
      .from('leaderboard_entries')
      .select('*')
      .eq('id', createdRow.id)
      .single()

    if (finalRowError || !finalRow) {
      throw new Error(finalRowError?.message || 'Failed to fetch created leaderboard entry')
    }

    return NextResponse.json(
      {
        success: true,
        data: mapLeaderboardRow(finalRow),
        message: 'Entry added successfully',
      },
      { status: 201 }
    )
  } catch (error) {
    const status = error instanceof Error && error.message === 'Not authenticated' ? 401 : 500

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create entry',
      },
      { status }
    )
  }
}
