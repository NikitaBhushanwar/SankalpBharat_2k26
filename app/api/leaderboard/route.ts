import { NextRequest, NextResponse } from 'next/server'
import { leaderboardStore } from '@/lib/admin-store'

export async function GET(request: NextRequest) {
  try {
    // Get query parameters for filtering/sorting
    const searchParams = request.nextUrl.searchParams
    const limit = searchParams.get('limit')
    const sortBy = searchParams.get('sortBy') || 'rank'

    let data = [...leaderboardStore]

    // Sort by specified field
    if (sortBy === 'score') {
      data.sort((a, b) => b.score - a.score)
    } else {
      data.sort((a, b) => a.rank - b.rank)
    }

    // Apply limit
    if (limit) {
      data = data.slice(0, parseInt(limit))
    }

    return NextResponse.json(
      {
        success: true,
        data,
        total: leaderboardStore.length,
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

    // Create new entry
    const newEntry = {
      id: Date.now().toString(),
      rank: leaderboardStore.length + 1,
      teamName,
      projectTitle,
      score: parseInt(score),
      members: parseInt(members),
    }

    leaderboardStore.push(newEntry)

    // Sort by score
    leaderboardStore.sort((a, b) => b.score - a.score)
    leaderboardStore.forEach((entry, index) => {
      entry.rank = index + 1
    })

    return NextResponse.json(
      {
        success: true,
        data: newEntry,
        message: 'Entry added successfully',
      },
      { status: 201 }
    )
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create entry',
      },
      { status: 500 }
    )
  }
}
