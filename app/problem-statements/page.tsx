import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowLeft, FileText } from 'lucide-react'
import ProblemStatementsLive from '@/components/problem-statements-live'

export const metadata: Metadata = {
  title: 'Problem Statements - Sankalp Bharat Hackathon 2K26',
  description: 'Official problem statements published for Sankalp Bharat Hackathon 2K26.',
}

export default function ProblemStatementsPage() {
  return (
    <main className="min-h-screen px-4 sm:px-6 lg:px-8 pt-28 pb-10">
      <div className="max-w-6xl mx-auto rounded-3xl border border-orange-500/20 bg-white/80 dark:bg-slate-950/80 backdrop-blur-xl p-5 sm:p-7 lg:p-10">
        <div className="mb-8">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 dark:text-slate-300 hover:text-orange-400 transition"
          >
            <ArrowLeft size={16} /> Back to Home
          </Link>
        </div>

        <div className="mb-10 text-center">
          <p className="inline-flex items-center gap-2 text-xs font-semibold tracking-[0.2em] uppercase text-orange-400 mb-3">
            <FileText size={14} /> Official Problem Bank
          </p>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 dark:text-white">Problem Statements</h1>
          <p className="mt-3 text-slate-600 dark:text-slate-300 max-w-3xl mx-auto">
            Explore the officially released problem statements. Choose one challenge and build an impactful solution aligned with the event mission.
          </p>
        </div>

        <ProblemStatementsLive />
      </div>
    </main>
  )
}
