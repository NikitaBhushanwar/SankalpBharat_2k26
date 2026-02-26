import type { Metadata } from 'next'
import { LeaderboardTable } from '@/components/leaderboard-table'
import ModernFooter from '@/components/modern-footer'
import { ArrowLeft, TrendingUp } from 'lucide-react'
import Link from 'next/link'
import { redirect } from 'next/navigation'

export const metadata: Metadata = {
  title: 'Leaderboard - Sankalp Bharat Hackathon 2026',
  description: 'Live leaderboard and results for Sankalp Bharat Hackathon 2026',
}

export default function LeaderboardPage() {
  redirect('/comming-soon')

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="relative border-b border-gray-200 dark:border-slate-700">
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
          <div className="flex items-center justify-between mb-6 sm:mb-8">
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors text-sm"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Home
            </Link>
          </div>

          <div className="mb-6 sm:mb-8">
            <div className="flex items-center gap-2 sm:gap-3 mb-2 sm:mb-3">
              <TrendingUp className="w-5 h-5 sm:w-6 sm:h-6 text-emerald-600 dark:text-emerald-400" />
              <p className="text-xs sm:text-sm font-semibold text-emerald-600 dark:text-emerald-400 tracking-widest uppercase">Live Results</p>
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-2 sm:mb-3 text-balance leading-tight">
              📊 Leaderboard
            </h1>
            <p className="text-sm sm:text-base lg:text-lg text-gray-600 dark:text-gray-400">
              Real-time rankings of participating teams in Sankalp Bharat Hackathon 2026
            </p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
            {[
              { label: 'Teams Participating', value: '256' },
              { label: 'Total Score Pool', value: '2.5M' },
              { label: 'Last Updated', value: 'Live' },
            ].map((stat) => (
              <div key={stat.label} className="glass-effect rounded-lg sm:rounded-xl p-4 sm:p-6">
                <p className="text-xs sm:text-sm font-semibold text-gray-600 dark:text-gray-400 tracking-widest mb-1 sm:mb-2">{stat.label}</p>
                <p className="text-xl sm:text-2xl font-bold text-emerald-600 dark:text-emerald-400">{stat.value}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

        {/* Leaderboard content */}
        <div className="relative">
          <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
            {/* Filter and controls */}
            <div className="mb-6 sm:mb-8 flex flex-col sm:flex-row gap-3 sm:gap-4 justify-between items-start sm:items-center">
              <div>
                <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                  Showing all {demoData.length} teams · Click column headers to sort
                </p>
              </div>
              <div className="flex gap-2 w-full sm:w-auto">
                <Link href="/leaderboard#all-teams" className="btn-modern text-xs sm:text-sm flex-1 sm:flex-none text-center">
                  All Teams
                </Link>
                <Link href="/leaderboard#top-10" className="px-3 sm:px-4 py-2 text-xs sm:text-sm rounded-lg glass-effect text-gray-600 dark:text-gray-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors text-center">
                  Top 10
                </Link>
              </div>
            </div>

            {/* Table */}
            <div id="all-teams" className="glass-effect rounded-xl sm:rounded-2xl p-4 sm:p-6 lg:p-8 card-hover overflow-x-auto">
              <LeaderboardTable />
            </div>

            <div id="top-10" className="sr-only" />

            {/* Footer note */}
            <div className="mt-6 sm:mt-8 p-3 sm:p-4 border-l-4 border-emerald-500 bg-emerald-500/5 rounded-lg">
              <p className="text-xs sm:text-sm text-gray-700 dark:text-gray-300">
                <span className="font-bold text-emerald-600 dark:text-emerald-400">Note:</span> Leaderboard updates in real-time. Scores are calculated based on innovation, feasibility, impact, and presentation. Final rankings will be announced after judging is complete.
              </p>
            </div>
          </div>
        </div>
    </div>
  )
}

// Mock data - in production, this would come from an API
const demoData = [
  { rank: 1, name: 'Green Innovators', score: 9850 },
  { rank: 2, name: 'AgriTech Revolution', score: 9720 },
  { rank: 3, name: 'EcoSolve', score: 9620 },
]
