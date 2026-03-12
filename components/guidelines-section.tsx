'use client'

import Link from 'next/link'
import { ShieldCheck } from 'lucide-react'

export function GuidelinesSection() {
  return (
    <section id="guidelines" className="py-20 px-4 relative overflow-hidden">
      <div className="absolute inset-0 tech-grid opacity-20" />

      <div className="relative z-10 max-w-4xl mx-auto">
        <div className="glass-effect rounded-2xl p-8 md:p-10 border border-border/40 text-center">
          <div className="flex justify-center mb-4">
            <ShieldCheck className="w-10 h-10 text-accent" />
          </div>

          <p className="text-xs font-mono text-accent tracking-widest uppercase mb-3">Rules & Guidelines</p>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">Read Complete Participation Rules</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto mb-8 leading-relaxed">
            To avoid confusion during registration and evaluation, please read the full rules, eligibility, submission standards, and judging framework before participating.
          </p>

          <Link
            href="/rules-guidelines"
            className="btn-modern inline-flex items-center justify-center rounded-full px-7 py-3 text-sm font-black uppercase tracking-wider"
          >
            View Rules & Guidelines
          </Link>
        </div>
      </div>
    </section>
  )
}