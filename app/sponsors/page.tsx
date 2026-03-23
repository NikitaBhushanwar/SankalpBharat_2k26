import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowLeft, Sparkles } from 'lucide-react'
import SponsorGridByCategory from '@/components/sponsor-grid-by-category'

export const metadata: Metadata = {
  title: 'Sponsors - Sankalp Bharat Hackathon 2026',
  description: 'Official sponsors and partners for Sankalp Bharat Hackathon 2026',
}

export default function SponsorsPage() {
  return (
    <main className="min-h-screen px-4 sm:px-6 lg:px-8 pt-28 pb-10">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 dark:text-slate-300 hover:text-cyan-500 dark:hover:text-cyan-300 transition"
          >
            <ArrowLeft size={16} /> Back to Home
          </Link>
        </div>

        <div className="mb-12 text-center">
          <p className="inline-flex items-center justify-center gap-2 text-xs uppercase tracking-wider text-cyan-600 dark:text-cyan-300 font-bold mb-4">
            <Sparkles size={14} /> Partners & Supporters
          </p>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-slate-900 dark:text-white mb-4">
            Our Sponsors
          </h1>
          <p className="text-lg text-slate-700 dark:text-slate-200 max-w-3xl mx-auto leading-relaxed">
            We are grateful to our sponsors and partners who make Sankalp Bharat Hackathon 2K26 possible. Their support helps us create an incredible experience for innovators and entrepreneurs.
          </p>
        </div>

        <div className="rounded-3xl border border-cyan-500/20 bg-white/50 dark:bg-slate-950/50 backdrop-blur-xl p-6 sm:p-8 lg:p-10">
          <SponsorGridByCategory />
        </div>
      </div>
    </main>
  )
}
