'use client'

import { Terminal } from 'lucide-react'

const guidelines = [
  {
    category: 'Eligibility',
    items: [
      'Students and recent graduates (up to 2 years after graduation)',
      'Indian nationals or NRI with valid documentation',
      'Team size: 2-5 members (minimum 2)',
      'Individual participation not allowed',
    ],
  },
  {
    category: 'Project Requirements',
    items: [
      'Projects must focus on Environment, Agriculture, or Sustainability',
      'Original ideas and implementations only',
      'No plagiarism or copyrighted material',
      'Code should be version-controlled (GitHub recommended)',
    ],
  },
  {
    category: 'Technical Guidelines',
    items: [
      'Use any programming language or technology stack',
      'API usage and third-party services allowed',
      'MVP (Minimum Viable Product) acceptable',
      'Open-source tools and frameworks encouraged',
    ],
  },
  {
    category: 'Submission & Judging',
    items: [
      'Submit complete code and documentation',
      '5-minute demo video required',
      'Criteria: Innovation, feasibility, impact, presentation',
      'Results within 5 days of submission deadline',
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
            <p className="text-xs font-mono text-accent tracking-widest uppercase">Rules & Guidelines</p>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-white text-balance">
            Guidelines & Rules
          </h2>
        </div>

        {/* Guidelines grid */}
        <div className="grid md:grid-cols-2 gap-8">
          {guidelines.map((section, index) => (
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
            <span className="font-bold text-accent">Important:</span> All participants must follow the code of conduct. Any form of cheating, plagiarism, or unethical behavior will result in immediate disqualification. The organizing committee reserves the right to make final decisions in case of disputes.
          </p>
        </div>
      </div>
    </section>
  )
}
