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

  const orderedCategories = Object.keys(groupedSponsors).sort((a, b) => {
    const minA = Math.min(...groupedSponsors[a].map((sponsor) => sponsor.displayOrder))
    const minB = Math.min(...groupedSponsors[b].map((sponsor) => sponsor.displayOrder))

    if (minA !== minB) return minA - minB
    return a.localeCompare(b)
  })

  const getCategoryColor = (category: string) => {
    switch (category.toLowerCase()) {
      case 'title':
      case 'title sponsors':
        return {
          badge: 'bg-gradient-to-r from-red-500 to-rose-500 text-white border border-rose-300',
          accent: 'text-rose-700 dark:text-rose-200',
          cardBorder: 'border-rose-500/20',
          glow: 'shadow-[0_0_30px_-10px_rgba(244,63,94,0.3)]'
        }
      case 'co powered by':
      case 'co-powered by':
      case 'co powered by sponsors':
        return {
          badge: 'bg-gradient-to-r from-orange-500 to-amber-500 text-slate-950 border border-amber-300',
          accent: 'text-orange-700 dark:text-orange-200',
          cardBorder: 'border-orange-500/20',
          glow: 'shadow-[0_0_30px_-10px_rgba(245,158,11,0.25)]'
        }
      case 'powered by':
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
          cardBorder: 'border-slate-500/30',
          glow: 'shadow-[0_0_30px_-10px_rgba(148,163,184,0.2)]'
        }
      case 'gold':
        return {
          badge: 'bg-gradient-to-r from-amber-500 to-yellow-500 text-amber-950 border border-amber-300',
          cardBorder: 'border-amber-500/20',
          glow: 'shadow-[0_0_30px_-10px_rgba(245,158,11,0.2)]'
        }
      case 'silver':
        return {
          badge: 'bg-gradient-to-r from-slate-400 to-slate-300 text-slate-900 border border-slate-300',
          cardBorder: 'border-slate-400/20',
          glow: 'shadow-none'
        }
      case 'bronze':
        return {
          badge: 'bg-gradient-to-r from-orange-500 to-amber-500 text-orange-950 border border-orange-300',
          cardBorder: 'border-orange-700/20',
          glow: 'shadow-none'
        }
      default:
        return {
          badge: 'bg-gradient-to-r from-cyan-500 to-blue-500 text-cyan-50 border border-cyan-300',
          cardBorder: 'border-cyan-500/20',
          glow: 'shadow-none'
        }
    }
  }

  const getSectionHeading = (category: string, count: number) => {
    let clean = category.trim().replace(/\s+/g, ' ')
    clean = clean.replace(/\bSponsors?\s+Sponsors?\b/gi, 'Sponsors')
    clean = clean.replace(/\bSponsor\s+Sponsor\b/gi, 'Sponsor')
    clean = clean.replace(/^Title Sponsors?$/i, 'Title Sponsor')
    clean = clean.replace(/^Powered By Sponsors?$/i, 'Powered By')
    clean = clean.replace(/^Co[- ]Powered By Sponsors?$/i, 'Co-Powered By')

    if (/^(title sponsor|powered by|co[- ]powered by)$/i.test(clean)) return clean

    if (/^title$/i.test(clean)) return 'Title Sponsor'

    if (/\bsponsors?\b/i.test(clean)) return clean
    return `${clean} Sponsor${count !== 1 ? 's' : ''}`
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-10 w-10 border-2 border-cyan-500/20 border-t-cyan-500" />
      </div>
    )
  }

  return (
    <div className="w-full space-y-16 md:space-y-24 py-12 px-4 max-w-7xl mx-auto">
      {orderedCategories.map((category) => {
        const categorySponsors = groupedSponsors[category]
        const colors = getCategoryColor(category)
        const categoryLabel = getSectionHeading(category, 1)

        return (
          <section key={category} className="w-full">
            {/* Grid Layout - Changed to better handle small screens */}
            <div className="flex flex-wrap justify-center gap-4 sm:gap-8 lg:gap-10">
              {categorySponsors
                .sort((a, b) => a.displayOrder - b.displayOrder)
                .map((sponsor) => {
                  const detailsBlock = (
                    <div className="text-center p-3 md:p-4 w-full">
                      <h3 className="text-lg md:text-xl font-bold text-white tracking-tight group-hover:text-cyan-400 transition-colors truncate">
                        {sponsor.name}
                      </h3>

                      <div className="mt-2">
                        <span className={`inline-flex items-center rounded-full px-3 py-1 text-[10px] md:text-xs font-black uppercase tracking-[0.18em] ${colors.badge}`}>
                          {categoryLabel}
                        </span>
                      </div>

                      {(sponsor.titlePrimary || sponsor.titleSecondary) && (
                        <div className="mt-2 flex flex-wrap items-center justify-center gap-2">
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
                        <p className="text-[10px] md:text-xs text-slate-400 font-medium leading-relaxed line-clamp-2 px-1 md:px-2 mt-1">
                          {sponsor.description}
                        </p>
                      )}

                      {sponsor.websiteUrl && (
                        <div className="pt-3">
                          <a
                            href={sponsor.websiteUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 text-[9px] md:text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 hover:text-white transition-all group/link"
                          >
                            <Globe size={12} className="md:w-[12px] w-[10px]" />
                            <span>VISIT WEBSITE</span>
                            <ExternalLink size={10} className="group-hover/link:translate-x-1 transition-transform md:w-[10px] w-[8px]" />
                          </a>
                        </div>
                      )}
                    </div>
                  )

                  if (sponsor.secondaryLogoUrl) {
                    return (
                      <div key={sponsor.id} className="w-full">
                        {/* Desktop: one larger card with both logos */}
                        <div
                          className={`hidden md:flex group relative flex-col items-center w-full max-w-[760px] mx-auto p-8 rounded-[2.5rem] border ${colors.cardBorder} bg-slate-900/40 backdrop-blur-md ${colors.glow} transition-all duration-500 hover:-translate-y-2 hover:bg-slate-900/60 shadow-2xl`}
                        >
                          {sponsor.isFeatured && (
                            <div className="absolute -top-2 -right-2 bg-amber-500 text-slate-950 p-2 rounded-full shadow-[0_0_15px_rgba(245,158,11,0.5)] z-20">
                              <span className="block text-xs font-black">★</span>
                            </div>
                          )}

                          <div className="relative h-64 w-full grid grid-cols-2 gap-4 bg-white/[0.02] rounded-[2rem] overflow-hidden p-3">
                            <div className="flex items-center justify-center rounded-xl border border-white/10 bg-slate-950/20 p-4">
                              <img
                                src={sponsor.logoUrl}
                                alt={`${sponsor.name} primary logo`}
                                className="h-full w-full object-contain"
                              />
                            </div>
                            <div className="flex items-center justify-center rounded-xl border border-white/10 bg-slate-950/20 p-4">
                              <img
                                src={sponsor.secondaryLogoUrl}
                                alt={`${sponsor.name} secondary logo`}
                                className="h-full w-full object-contain"
                              />
                            </div>
                          </div>

                          {detailsBlock}
                        </div>

                        {/* Mobile: one card with both logos */}
                        <div
                          className={`md:hidden group relative flex flex-col items-center w-full p-4 rounded-[1.5rem] border ${colors.cardBorder} bg-slate-900/40 backdrop-blur-md shadow-2xl`}
                        >
                          {sponsor.isFeatured && (
                            <div className="absolute top-2 right-2 bg-amber-500 text-slate-950 p-1.5 rounded-full shadow-[0_0_15px_rgba(245,158,11,0.5)] z-20">
                              <span className="block text-[10px] font-black">★</span>
                            </div>
                          )}

                          <div className="relative h-64 w-full grid grid-cols-1 gap-3 bg-white/[0.02] rounded-[1.2rem] overflow-hidden p-2">
                            <div className="flex items-center justify-center rounded-xl border border-white/10 bg-slate-950/20 p-2">
                              <img
                                src={sponsor.logoUrl}
                                alt={`${sponsor.name} primary logo`}
                                className="h-full w-full object-contain"
                              />
                            </div>
                            <div className="flex items-center justify-center rounded-xl border border-white/10 bg-slate-950/20 p-2">
                              <img
                                src={sponsor.secondaryLogoUrl}
                                alt={`${sponsor.name} secondary logo`}
                                className="h-full w-full object-contain"
                              />
                            </div>
                          </div>

                          {detailsBlock}
                        </div>
                      </div>
                    )
                  }

                  return (
                    <div
                      key={sponsor.id}
                      className={`group relative flex flex-col items-center w-full sm:w-[340px] p-4 md:p-8 rounded-[1.5rem] md:rounded-[2.5rem] border ${colors.cardBorder} bg-slate-900/40 backdrop-blur-md ${colors.glow} transition-all duration-500 md:hover:-translate-y-2 md:hover:bg-slate-900/60 shadow-2xl`}
                    >
                      {sponsor.isFeatured && (
                        <div className="absolute top-2 right-2 md:-top-2 md:-right-2 bg-amber-500 text-slate-950 p-1.5 md:p-2 rounded-full shadow-[0_0_15px_rgba(245,158,11,0.5)] z-20">
                          <span className="block text-[10px] md:text-xs font-black">★</span>
                        </div>
                      )}

                      <div className="relative h-40 md:h-56 w-full flex items-center justify-center bg-white/[0.02] rounded-[1.2rem] md:rounded-[2rem] overflow-hidden p-2">
                        <img
                          src={sponsor.logoUrl}
                          alt={sponsor.name}
                          className="h-full w-full object-contain p-2 md:p-6 relative z-10 transition-transform duration-500 group-hover:scale-110 filter drop-shadow-2xl border border-white/10 rounded-xl bg-slate-950/20"
                        />
                      </div>

                      {detailsBlock}
                    </div>
                  )
                })}
            </div>
          </section>
        )
      })}
    </div>
  )
}