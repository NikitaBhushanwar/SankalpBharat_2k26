'use client'

import { useEffect, useState } from 'react'

export function HeroSection() {
  const [days, setDays] = useState(0)
  const [hours, setHours] = useState(0)
  const [minutes, setMinutes] = useState(0)
  const [seconds, setSeconds] = useState(0)

  useEffect(() => {
    const calculateCountdown = () => {
      // Demo date: March 15, 2026, 10:00 AM IST
      const targetDate = new Date('2026-03-15T10:00:00').getTime()
      const now = new Date().getTime()
      const distance = targetDate - now

      if (distance > 0) {
        setDays(Math.floor(distance / (1000 * 60 * 60 * 24)))
        setHours(Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)))
        setMinutes(Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)))
        setSeconds(Math.floor((distance % (1000 * 60)) / 1000))
      }
    }

    calculateCountdown()
    const interval = setInterval(calculateCountdown, 1000)
    return () => clearInterval(interval)
  }, [])

  return (
    <section className="relative min-h-[calc(100vh-80px)] flex items-center justify-center overflow-hidden px-4 sm:px-6 lg:px-8">
      {/* Gradient orbs */}
      <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-emerald-300/20 rounded-full blur-3xl opacity-40 animate-pulse" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-300/20 rounded-full blur-3xl opacity-40 animate-pulse" style={{ animationDelay: '1s' }} />
      <div className="absolute top-1/2 right-1/3 w-64 h-64 bg-amber-300/20 rounded-full blur-3xl opacity-30 animate-pulse" style={{ animationDelay: '2s' }} />

      {/* Main content */}
      <div className="relative z-10 max-w-5xl mx-auto text-center page-transition-enter">
        {/* Intro tag */}
        <div className="mb-6 sm:mb-8 inline-block">
          <div className="glass-effect px-3 sm:px-4 py-2 rounded-full">
            <p className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 tracking-widest uppercase">
              🚀 National Level Hackathon 2026
            </p>
          </div>
        </div>

        {/* Main headline */}
        <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold mb-4 sm:mb-6 leading-tight text-balance">
          <span className="text-foreground">Sankalp Bharat</span>
          <br />
          <span className="gradient-text text-5xl sm:text-6xl md:text-7xl lg:text-7xl">
            Hackathon 2026
          </span>
        </h1>

        {/* Tagline */}
        <p className="text-base sm:text-lg md:text-xl text-gray-600 dark:text-gray-400 mb-6 sm:mb-8 max-w-3xl mx-auto text-pretty">
          Innovating Sustainable Technology for a Better India 🌱
        </p>

        {/* Keywords */}
        <div className="flex flex-wrap justify-center gap-2 sm:gap-3 mb-8 sm:mb-12">
          {['🌍 Environment', '🌾 Agriculture', '♻️ Sustainability'].map((keyword) => (
            <div key={keyword} className="glass-effect px-3 sm:px-4 py-2 rounded-lg card-hover">
              <p className="text-xs sm:text-sm font-semibold text-emerald-600 dark:text-emerald-400">{keyword}</p>
            </div>
          ))}
        </div>

        {/* Countdown */}
        <div className="mb-8 sm:mb-12 p-6 sm:p-8 glass-effect rounded-2xl max-w-2xl mx-auto">
          <p className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-4 sm:mb-6 tracking-widest">⏱️ TIME REMAINING</p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-4">
            {[
              { value: days, label: 'Days' },
              { value: hours, label: 'Hours' },
              { value: minutes, label: 'Minutes' },
              { value: seconds, label: 'Seconds' },
            ].map(({ value, label }) => (
              <div key={label} className="text-center">
                <div className="text-2xl sm:text-3xl md:text-4xl font-bold text-emerald-600 dark:text-emerald-400 mb-1 sm:mb-2">
                  {String(value).padStart(2, '0')}
                </div>
                <p className="text-xs font-mono text-gray-600 dark:text-gray-400 uppercase">{label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center mb-8">
          <a
            href="https://unstop.com"
            target="_blank"
            rel="noopener noreferrer"
            className="btn-modern text-sm sm:text-base"
          >
            Register on Unstop
          </a>
          <a
            href="#guidelines"
            className="btn-modern-secondary text-sm sm:text-base"
          >
            View Guidelines
          </a>
        </div>

        {/* Quick navigation */}
        <div className="flex flex-wrap justify-center gap-2 sm:gap-4 text-xs sm:text-sm font-medium">
          <a href="/leaderboard" className="text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 transition-colors">
            📊 Leaderboard
          </a>
          <span className="text-gray-300 dark:text-gray-600">•</span>
          <a href="/winners" className="text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 transition-colors">
            🏆 Winners
          </a>
          <span className="text-gray-300 dark:text-gray-600">•</span>
          <a href="#contact" className="text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 transition-colors">
            ✉️ Contact
          </a>
        </div>

        {/* Scroll indicator */}
        <div className="mt-12 sm:mt-16 flex justify-center">
          <div className="animate-bounce">
            <svg
              className="w-6 h-6 text-emerald-600 dark:text-emerald-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 14l-7 7m0 0l-7-7m7 7V3"
              />
            </svg>
          </div>
        </div>
      </div>
    </section>
  )
}
