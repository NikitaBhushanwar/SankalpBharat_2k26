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

  const categoryOrder = [
    'Title Sponsors',
    'Co Powered By Sponsors',
    'Powered By Sponsor',
    'Platinum',
    'Gold',
    'Silver',
    'Bronze',
  ]
  const orderedCategories = [
    ...categoryOrder.filter((cat) => cat in groupedSponsors),
    ...Object.keys(groupedSponsors)
      .filter((cat) => !categoryOrder.includes(cat))
      .sort(),
  ]

  const getCategoryColor = (category: string) => {
    switch (category.toLowerCase()) {
      case 'title sponsors':
        return {
          badge: 'bg-gradient-to-r from-red-500 to-rose-500 text-white border border-rose-300',
          accent: 'text-rose-700 dark:text-rose-200',
          cardBorder: 'border-rose-500/20',
          glow: 'shadow-[0_0_30px_-10px_rgba(244,63,94,0.3)]'
        }
      case 'co powered by sponsors':
        return {
          badge: 'bg-gradient-to-r from-orange-500 to-amber-500 text-slate-950 border border-amber-300',
          accent: 'text-orange-700 dark:text-orange-200',
          cardBorder: 'border-orange-500/20',
          glow: 'shadow-[0_0_30px_-10px_rgba(245,158,11,0.25)]'
        }
      case 'powered by sponsor':
        return {
          badge: 'bg-gradient-to-r from-cyan-500 to-blue-500 text-cyan-50 border border-cyan-300',
          accent: 'text-cyan-700 dark:text-cyan-200',
          cardBorder: 'border-cyan-500/20',
          glow: 'shadow-[0_0_30px_-10px_rgba(6,182,212,0.25)]'
        }
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

  const getSectionHeading = (category: string, count: number) => {
    if (/sponsor/i.test(category)) return category
    return `${category} Sponsor${count !== 1 ? 's' : ''}`
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
                {getSectionHeading(category, categorySponsors.length)}
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
                    <div className="relative h-56 w-full bg-white/[0.02] rounded-[2rem] overflow-hidden p-4">
                      <div className="absolute inset-0 bg-white/5 blur-3xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                      <div className={`relative z-10 grid h-full w-full gap-3 ${sponsor.secondaryLogoUrl ? 'grid-cols-2' : 'grid-cols-1'}`}>
                        <div className="flex items-center justify-center">
                          <img
                            src={sponsor.logoUrl}
                            alt={`${sponsor.name} primary logo`}
                            className="h-full w-full object-contain p-4 transition-transform duration-500 group-hover:scale-105 filter drop-shadow-2xl"
                          />
                        </div>
                        {sponsor.secondaryLogoUrl && (
                          <div className="flex items-center justify-center border-l border-white/10">
                            <img
                              src={sponsor.secondaryLogoUrl}
                              alt={`${sponsor.name} secondary logo`}
                              className="h-full w-full object-contain p-4 transition-transform duration-500 group-hover:scale-105 filter drop-shadow-2xl"
                            />
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Content Area */}
                    <div className="text-center p-4 w-full">
    <h3 className="text-xl font-bold text-white tracking-tight group-hover:text-cyan-400 transition-colors truncate">
      {sponsor.name}
    </h3>

                      {(sponsor.titlePrimary || sponsor.titleSecondary) && (
                        <div className="mt-3 mb-2 flex flex-wrap items-center justify-center gap-2">
                          {sponsor.titlePrimary && (
                            <span className="px-2 py-1 rounded-full text-[10px] font-black tracking-wide uppercase bg-red-500/20 text-red-300 border border-red-500/30">
                              {sponsor.titlePrimary}
                            </span>
                          )}
                          {sponsor.titleSecondary && (
                            <span className="px-2 py-1 rounded-full text-[10px] font-black tracking-wide uppercase bg-blue-500/20 text-blue-300 border border-blue-500/30">
                              {sponsor.titleSecondary}
                            </span>
                          )}
                        </div>
                      )}
                      
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