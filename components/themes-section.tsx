'use client';

import React from 'react';
import { Globe, Cpu, Sprout, ShieldAlert } from 'lucide-react';

const themes = [
  {
    id: "01",
    title: "ENVIRONMENT",
    description:
      "Architecting bio-digital bridges to monitor, protect, and heal our biosphere using planetary-scale sensor networks.",
    icon: <Globe className="w-7 h-7 text-orange-400" />,
    accent: "bg-orange-500",
    border: "border-orange-500/40",
    hoverBg: "hover:bg-orange-500/10",
    bgText: "ECO",
  },
  {
    id: "02",
    title: "SUSTAINABILITY",
    description:
      "Engineering the zero-waste epoch through decentralized energy grids and self-healing circular infrastructures.",
    icon: <Cpu className="w-7 h-7 text-blue-400" />,
    accent: "bg-blue-500",
    border: "border-blue-500/40",
    hoverBg: "hover:bg-white/5",
    bgText: "SUS",
  },
  {
    id: "03",
    title: "AGRICULTURE",
    description:
      "Next-gen precision nutrition using autonomous soil-intelligence and vertical hyper-growth technologies.",
    icon: <Sprout className="w-7 h-7 text-green-400" />,
    accent: "bg-green-500",
    border: "border-green-500/40",
    hoverBg: "hover:bg-green-500/10",
    bgText: "AGR",
  },
];

export default function ThemesSection() {
  return (
    <section className="relative py-32 px-6 bg-[#050505] overflow-hidden">

      <div className="max-w-7xl mx-auto relative z-10">

        {/* HEADER */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-24 gap-8">
          
          <div className="relative">
            <h2 className="text-6xl md:text-8xl font-black text-white/5 absolute -top-12 -left-4 select-none tracking-tight">
              FRONTIERS
            </h2>

            <span className="flex items-center gap-2 text-orange-500 font-mono text-xs tracking-widest mb-3">
              <ShieldAlert className="w-4 h-4" />
              [ STATUS: MISSION CRITICAL ]
            </span>

            <h3 className="text-5xl md:text-7xl font-black text-white tracking-tight uppercase italic">
              CORE <span className="text-white/70">THEMES</span>
            </h3>
          </div>

          <p className="text-gray-500 font-mono text-xs max-w-xs border-l border-white/10 pl-4">
            // DATA_STREAM_026: EXPLORING THE INTERSECTION OF BIOLOGY AND COMPUTATION.
          </p>
        </div>

        {/* CARDS */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-[1px] bg-white/10 border border-white/10 overflow-hidden">
          {themes.map((theme) => (
            <div
              key={theme.id}
              className={`group relative bg-[#0a0a0a] p-12 min-h-[460px] flex flex-col justify-between transition-all duration-500 ${theme.hoverBg} overflow-hidden`}
            >

              {/* Smaller Background Text */}
              <div className="absolute inset-0 flex items-center justify-center text-[8rem] md:text-[10rem] font-black text-white/[0.03] group-hover:text-white/[0.06] transition-all duration-700 pointer-events-none">
                {theme.bgText}
              </div>

              {/* Top Accent Line */}
              <div className={`absolute top-0 left-0 h-[3px] w-0 group-hover:w-full transition-all duration-500 ${theme.accent}`} />

              <div className="relative z-10">

                {/* REF + Icon */}
                <div className="flex justify-between items-start mb-12">
                  <div className="font-mono text-gray-600 group-hover:text-white transition-colors">
                    REF_{theme.id}
                  </div>

                  <div className={`p-3 border ${theme.border} bg-black group-hover:rotate-12 transition-transform duration-500`}>
                    {theme.icon}
                  </div>
                </div>

                {/* Title */}
                <h4 className="text-4xl font-black text-white mb-6 tracking-tight group-hover:translate-x-2 transition-transform">
                  {theme.title}
                </h4>

                {/* Description */}
                <p className="text-gray-500 text-lg leading-relaxed max-w-xs group-hover:text-gray-300 transition-colors">
                  {theme.description}
                </p>
              </div>

              {/* CTA */}
              <div className="relative z-10">
                <div className="flex items-center gap-4 cursor-pointer">
                  <div className={`h-[2px] w-12 group-hover:w-24 transition-all duration-500 ${theme.accent}`} />
                  <span className="font-mono text-xs text-gray-500 uppercase tracking-widest group-hover:text-white transition-colors">
                    Initialize Module
                  </span>
                </div>
              </div>

              {/* Subtle Hover Overlay */}
              <div className="absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity bg-gradient-to-b from-transparent via-white/5 to-transparent bg-[length:100%_4px]" />
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="mt-12 flex justify-between items-center text-[10px] font-mono text-gray-600 uppercase tracking-[0.4em]">
          <span>© 2026 Sankalp Bharat / Operational Framework</span>
          <div className="flex gap-4">
            <span className="flex items-center gap-1">
              <div className="w-1 h-1 bg-orange-500 rounded-full" />
              STABLE
            </span>
            <span className="flex items-center gap-1">
              <div className="w-1 h-1 bg-blue-500 rounded-full" />
              ENCRYPTED
            </span>
            <span className="flex items-center gap-1">
              <div className="w-1 h-1 bg-green-500 rounded-full" />
              VERIFIED
            </span>
          </div>
        </div>
      </div>

      {/* Vignette */}
      <div className="absolute inset-0 pointer-events-none shadow-[inset_0_0_150px_rgba(0,0,0,1)]" />
    </section>
  );
}