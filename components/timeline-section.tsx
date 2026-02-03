'use client'

const timeline = [
  {
    phase: '01',
    date: 'January 15 - February 28, 2026',
    title: 'Registration Phase',
    description: 'Team formation and registration opening. Get your team ready and register on Unstop.',
  },
  {
    phase: '02',
    date: 'March 1 - March 10, 2026',
    title: 'Idea Submission',
    description: 'Submit your innovative project ideas. Guidelines and templates will be provided.',
  },
  {
    phase: '03',
    date: 'March 15 - March 17, 2026',
    title: 'Hackathon Event',
    description: '48-hour intensive coding marathon with expert mentors, workshops, and support.',
  },
  {
    phase: '04',
    date: 'March 20 - March 25, 2026',
    title: 'Judging & Results',
    description: 'Expert panel evaluation, live results, and winner announcements.',
  },
]

export function TimelineSection() {
  return (
    <section id="timeline" className="py-16 sm:py-20 lg:py-24 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      <div className="relative z-10 max-w-5xl mx-auto">
        {/* Section header */}
        <div className="text-center mb-12 sm:mb-16 lg:mb-20">
          <p className="text-xs sm:text-sm font-semibold text-emerald-600 dark:text-emerald-400 tracking-widest uppercase mb-3 sm:mb-4">📅 Event Schedule</p>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-balance leading-tight">
            Journey Through
            <br />
            <span className="gradient-text">Sankalp</span>
          </h2>
        </div>

        {/* Timeline */}
        <div className="relative">
          {/* Vertical line - hidden on mobile */}
          <div className="hidden sm:block absolute left-0 sm:left-1/2 sm:-translate-x-1/2 top-0 bottom-0 w-1 bg-gradient-to-b from-emerald-500 via-blue-500 to-emerald-500 opacity-30" />

          {/* Timeline items */}
          <div className="space-y-6 sm:space-y-8 lg:space-y-12">
            {timeline.map((item, index) => (
              <div key={item.phase} className="relative">
                {/* Desktop alternate layout */}
                <div className={`hidden sm:flex gap-6 lg:gap-8 ${index % 2 === 0 ? 'flex-row' : 'flex-row-reverse'}`}>
                  {/* Left/Right content */}
                  <div className="flex-1">
                    <div className="glass-effect rounded-xl lg:rounded-2xl p-4 sm:p-6 card-hover">
                      <p className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 tracking-widest mb-2">PHASE {item.phase}</p>
                      <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mb-2 sm:mb-3 font-medium">{item.date}</p>
                      <h3 className="text-lg sm:text-xl lg:text-2xl font-bold text-emerald-600 dark:text-emerald-400 mb-2">{item.title}</h3>
                      <p className="text-sm text-foreground leading-relaxed">{item.description}</p>
                    </div>
                  </div>

                  {/* Center circle */}
                  <div className="flex-shrink-0 flex items-center justify-center">
                    <div className="w-10 h-10 lg:w-12 lg:h-12 rounded-full bg-background dark:bg-slate-900 border-2 border-emerald-500 flex items-center justify-center relative z-10">
                      <div className="w-3 h-3 lg:w-4 lg:h-4 rounded-full bg-emerald-500 animate-pulse" />
                    </div>
                  </div>

                  {/* Right/Left empty space */}
                  <div className="flex-1" />
                </div>

                {/* Mobile layout - single column */}
                <div className="sm:hidden glass-effect rounded-xl p-4 card-hover">
                  <div className="flex gap-3 mb-3">
                    <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center flex-shrink-0">
                      <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">{item.phase}</span>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 tracking-widest">PHASE {item.phase}</p>
                      <p className="text-xs text-gray-600 dark:text-gray-400">{item.date}</p>
                    </div>
                  </div>
                  <h3 className="text-lg font-bold text-emerald-600 dark:text-emerald-400 mb-2">{item.title}</h3>
                  <p className="text-sm text-foreground">{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
