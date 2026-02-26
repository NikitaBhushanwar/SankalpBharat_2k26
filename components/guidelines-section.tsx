'use client'

import { Terminal } from 'lucide-react'

const workflowPhases = [
  {
    category: 'Phase 1: The Virtual Elimination',
    items: [
      'Platform: Hosted on Unstop',
      'Registration fee: ₹400 per team | Team size: 4-6 members',
      'Registrations close: 4th April 2026',
      'Target participation: 200+ teams (800-1,000+ students)',
      'Problem statements (approx. 10) released on 18th March 2026 in collaboration with industry mentors',
      'Submission format: Detailed PPT or poster by 5th April 2026',
      'Evaluation by partner organizations and industry representatives on technical feasibility',
      'Selection: Top 10% teams (20 teams) advance to Phase 2',
      'Round 1 results announced on 10th April 2026',
    ],
  },
  {
    category: 'Phase 2: Offline Grand Finale (24-Hour Hack)',
    items: [
      'Timeline: 17th & 18th April 2026',
      'Teams must push latest code to GitHub before each evaluation checkpoint',
      'Checkpoint 1: Day 1 at 13:00',
      'Checkpoint 2: Day 1 at 17:00',
      'Checkpoint 3: Day 1 at 21:00',
      'Checkpoint 4: Day 2 at 08:00',
      'Final submission: Day 2 at 11:00',
      'Final presentation: Day 2 from 11:00 to 13:00 (5 minutes per team)',
      'Each finalist presents working prototype and code to the main judging panel',
    ],
  },
]

export function GuidelinesSection() {
  return (
    <section id="guidelines" className="py-20 px-4 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 tech-grid opacity-20" />

      <div className="relative z-10 max-w-6xl mx-auto">
        {/* Section header */}
        <div className="mb-16">
          <div className="flex items-center gap-3 mb-4">
            <Terminal className="w-6 h-6 text-accent" />
            <p className="text-xs font-mono text-accent tracking-widest uppercase">Workflow & Evaluation</p>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-white text-balance">
            Hackathon Workflow
          </h2>
        </div>

        {/* Workflow grid */}
        <div className="grid md:grid-cols-2 gap-8">
          {workflowPhases.map((section, index) => (
            <div
              key={section.category}
              className="glass-effect rounded-xl p-8 glow-accent transition-all duration-500 hover:scale-105"
            >
              {/* Category title */}
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-accent to-secondary flex items-center justify-center text-sm font-bold">
                  {index + 1}
                </div>
                <h3 className="text-xl font-bold text-white">{section.category}</h3>
              </div>

              {/* Items list */}
              <ul className="space-y-4">
                {section.items.map((item, itemIndex) => (
                  <li key={itemIndex} className="flex gap-3">
                    <span className="text-accent font-bold flex-shrink-0">•</span>
                    <span className="text-foreground leading-relaxed">{item}</span>
                  </li>
                ))}
              </ul>

              {/* Accent line */}
              <div className="mt-6 h-1 w-16 bg-gradient-to-r from-accent to-secondary rounded-full" />
            </div>
          ))}
        </div>

        {/* Important note */}
        <div className="mt-12 p-6 border-l-4 border-accent bg-accent/5 rounded-lg">
          <p className="text-sm text-muted-foreground">
            <span className="font-bold text-accent">Important:</span> All teams must follow ethical and original submission practices. Any plagiarism, unfair means, or non-compliance with checkpoint and submission timelines may lead to immediate disqualification. The organizing committee&apos;s decision remains final.
          </p>
        </div>
      </div>
    </section>
  )
}
