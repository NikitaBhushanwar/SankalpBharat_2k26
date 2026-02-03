import { NextRequest, NextResponse } from 'next/server'

// In-memory data storage for demo. In production, this would be a database
let leaderboardData = [
  {
    id: '1',
    rank: 1,
    teamName: 'Green Innovators',
    projectTitle: 'Renewable Energy Management System',
    score: 9850,
    members: 4,
  },
  {
    id: '2',
    rank: 2,
    teamName: 'AgriTech Revolution',
    projectTitle: 'AI-Powered Crop Disease Detection',
    score: 9720,
    members: 3,
  },
  {
    id: '3',
    rank: 3,
    teamName: 'EcoSolve',
    projectTitle: 'Smart Waste Management Platform',
    score: 9620,
    members: 5,
  },
  {
    id: '4',
    rank: 4,
    teamName: 'FarmConnect',
    projectTitle: 'Real-time Market Price Intelligence',
    score: 9480,
    members: 4,
  },
  {
    id: '5',
    rank: 5,
    teamName: 'ClimateShield',
    projectTitle: 'Carbon Footprint Tracking App',
    score: 9350,
    members: 3,
  },
]

export async function GET(request: NextRequest) {
  try {
    // Get query parameters for filtering/sorting
    const searchParams = request.nextUrl.searchParams
    const limit = searchParams.get('limit')
    const sortBy = searchParams.get('sortBy') || 'rank'

    let data = [...leaderboardData]

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
        total: leaderboardData.length,
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
      rank: leaderboardData.length + 1,
      teamName,
      projectTitle,
      score: parseInt(score),
      members: parseInt(members),
    }

    leaderboardData.push(newEntry)

    // Sort by score
    leaderboardData.sort((a, b) => b.score - a.score)
    leaderboardData.forEach((entry, index) => {
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
