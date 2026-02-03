'use client'

import { CheckCircle } from 'lucide-react'

const features = [
  'National-level competitive hackathon platform',
  'Tech-driven sustainable solutions focus',
  'Youth-led innovation for self-reliant India',
  'Aligned with India\'s 2047 vision',
  'Expert mentorship and guidance',
  'Prize pool and recognition',
]

export function AboutSection() {
  return (
    <section id="about" className="py-16 sm:py-20 lg:py-24 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      <div className="relative z-10 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
          {/* Left content */}
          <div className="page-transition-enter">
            <p className="text-xs sm:text-sm font-semibold text-emerald-600 dark:text-emerald-400 tracking-widest uppercase mb-3 sm:mb-4">🎯 About</p>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4 sm:mb-6 text-balance leading-tight">
              Building Tomorrow,
              <br />
              <span className="gradient-text">Today</span>
            </h2>
            <p className="text-sm sm:text-base lg:text-lg text-gray-700 dark:text-gray-400 mb-6 sm:mb-8 leading-relaxed">
              Sankalp Bharat Hackathon 2026 is a national-level platform designed to harness the collective innovation power of India's youth. We focus on creating tech-driven sustainable solutions that address real-world challenges in environment, agriculture, and sustainability sectors.
            </p>

            {/* Features list */}
            <div className="space-y-3 sm:space-y-4">
              {features.map((feature, index) => (
                <div key={index} className="flex items-start gap-3 group">
                  <CheckCircle className="w-5 h-5 text-emerald-600 dark:text-emerald-400 flex-shrink-0 mt-1 group-hover:scale-110 transition-transform" />
                  <p className="text-sm sm:text-base text-foreground">{feature}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Right visual */}
          <div className="relative">
            {/* Decorative boxes */}
            <div className="space-y-4 sm:space-y-6">
              {[
                { title: '🚀 Innovation', subtitle: 'Cutting-edge technology' },
                { title: '💡 Impact', subtitle: 'Real-world solutions' },
                { title: '🇮🇳 India 2047', subtitle: 'Vision & mission aligned' },
              ].map((item, index) => (
                <div
                  key={index}
                  className="glass-effect rounded-xl sm:rounded-2xl p-4 sm:p-6 card-hover"
                >
                  <h3 className="text-lg sm:text-xl font-bold text-emerald-600 dark:text-emerald-400 mb-2">{item.title}</h3>
                  <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">{item.subtitle}</p>
                  <div className="mt-3 sm:mt-4 h-1 w-12 bg-gradient-to-r from-emerald-500 to-blue-500 rounded-full" />
                </div>
              ))}
            </div>

            {/* Floating accent elements */}
            <div className="absolute -top-8 -right-8 w-24 h-24 border-2 border-emerald-300/20 dark:border-emerald-400/20 rounded-full animate-pulse hidden sm:block" />
            <div className="absolute -bottom-12 -left-12 w-40 h-40 border-2 border-blue-300/10 dark:border-blue-400/10 rounded-full animate-pulse hidden sm:block" style={{ animationDelay: '0.5s' }} />
          </div>
        </div>
      </div>
    </section>
  )
}
