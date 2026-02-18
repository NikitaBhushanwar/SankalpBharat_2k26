import type { Metadata } from 'next'
import { WinnersShowcase } from '@/components/winners-showcase'
import ModernFooter from '@/components/modern-footer'
import { ArrowLeft, Star } from 'lucide-react'
import Link from 'next/link'
import PageTransition from '@/components/page-transition' // Declare the PageTransition variable

export const metadata: Metadata = {
  title: 'Winners - Sankalp Bharat Hackathon 2026',
  description: 'Meet the winning teams and their innovative solutions for Sankalp Bharat Hackathon 2026',
}

export default function WinnersPage() {
  return (
    <PageTransition>
      <main className="min-h-screen">
        {/* Header */}
        <div className="relative border-b border-border">
          <div className="absolute inset-0 tech-grid opacity-20" />
          <div className="relative z-10 max-w-6xl mx-auto px-4 py-8">
            <div className="flex items-center justify-between mb-8">
              <Link
                href="/"
                className="inline-flex items-center gap-2 text-muted-foreground hover:text-accent transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Home
              </Link>
            </div>

            <div>
              <div className="flex items-center gap-3 mb-3">
                <Star className="w-6 h-6 text-accent" />
                <p className="text-xs font-mono text-accent tracking-widest uppercase">Hall of Fame</p>
              </div>
              <h1 className="text-5xl font-bold text-white mb-3 text-balance">
                Sankalp Bharat 2026 Winners
              </h1>
              <p className="text-lg text-muted-foreground">
                Celebrating the innovators transforming sustainable technology for India&apos;s future
              </p>
            </div>
          </div>
        </div>

        {/* Winners showcase */}
        <WinnersShowcase />

        {/* Honorable mentions section */}
        <section className="py-20 px-4 relative overflow-hidden">
          <div className="absolute inset-0 tech-grid opacity-10" />
          <div className="relative z-10 max-w-6xl mx-auto">
            <h2 className="text-3xl font-bold text-white mb-8 text-center">Honorable Mentions</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {['FarmConnect', 'ClimateShield', 'DigitalFarmer', 'SustainHub'].map((teamName) => (
                <div
                  key={teamName}
                  className="glass-effect rounded-lg p-6 text-center group hover:glow-accent transition-all duration-300"
                >
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-accent to-secondary mx-auto mb-3 flex items-center justify-center">
                    <Star className="w-6 h-6 text-background" />
                  </div>
                  <h3 className="font-semibold text-white mb-2">{teamName}</h3>
                  <p className="text-sm text-muted-foreground">Top 10 Finalist</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Gallery section */}
        <section className="py-20 px-4 relative overflow-hidden border-t border-border">
          <div className="absolute inset-0 tech-grid opacity-10" />
          <div className="relative z-10 max-w-6xl mx-auto">
            <h2 className="text-3xl font-bold text-white mb-12 text-center">Event Highlights</h2>
            <div className="grid md:grid-cols-3 gap-6">
              {[
                { title: 'Opening Ceremony', desc: 'Kickoff with keynote speakers' },
                { title: 'Coding Marathon', desc: '48-hour intensive development' },
                { title: 'Awards Ceremony', desc: 'Celebrating innovation and success' },
              ].map((item) => (
                <div
                  key={item.title}
                  className="glass-effect rounded-lg p-8 text-center group hover:glow-accent transition-all duration-300"
                >
                  <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-accent to-secondary mx-auto mb-4 flex items-center justify-center text-white text-2xl font-bold">
                    ✓
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">{item.title}</h3>
                  <p className="text-muted-foreground">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Next edition teaser */}
        <section className="py-20 px-4 relative overflow-hidden">
          <div className="absolute inset-0 tech-grid opacity-20" />
          <div className="relative z-10 max-w-4xl mx-auto text-center">
            <div className="glass-effect rounded-2xl p-12 glow-accent">
              <h2 className="text-3xl font-bold text-white mb-4">
                Ready for Next Year?
              </h2>
              <p className="text-lg text-muted-foreground mb-8">
                Join us for Sankalp Bharat Hackathon 2027. Stay updated with our latest announcements and opportunities.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <a href="/" className="btn-primary-neon glow-accent">
                  Back to Home
                </a>
                <a href="#" className="btn-neon glow-cyan">
                  Subscribe for Updates
                </a>
              </div>
            </div>
          </div>
        </section>
      </main>
    </PageTransition>
    
  )
}
