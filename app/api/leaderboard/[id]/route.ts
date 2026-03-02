import { NextRequest, NextResponse } from 'next/server'
import { leaderboardStore } from '@/lib/admin-store'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const entry = leaderboardStore.find((e) => e.id === id)

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
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const { teamName, projectTitle, score, members } = body

    const entryIndex = leaderboardStore.findIndex((e) => e.id === id)

    if (entryIndex === -1) {
      return NextResponse.json(
        { success: false, error: 'Entry not found' },
        { status: 404 }
      )
    }

    // Update entry
    leaderboardStore[entryIndex] = {
      ...leaderboardStore[entryIndex],
      teamName: teamName || leaderboardStore[entryIndex].teamName,
      projectTitle: projectTitle || leaderboardStore[entryIndex].projectTitle,
      score: score !== undefined ? parseInt(score) : leaderboardStore[entryIndex].score,
      members: members !== undefined ? parseInt(members) : leaderboardStore[entryIndex].members,
    }

    // Re-sort and update ranks
    leaderboardStore.sort((a, b) => b.score - a.score)
    leaderboardStore.forEach((entry, index) => {
      entry.rank = index + 1
    })

    const updatedEntry = leaderboardStore.find((e) => e.id === id)

    return NextResponse.json(
      {
        success: true,
        data: updatedEntry,
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
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const entryIndex = leaderboardStore.findIndex((e) => e.id === id)

    if (entryIndex === -1) {
      return NextResponse.json(
        { success: false, error: 'Entry not found' },
        { status: 404 }
      )
    }

    const deletedEntry = leaderboardStore.splice(entryIndex, 1)[0]

    // Re-sort and update ranks
    leaderboardStore.sort((a, b) => b.score - a.score)
    leaderboardStore.forEach((entry, index) => {
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
