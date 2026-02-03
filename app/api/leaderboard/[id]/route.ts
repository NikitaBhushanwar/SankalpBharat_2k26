import { NextRequest, NextResponse } from 'next/server'

// This would be a database in production
// For now using a shared store - in real app use a proper database
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
]

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
    const entry = leaderboardData.find((e) => e.id === id)

    if (!entry) {
      return NextResponse.json(
        { success: false, error: 'Entry not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ success: true, data: entry }, { status: 200 })
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
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
    const body = await request.json()
    const { teamName, projectTitle, score, members } = body

    const entryIndex = leaderboardData.findIndex((e) => e.id === id)

    if (entryIndex === -1) {
      return NextResponse.json(
        { success: false, error: 'Entry not found' },
        { status: 404 }
      )
    }

    // Update entry
    leaderboardData[entryIndex] = {
      ...leaderboardData[entryIndex],
      teamName: teamName || leaderboardData[entryIndex].teamName,
      projectTitle: projectTitle || leaderboardData[entryIndex].projectTitle,
      score: score !== undefined ? parseInt(score) : leaderboardData[entryIndex].score,
      members: members !== undefined ? parseInt(members) : leaderboardData[entryIndex].members,
    }

    // Re-sort and update ranks
    leaderboardData.sort((a, b) => b.score - a.score)
    leaderboardData.forEach((entry, index) => {
      entry.rank = index + 1
    })

    return NextResponse.json(
      {
        success: true,
        data: leaderboardData[entryIndex],
        message: 'Entry updated successfully',
      },
      { status: 200 }
    )
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to update entry',
      },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params

    const entryIndex = leaderboardData.findIndex((e) => e.id === id)

    if (entryIndex === -1) {
      return NextResponse.json(
        { success: false, error: 'Entry not found' },
        { status: 404 }
      )
    }

    const deletedEntry = leaderboardData.splice(entryIndex, 1)[0]

    // Re-sort and update ranks
    leaderboardData.sort((a, b) => b.score - a.score)
    leaderboardData.forEach((entry, index) => {
      entry.rank = index + 1
    })

    return NextResponse.json(
      {
        success: true,
        data: deletedEntry,
        message: 'Entry deleted successfully',
      },
      { status: 200 }
    )
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to delete entry',
      },
      { status: 500 }
    )
  }
}
