'use client'

import React from "react"

import { Trophy, Award } from 'lucide-react'

interface WinnerCard {
  position: number
  title: string
  teamName: string
  description: string
  prizeAmount: string
  projectUrl: string
  icon: React.ReactNode
  gradient: string
}

const winners: WinnerCard[] = [
  {
    position: 1,
    title: 'Grand Prize Winner',
    teamName: 'Green Innovators',
    description: 'Renewable Energy Management System - A breakthrough solution for efficient energy distribution and smart grid management using AI and IoT.',
    prizeAmount: '₹5,00,000',
    projectUrl: 'https://github.com/search?q=Green+Innovators',
    icon: <Trophy className="w-8 h-8" />,
    gradient: 'from-yellow-400 to-orange-500',
  },
  {
    position: 2,
    title: 'First Runner-Up',
    teamName: 'AgriTech Revolution',
    description: 'AI-Powered Crop Disease Detection - Revolutionary application detecting plant diseases through image recognition and providing treatment solutions.',
    prizeAmount: '₹3,00,000',
    projectUrl: 'https://github.com/search?q=AgriTech+Revolution',
    icon: <Award className="w-8 h-8" />,
    gradient: 'from-gray-300 to-slate-400',
  },
  {
    position: 3,
    title: 'Second Runner-Up',
    teamName: 'EcoSolve',
    description: 'Smart Waste Management Platform - Intelligent waste segregation and recycling system optimizing municipal waste management processes.',
    prizeAmount: '₹2,00,000',
    projectUrl: 'https://github.com/search?q=EcoSolve',
    icon: <Award className="w-8 h-8" />,
    gradient: 'from-orange-300 to-amber-500',
  },
]

export function WinnersShowcase() {
  return (
    <section className="py-20 px-4 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 tech-grid opacity-20" />

      {/* Gradient orbs */}
      <div className="absolute top-10 left-1/4 w-96 h-96 bg-accent/10 rounded-full blur-3xl opacity-30 animate-pulse" />
      <div className="absolute bottom-10 right-1/4 w-96 h-96 bg-secondary/10 rounded-full blur-3xl opacity-30 animate-pulse" style={{ animationDelay: '0.5s' }} />

      <div className="relative z-10 max-w-6xl mx-auto">
        {/* Section header */}
        <div className="text-center mb-16">
          <p className="text-xs font-mono text-accent tracking-widest uppercase mb-4">Celebrating Excellence</p>
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4 text-balance">
            2026 Winners
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Meet the brilliant minds who transformed innovative ideas into real-world sustainable solutions
          </p>
        </div>

        {/* Winner cards */}
        <div className="space-y-8">
          {winners.map((winner, index) => (
            <div key={winner.position} className="relative group">
              {/* Card */}
              <div className={`glass-effect rounded-2xl p-8 md:p-12 glow-accent transition-all duration-500 hover:scale-105 
                ${index === 0 ? 'border-2 border-accent/50' : 'border border-border/50'}`}>
                <div className="flex flex-col md:flex-row gap-8 items-start">
                  {/* Left: Badge and info */}
                  <div className="flex-shrink-0">
                    <div className={`w-24 h-24 md:w-32 md:h-32 rounded-2xl bg-gradient-to-br ${winner.gradient} flex items-center justify-center text-white mb-4 md:mb-0 glow-accent`}>
                      {winner.icon}
                    </div>
                  </div>

                  {/* Right: Content */}
                  <div className="flex-1">
                    <div className="mb-4">
                      <p className="text-xs font-mono text-secondary tracking-widest uppercase mb-2">
                        Position {winner.position}
                      </p>
                      <h3 className="text-3xl md:text-4xl font-bold text-white mb-2">
                        {winner.teamName}
                      </h3>
                      <p className="text-lg text-accent font-semibold">{winner.title}</p>
                    </div>

                    <p className="text-muted-foreground mb-6 leading-relaxed">
                      {winner.description}
                    </p>

                    <div className="flex items-center justify-between pt-6 border-t border-border/50">
                      <div>
                        <p className="text-xs font-mono text-muted-foreground tracking-widest uppercase mb-1">Prize Amount</p>
                        <p className="text-2xl font-bold text-accent">{winner.prizeAmount}</p>
                      </div>
                      <a href={winner.projectUrl} target="_blank" rel="noopener noreferrer" className="btn-neon glow-cyan text-sm">
                        View Project
                      </a>
                    </div>
                  </div>
                </div>
              </div>

              {/* Position indicator */}
              <div className={`absolute -left-4 top-8 w-8 h-8 rounded-full bg-gradient-to-br ${winner.gradient} flex items-center justify-center font-bold text-white text-sm md:text-base`}>
                {winner.position}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
