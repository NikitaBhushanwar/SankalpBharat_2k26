import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowLeft, FileText, Lock } from 'lucide-react'
import ProblemStatementsLive from '@/components/problem-statements-live'

export const metadata: Metadata = {
  title: 'Problem Statements - Sankalp Bharat Hackathon 2K26',
  description: 'Official problem statements published for Sankalp Bharat Hackathon 2K26.',
}

export default function ProblemStatementsPage() {
  return (
    <main className="min-h-screen px-4 sm:px-6 lg:px-8 pt-36 pb-10">
      <div className="max-w-6xl mx-auto rounded-3xl border border-cyan-500/20 bg-white/80 dark:bg-slate-950/80 backdrop-blur-xl p-5 sm:p-7 lg:p-10">
        <div className="mb-8">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 dark:text-slate-300 hover:text-cyan-500 dark:hover:text-cyan-300 transition"
          >
            <ArrowLeft size={16} /> Back to Home
          </Link>
        </div>

        <div className="mb-10 text-center">
          <p className="inline-flex items-center gap-2 text-xs font-semibold tracking-[0.2em] uppercase text-cyan-600 dark:text-cyan-300 mb-3">
            <FileText size={14} /> Official Problem Bank
          </p>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 dark:text-white">Problem Statements</h1>
          <p className="mt-3 text-slate-600 dark:text-slate-300 max-w-3xl mx-auto">
            Browse the regular problem bank and the separate final problem statements sourced from industry experts and real-world use cases.

          </p>
        </div>

        <div className="glass-effect mb-8 rounded-2xl border border-border/50 p-4 sm:p-5 text-center">
          <p className="text-sm sm:text-base text-foreground/90 leading-relaxed max-w-3xl mx-auto">
            Final round teams should use the button below to enter the problem-statement allocation portal.
          </p>
          <div className="mt-4 flex justify-center">
            <Link
              href="/final-round"
              className="inline-flex items-center justify-center gap-2 rounded-xl px-5 py-2.5 text-xs sm:text-sm font-black uppercase tracking-wider text-white transition hover:-translate-y-0.5"
              style={{
                background: 'linear-gradient(135deg, #059669 0%, #0891b2 55%, #1d4ed8 100%)',
                boxShadow: '0 4px 15px rgba(14, 116, 144, 0.4)',
              }}
            >
              <Lock size={14} /> Final Round Portal
            </Link>
          </div>
        </div>

        <ProblemStatementsLive />
      </div>
    </main>
  )
}
