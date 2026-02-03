'use client'

import { Leaf, Sprout, Recycle } from 'lucide-react'

const themes = [
  {
    id: 1,
    title: 'Environment',
    icon: Leaf,
    description: 'Climate tech, clean energy, pollution control, and environmental protection technologies',
    gradient: 'from-green-500 to-emerald-600',
  },
  {
    id: 2,
    title: 'Agriculture',
    icon: Sprout,
    description: 'Smart farming, agri-tech solutions, farmer empowerment, and modern agricultural innovation',
    gradient: 'from-yellow-500 to-orange-600',
  },
  {
    id: 3,
    title: 'Sustainability',
    icon: Recycle,
    description: 'Circular economy, waste management, green systems, and sustainable development',
    gradient: 'from-blue-500 to-cyan-600',
  },
]

export function ThemesSection() {
  return (
    <section className="py-16 sm:py-20 lg:py-24 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      <div className="relative z-10 max-w-7xl mx-auto">
        {/* Section header */}
        <div className="text-center mb-12 sm:mb-16 lg:mb-20">
          <p className="text-xs sm:text-sm font-semibold text-emerald-600 dark:text-emerald-400 tracking-widest uppercase mb-3 sm:mb-4">🎯 Core Focus Areas</p>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-3 sm:mb-4 text-balance leading-tight">
            Three Pillars of
            <br />
            <span className="gradient-text">Innovation</span>
          </h2>
          <p className="text-sm sm:text-base lg:text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Driving sustainable solutions across critical sectors for India's digital transformation
          </p>
        </div>

        {/* Theme cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {themes.map((theme) => {
            const Icon = theme.icon
            return (
              <div
                key={theme.id}
                className="group glass-effect rounded-xl sm:rounded-2xl p-6 sm:p-8 card-hover"
              >
                {/* Icon container */}
                <div className={`mb-4 sm:mb-6 p-3 sm:p-4 rounded-lg sm:rounded-xl bg-gradient-to-br ${theme.gradient} inline-block`}>
                  <Icon className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
                </div>

                {/* Title */}
                <h3 className="text-xl sm:text-2xl font-bold text-foreground mb-2 sm:mb-3">
                  {theme.title}
                </h3>

                {/* Description */}
                <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mb-4 sm:mb-6 leading-relaxed">
                  {theme.description}
                </p>

                {/* Learn more link */}
                <a href="#" className="inline-flex items-center text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 transition-colors duration-300 font-semibold text-xs sm:text-sm">
                  <span>Learn More</span>
                  <svg className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </a>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
