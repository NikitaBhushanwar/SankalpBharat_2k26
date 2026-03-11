import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowLeft, Medal } from 'lucide-react'
import WinnersLive from '@/components/winners-live'

export const metadata: Metadata = {
  title: 'Winners - Sankalp Bharat Hackathon 2026',
  description: 'Official winners for Sankalp Bharat Hackathon 2026',
}

export default function WinnersPage() {
  return (
    <main className="min-h-screen px-4 sm:px-6 lg:px-8 pt-28 pb-10">
      <div className="max-w-6xl mx-auto rounded-3xl border border-cyan-500/20 bg-white/80 dark:bg-teal-950/80 backdrop-blur-xl p-4 sm:p-6 lg:p-8">
        <div className="flex items-center justify-between mb-6">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 dark:text-slate-300 hover:text-cyan-400 dark:hover:text-cyan-300 transition"
          >
            <ArrowLeft size={16} /> Back to Home
          </Link>
        </div>

        <div className="mb-6">
          <p className="inline-flex items-center gap-2 text-xs uppercase tracking-wider text-cyan-700 dark:text-cyan-300 font-bold mb-2">
            <Medal size={14} /> Hall of Fame
          </p>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-900 dark:text-white">Winners</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Official winning teams and prize details.</p>
        </div>

        <WinnersLive />
      </div>
    </main>
  )
}
