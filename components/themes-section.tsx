'use client';

import React from 'react';
import Link from 'next/link';
import { Globe, Cpu, Sprout } from 'lucide-react';

const themes = [
  {
    id: '01',
    title: 'Environment',
    description:
      'Address ecological conservation, pollution control, resource management, and climate resilience through practical engineering solutions.',
    icon: <Globe className="w-7 h-7 text-orange-400" />,
    accent: 'from-orange-500 to-amber-400',
  },
  {
    id: '02',
    title: 'Sustainability',
    description:
      'Build for sustainable development with circular economy models, green energy innovation, and measurable waste reduction.',
    icon: <Cpu className="w-7 h-7 text-blue-400" />,
    accent: 'from-blue-500 to-cyan-400',
  },
  {
    id: '03',
    title: 'Agriculture',
    description:
      'Innovate in precision farming, supply-chain efficiency, soil health analytics, and sustainable agricultural practices.',
    icon: <Sprout className="w-7 h-7 text-green-400" />,
    accent: 'from-green-500 to-emerald-400',
  },
];

export default function ThemesSection() {
  return (
    <section className="relative py-24 px-4 overflow-hidden">
      <div className="absolute inset-0 tech-grid opacity-20" />

      <div className="max-w-7xl mx-auto relative z-10">
        <div className="mb-14 text-center">
          <p className="text-xs font-mono text-accent tracking-widest uppercase mb-3">Mission Scope</p>
          <h2 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white uppercase">Core Themes</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {themes.map((theme) => (
            <div
              key={theme.id}
              className="glass-effect rounded-2xl p-8 border border-border/50 card-hover"
            >
              <div className="flex items-center justify-between mb-6">
                <span className="text-xs font-mono text-muted-foreground tracking-widest">THEME {theme.id}</span>
                <div className="p-3 rounded-xl bg-slate-100/70 dark:bg-black/30 border border-border/40">
                  {theme.icon}
                </div>
              </div>

              <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-3">{theme.title}</h3>
              <p className="text-muted-foreground leading-relaxed mb-6">{theme.description}</p>

              <div className={`h-1 rounded-full bg-gradient-to-r ${theme.accent}`} />
            </div>
          ))}
        </div>

        <div className="mt-10 text-center max-w-4xl mx-auto">
          <p className="text-muted-foreground leading-relaxed">
            Problem statements are officially published by the organizing team and industry collaborators under the core themes.
            Each statement defines a real challenge and expected impact area. Select one statement, build an original solution,
            and demonstrate technical feasibility, innovation, and practical applicability.
          </p>

          <Link
            href="/problem-statements"
            className="inline-flex mt-6 items-center justify-center rounded-full px-7 py-3 text-sm font-black uppercase tracking-wider bg-orange-500 text-white hover:bg-orange-400 transition"
          >
            View Problem Statements
          </Link>
        </div>
      </div>
    </section>
  );
}