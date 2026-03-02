import { NextRequest, NextResponse } from 'next/server'
import { winnersStore } from '@/lib/admin-store'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const winner = winnersStore.find((entry) => entry.id === id)

    if (!winner) {
      return NextResponse.json(
        { success: false, error: 'Winner not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ success: true, data: winner }, { status: 200 })
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
    const { id } = await params
    const body = await request.json()
    const { teamName, title, prizeAmount } = body

    const winnerIndex = winnersStore.findIndex((entry) => entry.id === id)

    if (winnerIndex === -1) {
      return NextResponse.json(
        { success: false, error: 'Winner not found' },
        { status: 404 }
      )
    }

    winnersStore[winnerIndex] = {
      ...winnersStore[winnerIndex],
      teamName: teamName || winnersStore[winnerIndex].teamName,
      title: title || winnersStore[winnerIndex].title,
      prizeAmount: prizeAmount || winnersStore[winnerIndex].prizeAmount,
    }

    return NextResponse.json(
      {
        success: true,
        data: winnersStore[winnerIndex],
        message: 'Winner updated successfully',
      },
      { status: 200 }
    )
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to update winner',
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
    const winnerIndex = winnersStore.findIndex((entry) => entry.id === id)

    if (winnerIndex === -1) {
      return NextResponse.json(
        { success: false, error: 'Winner not found' },
        { status: 404 }
      )
    }

    const deletedWinner = winnersStore.splice(winnerIndex, 1)[0]

    winnersStore.forEach((winner, index) => {
      winner.rank = index + 1
    })

    return NextResponse.json(
      {
        success: true,
        data: deletedWinner,
        message: 'Winner deleted successfully',
      },
      { status: 200 }
    )
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to delete winner',
      },
      { status: 500 }
    )
  }
}
