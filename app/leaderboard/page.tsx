import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowLeft, Trophy } from 'lucide-react'
import LeaderboardLive from '@/components/leaderboard-live'

export const metadata: Metadata = {
  title: 'Leaderboard - Sankalp Bharat Hackathon 2026',
  description: 'Live leaderboard and results for Sankalp Bharat Hackathon 2026',
}

export default function LeaderboardPage() {
  return (
    <main className="min-h-screen px-4 sm:px-6 lg:px-8 pt-28 pb-10">
      <div className="max-w-7xl mx-auto rounded-3xl border border-emerald-500/20 bg-white/80 dark:bg-slate-950/80 backdrop-blur-xl p-4 sm:p-6 lg:p-8">
        <div className="flex items-center justify-between mb-6">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 dark:text-slate-300 hover:text-emerald-400 transition"
          >
            <ArrowLeft size={16} /> Back to Home
          </Link>
        </div>

        <div className="mb-6">
          <p className="inline-flex items-center gap-2 text-xs uppercase tracking-wider text-emerald-400 font-bold mb-2">
            <Trophy size={14} /> Live Rankings
          </p>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-900 dark:text-white">Leaderboard</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Latest team standings from Sankalp Bharat 2K26.</p>
        </div>

        <LeaderboardLive />
      </div>
    </main>
  )
}
