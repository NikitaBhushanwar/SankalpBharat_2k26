import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowLeft, ShieldAlert } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Rules & Guidelines - Sankalp Bharat Hackathon 2K26',
  description: 'Official rules and participation guidelines for Sankalp Bharat Hackathon 2K26.',
}

export default function RulesGuidelinesPage() {
  return (
    <main className="min-h-screen px-4 sm:px-6 lg:px-8 pt-28 pb-10">
      <div className="max-w-6xl mx-auto rounded-3xl border border-cyan-500/20 bg-white/80 dark:bg-slate-950/80 backdrop-blur-xl p-5 sm:p-7 lg:p-10">
        <div className="mb-8 flex items-center justify-between">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 dark:text-slate-300 hover:text-cyan-500 dark:hover:text-cyan-300 transition"
          >
            <ArrowLeft size={16} /> Back to Home
          </Link>
        </div>

        <div className="mb-10 text-center">
          <div className="flex justify-center mb-3">
            <ShieldAlert className="w-8 h-8 text-cyan-500 dark:text-cyan-300" />
          </div>
          <p className="text-xs font-semibold tracking-[0.2em] uppercase text-cyan-600 dark:text-cyan-300 mb-3">Official Rules</p>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 dark:text-white">Rules & Guidelines</h1>
          <p className="mt-3 text-slate-600 dark:text-slate-300 max-w-3xl mx-auto">
            Please read all rules carefully before participating. These guidelines apply to all teams across all rounds.
          </p>
        </div>

        <div className="grid gap-4 sm:gap-6 md:grid-cols-2">
          <section className="rounded-2xl border border-border/50 bg-white/80 dark:bg-slate-900/60 p-6">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-3">Eligibility Criteria</h2>
            <ul className="space-y-2 text-slate-600 dark:text-slate-300 list-disc pl-5">
              <li>Open to engineering/technology students from recognized institutes.</li>
              <li>Participants must register through the official platform before the deadline.</li>
              <li>A valid student identity may be required during verification.</li>
            </ul>
          </section>

          <section className="rounded-2xl border border-border/50 bg-white/80 dark:bg-slate-900/60 p-6">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-3">Team Size Limit</h2>
            <ul className="space-y-2 text-slate-600 dark:text-slate-300 list-disc pl-5">
              <li>Each team must have a minimum of 2 and maximum of 6 members.</li>
              <li>All members should be declared at registration.</li>
              <li>Team composition changes after shortlisting are subject to organizer approval.</li>
            </ul>
          </section>

          <section className="rounded-2xl border border-border/50 bg-white/80 dark:bg-slate-900/60 p-6">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-3">Code of Conduct</h2>
            <ul className="space-y-2 text-slate-600 dark:text-slate-300 list-disc pl-5">
              <li>Respect all participants, mentors, judges, and organizers.</li>
              <li>Harassment, abuse, discrimination, or unethical behavior is strictly prohibited.</li>
              <li>Follow venue/platform discipline and official communication channels.</li>
            </ul>
          </section>

          <section className="rounded-2xl border border-border/50 bg-white/80 dark:bg-slate-900/60 p-6">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-3">Submission Rules</h2>
            <ul className="space-y-2 text-slate-600 dark:text-slate-300 list-disc pl-5">
              <li>Submit all required deliverables before the deadline.</li>
              <li>Code repository and documentation must be accessible to judges.</li>
              <li>Late or incomplete submissions may not be evaluated.</li>
            </ul>
          </section>

          <section className="rounded-2xl border border-border/50 bg-white/80 dark:bg-slate-900/60 p-6">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-3">Judging Criteria</h2>
            <ul className="space-y-2 text-slate-600 dark:text-slate-300 list-disc pl-5">
              <li>Problem relevance and clarity of solution.</li>
              <li>Innovation, technical implementation, and feasibility.</li>
              <li>Impact, scalability, and presentation quality.</li>
            </ul>
          </section>

          <section className="rounded-2xl border border-border/50 bg-white/80 dark:bg-slate-900/60 p-6">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-3">Disqualification Rules</h2>
            <ul className="space-y-2 text-slate-600 dark:text-slate-300 list-disc pl-5">
              <li>Plagiarism, copied submissions, or fraudulent practices lead to disqualification.</li>
              <li>Violation of conduct or deliberate rule bypassing may result in removal.</li>
              <li>Organizer and jury decisions are final and binding.</li>
            </ul>
          </section>
        </div>

        <section className="mt-6 rounded-2xl border border-border/50 bg-white/80 dark:bg-slate-900/60 p-6">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-3">Intellectual Property Policy</h2>
          <ul className="space-y-2 text-slate-600 dark:text-slate-300 list-disc pl-5">
            <li>Teams retain ownership of their original project/IP.</li>
            <li>By participating, teams grant organizers the right to showcase project summaries for event and academic promotion.</li>
            <li>Any third-party assets used must comply with their respective licenses.</li>
          </ul>
        </section>
      </div>
    </main>
  )
}
