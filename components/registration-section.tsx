'use client'

import { Users } from 'lucide-react'

export function RegistrationSection() {
  return (
    <section id="register" className="py-20 px-4 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 tech-grid opacity-20" />

      {/* Gradient orbs */}
      <div className="absolute top-1/2 left-0 w-96 h-96 bg-accent/5 rounded-full blur-3xl opacity-50 -translate-y-1/2" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-secondary/5 rounded-full blur-3xl opacity-50 translate-y-1/2" />

      <div className="relative z-10 max-w-4xl mx-auto">
        <div className="glass-effect rounded-2xl p-12 text-center glow-accent">
          {/* Icon */}
          <div className="mb-6 inline-block">
            <div className="p-4 rounded-xl bg-gradient-to-br from-accent to-secondary">
              <Users className="w-8 h-8 text-background" />
            </div>
          </div>

          {/* Content */}
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4 text-balance">
            Ready to Innovate?
          </h2>
          <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
            Register your team for Sankalp Bharat 2K26 and build high-impact solutions for Environment, Sustainability, and Agriculture.
          </p>

          {/* Details */}
          <div className="grid md:grid-cols-3 gap-6 mb-10">
            {[
              { label: 'Team Size', value: '4-6 Members' },
              { label: 'Registration Fee', value: '₹400 per Team' },
              { label: 'Registration Closes', value: '4 April 2026' },
            ].map((item) => (
              <div key={item.label} className="text-center">
                <p className="text-xs font-mono text-secondary tracking-widest uppercase mb-2">{item.label}</p>
                <p className="text-xl font-bold text-accent">{item.value}</p>
              </div>
            ))}
          </div>

          {/* CTA */}
          <a
            href="https://unstop.com"
            target="_blank"
            rel="noopener noreferrer"
            className="btn-primary-neon glow-accent inline-block mb-6"
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
