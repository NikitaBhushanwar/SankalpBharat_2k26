'use client'

import { useEffect, useState } from 'react'
import { ExternalLink, AlertCircle, Globe } from 'lucide-react'
import type { SponsorEntry } from '@/lib/admin-repository'

interface SponsorsByCategory {
  [category: string]: SponsorEntry[]
}

export default function SponsorGridByCategory() {
  const [sponsors, setSponsors] = useState<SponsorEntry[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchSponsors = async () => {
      try {
        const response = await fetch('/api/sponsors')
        const result = await response.json()
        if (result.success && result.data) {
          setSponsors(result.data)
        }
      } catch (error) {
        console.error('Failed to fetch sponsors:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchSponsors()
  }, [])

  const groupedSponsors: SponsorsByCategory = sponsors.reduce((acc, sponsor) => {
    const category = sponsor.category || 'Partner'
    if (!acc[category]) acc[category] = []
    acc[category].push(sponsor)
    return acc
  }, {} as SponsorsByCategory)

  const categoryOrder = ['Platinum', 'Gold', 'Silver', 'Bronze']
  const orderedCategories = [
    ...categoryOrder.filter((cat) => cat in groupedSponsors),
    ...Object.keys(groupedSponsors)
      .filter((cat) => !categoryOrder.includes(cat))
      .sort(),
  ]

  const getCategoryColor = (category: string) => {
    switch (category.toLowerCase()) {
      case 'platinum':
        return {
          badge: 'bg-gradient-to-r from-slate-400 to-slate-300 text-slate-950 border border-slate-200',
          accent: 'text-slate-600 dark:text-slate-300',
          cardBorder: 'border-slate-500/30',
          glow: 'shadow-[0_0_30px_-10px_rgba(148,163,184,0.2)]'
        }
      case 'gold':
        return {
          badge: 'bg-gradient-to-r from-amber-500 to-yellow-500 text-amber-950 border border-amber-300',
          accent: 'text-amber-700 dark:text-amber-200',
          cardBorder: 'border-amber-500/20',
          glow: 'shadow-[0_0_30px_-10px_rgba(245,158,11,0.2)]'
        }
      case 'silver':
        return {
          badge: 'bg-gradient-to-r from-slate-400 to-slate-300 text-slate-900 border border-slate-300',
          accent: 'text-slate-600 dark:text-slate-400',
          cardBorder: 'border-slate-400/20',
          glow: 'shadow-none'
        }
      case 'bronze':
        return {
          badge: 'bg-gradient-to-r from-orange-500 to-amber-500 text-orange-950 border border-orange-300',
          accent: 'text-orange-700 dark:text-orange-200',
          cardBorder: 'border-orange-700/20',
          glow: 'shadow-none'
        }
      default:
        return {
          badge: 'bg-gradient-to-r from-cyan-500 to-blue-500 text-cyan-50 border border-cyan-300',
          accent: 'text-cyan-700 dark:text-cyan-200',
          cardBorder: 'border-cyan-500/20',
          glow: 'shadow-none'
        }
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-10 w-10 border-2 border-cyan-500/20 border-t-cyan-500" />
      </div>
    )
  }

  return (
    <div className="w-full space-y-24 py-12 px-4 max-w-7xl mx-auto">
      {orderedCategories.map((category) => {
        const categorySponsors = groupedSponsors[category]
        const colors = getCategoryColor(category)

        return (
          <section key={category} className="w-full">
            {/* Category Header - PRESERVED ORIGINAL LOOK */}
            <div className="mb-12 text-center">
              <div className={`inline-block mb-4 px-8 py-3 rounded-full text-lg font-bold uppercase tracking-widest shadow-lg ${colors.badge}`}>
                {category} Sponsor{categorySponsors.length !== 1 ? 's' : ''}
              </div>
            </div>

            {/* NEW CENTERED GRID LAYOUT */}
            <div className="flex flex-wrap justify-center gap-8 lg:gap-10">
              {categorySponsors
                .sort((a, b) => a.displayOrder - b.displayOrder)
                .map((sponsor) => (
                  <div
                    key={sponsor.id}
                    className={`group relative flex flex-col items-center w-full sm:w-[340px] p-8 rounded-[2.5rem] border ${colors.cardBorder} bg-slate-900/40 backdrop-blur-md ${colors.glow} transition-all duration-500 hover:-translate-y-2 hover:bg-slate-900/60 shadow-2xl`}
                  >
                    {/* Featured Star */}
                    {sponsor.isFeatured && (
                      <div className="absolute -top-2 -right-2 bg-amber-500 text-slate-950 p-2 rounded-full shadow-[0_0_15px_rgba(245,158,11,0.5)] z-20">
                        <span className="block text-xs font-black">★</span>
                      </div>
                    )}

                    {/* Logo Area */}
                    <div className="relative h-56 w-full flex items-center justify-center bg-white/[0.02] rounded-[2rem] overflow-hidden">
    <div className="absolute inset-0 bg-white/5 blur-3xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
    
    <img
      src={sponsor.logoUrl}
      alt={sponsor.name}
      className="h-full w-full object-contain p-6 relative z-10 transition-transform duration-500 group-hover:scale-110 filter drop-shadow-2xl"
    />
  </div>

                    {/* Content Area */}
                    <div className="text-center p-4 w-full">
    <h3 className="text-xl font-bold text-white tracking-tight group-hover:text-cyan-400 transition-colors truncate">
      {sponsor.name}
    </h3>
                      
                      {sponsor.description && (
                        <p className="text-xs text-slate-400 font-medium leading-relaxed line-clamp-2 px-2">
                          {sponsor.description}
                        </p>
                      )}

                      {sponsor.websiteUrl && (
      <div className="pt-3">
        <a
          href={sponsor.websiteUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 hover:text-white transition-all group/link"
        >
          <Globe size={12} /> VISIT WEBSITE <ExternalLink size={10} className="group-hover/link:translate-x-1 transition-transform" />
        </a>
      </div>
    )}
                    </div>
                  </div>
                ))}
            </div>
          </section>
        )
      })}
    </div>
  )
}