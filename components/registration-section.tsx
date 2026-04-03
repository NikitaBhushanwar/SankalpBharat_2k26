'use client'

import { Users } from 'lucide-react'
import { useRegistrationLink } from '@/lib/use-registration-link'

export function RegistrationSection() {
  const registrationLink = useRegistrationLink()

  return (
    <section id="register" className="py-20 px-4 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 tech-grid opacity-20" />

      {/* Gradient orbs */}
      <div className="absolute top-1/2 left-0 w-96 h-96 bg-accent/5 rounded-full blur-3xl opacity-50 -translate-y-1/2" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-secondary/5 rounded-full blur-3xl opacity-50 translate-y-1/2" />

      <div className="relative z-10 max-w-4xl mx-auto">
        <div className="glass-effect rounded-2xl border border-border/50 p-8 sm:p-10 text-center">
          {/* Icon */}
          <div className="mb-6 inline-block">
            <div className="p-4 rounded-xl bg-orange-500/15 border border-orange-500/30">
              <Users className="w-8 h-8 text-orange-500" />
            </div>
          </div>

          {/* Content */}
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4 text-balance">
            Ready to Innovate?
          </h2>
          <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
            Register your team for Sankalp Bharat 2K26 and build high-impact solutions for Environment, Sustainability, and Agriculture.
          </p>

          <div className="mb-8 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-left">
            <p className="text-sm font-semibold text-emerald-700 dark:text-emerald-300">
              Round 1 Registration for Sankalp Bharat - National Level Hackathon 2026 is now FREE to encourage wider participation based on industry partner recommendations.
            </p>
          </div>

          {/* Details */}
          <div className="grid md:grid-cols-3 gap-6 mb-10">
            {[
              { label: 'Team Size', value: '2-6 Members' },
              { label: 'Round 1 Registration', value: 'FREE' },
              { label: 'Registration Closes', value: '6th April 2026, 5:00 PM (IST)' },
            ].map((item) => (
              <div key={item.label} className="text-center rounded-xl bg-background/50 backdrop-blur border border-border/40 p-3">
                <p className="text-xs font-mono text-secondary tracking-widest uppercase mb-2">{item.label}</p>
                <p className="text-xl font-bold text-accent">{item.value}</p>
              </div>
            ))}
          </div>

          {/* CTA */}
          <a
            href={registrationLink}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-modern inline-flex items-center justify-center rounded-full px-7 py-3 text-sm font-black uppercase tracking-wider mb-6"
          >
            Register Your Team on Unstop
          </a>

          {/* Venue info */}
          <div className="text-center border-t border-border/30 pt-8">
            <p className="text-xs font-mono text-muted-foreground tracking-widest uppercase mb-3">Event Venue</p>
            <p className="text-lg font-semibold text-accent">St. Vincent Pallotti College of Engineering &amp; Technology, Nagpur</p>
            <p className="text-sm text-muted-foreground mt-2">Offline Grand Finale on 17th &amp; 18th April 2026</p>
          </div>
        </div>
      </div>
    </section>
  )
}
