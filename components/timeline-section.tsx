'use client'

const timeline = [
  {
    phase: '01',
    date: '5th March 2026 (Thursday)',
    title: 'Registration Starts',
    description: 'Teams of 2-6 members can register for free on Unstop.',
  },
  {
    phase: '02',
    date: '19th March 2026 (Thursday)',
    title: 'Problem Statement Release',
    description: 'Approximately 10 industry-collaborated problem statements are released officially.',
  },
  {
    phase: '03',
    date: '6th April 2026 (Monday), 5:00 PM (IST)',
    title: 'Registration Closes',
    description: 'Final day for team registration (team size 2-6 members).',
  },
  {
    phase: '04',
    date: '6th April 2026 (Monday), 11:59 PM (IST)',
    title: 'Round 1 - PPT Submission Deadline',
    description: 'Teams submit detailed PPT of their proposed solution on Unstop. Round 1 Registration for Sankalp Bharat - National Level Hackathon 2026 is now FREE to encourage wider participation based on industry partner recommendations.',
  },
   {
    phase: '05',
    date: '8th April 2026 (Wednesday)',
    title: 'Round 1 - Evaluation & Results',
    description: 'Expert jury evaluates PPT submissions based on innovation, feasibility, and impact. Results announced on 8th April 2026.',
  },
  {
    phase: '06',
    date: '8th April 2026 (Wednesday)',
    title: 'Round 2 - Video Pitch Submission',
    description: 'Teams shortlisted from Round 1 submit a video pitch of their solution on Unstop.',
  },
  {
    phase: '07',
    date: '10th April 2026 (Friday)',
    title: 'Round 2 - Video Pitch Submission Deadline',
    description: 'Final day for shortlisted teams to submit their video pitch on Unstop.',
  },
  {
    phase: '08',
    date: '11th April 2026 (Saturday)',
    title: 'Pre-Hackathon Workshop',
    description: 'Free online workshop by industry experts, followed by sessions on strategic approaches, provided exposure to new technologies, innovative strategies, and practical industry insights.',
  },
  {
    phase: '09',
    date: '11th April 2026 (Saturday)',
    title: 'Round 2 - Evaluation & Results',
    description: 'Expert jury evaluates video pitches based on clarity, creativity, and potential impact. Finalists announced on 11th April 2026.',
  },
  {
    phase: '10',
    date: 'Before Hackathon Starts;',
    title: 'PS declaration & PS explanation for the final round (Offline Grand Finale)',
    description: 'Final problem statements for the onsite hackathon are declared, along with detailed explanations for finalists.',
  },
  {
    phase: '11',
    date: '17th & 18th April 2026 (Friday & Saturday)',
    title: 'Offline Grand Finale',
    description: '24-hour onsite hackathon, final submissions, and jury presentations for selected finalists.',
  },
]

export function TimelineSection() {
  return (
    <section id="timeline" className="py-16 sm:py-20 lg:py-24 px-4 sm:px-6 lg:px-8 relative overflow-hidden light-section-tint">
      <div className="relative z-10 max-w-5xl mx-auto">
        {/* Section header */}
        <div className="text-center mb-12 sm:mb-16 lg:mb-20">
          <p className="text-xs sm:text-sm font-semibold text-primary tracking-widest uppercase mb-3 sm:mb-4">📅 Event Schedule</p>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-balance leading-tight text-foreground">
            Journey Through
            <br />
            <span className="gradient-text">Sankalp</span>
          </h2>
        </div>

        {/* Timeline */}
        <div className="relative">
          {/* Vertical line - hidden on mobile */}
          <div className="pointer-events-none hidden sm:block absolute left-1/2 top-14 bottom-14 lg:top-16 lg:bottom-16 -translate-x-1/2 z-0">
            <div className="absolute inset-0 w-3 -translate-x-1/3 rounded-full bg-cyan-500/18 blur-xl" />
            <div className="relative h-full w-[3px] rounded-full bg-gradient-to-b from-cyan-400 via-blue-500 to-indigo-500 shadow-[0_0_16px_rgba(6,182,212,0.45)] opacity-100" />
          </div>

          {/* Timeline items */}
          <div className="space-y-6 sm:space-y-8 lg:space-y-12">
            {timeline.map((item, index) => (
              <div key={item.phase} className="relative">
                {/* Desktop alternate layout */}
                <div className={`hidden sm:flex gap-6 lg:gap-8 ${index % 2 === 0 ? 'flex-row' : 'flex-row-reverse'}`}>
                  {/* Left/Right content */}
                  <div className="flex-1">
                    <div className="glass-effect light-card rounded-xl lg:rounded-2xl p-4 sm:p-6 border border-border/60 card-hover">
                      <p className="text-xs font-semibold text-cyan-600 dark:text-cyan-300 tracking-widest mb-2">PHASE {item.phase}</p>
                      <p className="text-xs sm:text-sm text-muted-foreground mb-2 sm:mb-3 font-medium">{item.date}</p>
                      <h3 className="text-lg sm:text-xl lg:text-2xl font-bold text-blue-700 dark:text-cyan-300 mb-2">{item.title}</h3>
                      <p className="text-sm text-foreground/85 leading-relaxed">{item.description}</p>
                    </div>
                  </div>

                  {/* Center circle */}
                  <div className="flex-shrink-0 flex items-center justify-center">
                    <div className="w-10 h-10 lg:w-12 lg:h-12 rounded-full bg-background border-2 border-green-400 dark:border-green-300 flex items-center justify-center relative z-10 shadow-[0_0_18px_rgba(251,146,60,0.28)]">
                      <div className="w-3 h-3 lg:w-4 lg:h-4 rounded-full bg-orange-500 dark:bg-orange-400 animate-pulse" />
                    </div>
                  </div>

                  {/* Right/Left empty space */}
                  <div className="flex-1" />
                </div>

                {/* Mobile layout - single column */}
                <div className="sm:hidden glass-effect light-card rounded-xl p-4 border border-border/60 card-hover">
                  <div className="flex gap-3 mb-3">
                    <div className="w-8 h-8 rounded-full border border-orange-400/70 bg-orange-500/10 flex items-center justify-center flex-shrink-0 shadow-[0_0_12px_rgba(251,146,60,0.18)]">
                      <span className="text-xs font-bold text-emerald-600 dark:text-emerald-300">{item.phase}</span>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-cyan-700 dark:text-cyan-300 tracking-widest">PHASE {item.phase}</p>
                      <p className="text-xs text-muted-foreground">{item.date}</p>
                    </div>
                  </div>
                  <h3 className="text-lg font-bold text-cyan-700 dark:text-cyan-300 mb-2">{item.title}</h3>
                  <p className="text-sm text-foreground/85">{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
