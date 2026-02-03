import { NextResponse } from 'next/server'

export async function GET() {
  return NextResponse.json(
    {
      status: 'ok',
      service: 'Sankalp Bharat Hackathon 2026 API',
      version: '1.0.0',
      timestamp: new Date().toISOString(),
      endpoints: {
        leaderboard: '/api/leaderboard',
        leaderboardEntry: '/api/leaderboard/[id]',
        health: '/api/health',
      },
    },
    { status: 200 }
  )
}
