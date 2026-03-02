import { NextRequest, NextResponse } from 'next/server'
import { winnersStore } from '@/lib/admin-store'

export async function GET() {
  try {
    const data = [...winnersStore].sort((a, b) => a.rank - b.rank)

    return NextResponse.json(
      {
        success: true,
        data,
        total: winnersStore.length,
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
    const body = await request.json()
    const { teamName, title, prizeAmount } = body

    if (!teamName || !title || !prizeAmount) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing required fields',
        },
        { status: 400 }
      )
    }

    const newWinner = {
      id: Date.now().toString(),
      rank: winnersStore.length + 1,
      teamName: String(teamName),
      title: String(title),
      prizeAmount: String(prizeAmount),
    }

    winnersStore.push(newWinner)

    winnersStore
      .sort((a, b) => a.rank - b.rank)
      .forEach((winner, index) => {
        winner.rank = index + 1
      })

    const createdWinner = winnersStore.find((winner) => winner.id === newWinner.id)

    return NextResponse.json(
      {
        success: true,
        data: createdWinner,
        message: 'Winner added successfully',
      },
      { status: 201 }
    )
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create winner',
      },
      { status: 500 }
    )
  }
}
