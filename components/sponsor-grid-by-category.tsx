'use client'

import { useEffect, useState } from 'react'
import { ExternalLink, AlertCircle } from 'lucide-react'
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

  // Group sponsors by category
  const groupedSponsors: SponsorsByCategory = sponsors.reduce((acc, sponsor) => {
    const category = sponsor.category || 'Partner'
    if (!acc[category]) {
      acc[category] = []
    }
    acc[category].push(sponsor)
    return acc
  }, {} as SponsorsByCategory)

  // Define category order and styling (Platinum, Gold, Silver, Bronze first, then others alphabetically)
  const categoryOrder = ['Platinum', 'Gold', 'Silver', 'Bronze']
  const orderedCategories = [
    ...categoryOrder.filter((cat) => cat in groupedSponsors),
    ...Object.keys(groupedSponsors)
      .filter((cat) => !categoryOrder.includes(cat))
      .sort(),
  ]

  const getCategoryColor = (category: string): { bg: string; border: string; text: string; badge: string; accent: string } => {
    switch (category.toLowerCase()) {
      case 'platinum':
        return {
          bg: 'bg-gradient-to-br from-slate-900 via-slate-850 to-slate-800 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950',
          border: 'border-slate-500 dark:border-slate-600',
          text: 'text-slate-950 dark:text-slate-100',
          badge: 'bg-gradient-to-r from-slate-400 to-slate-300 text-slate-950 border border-slate-200',
          accent: 'text-slate-600 dark:text-slate-300',
        }
      case 'gold':
        return {
          bg: 'bg-gradient-to-br from-amber-50 via-yellow-50 to-amber-100 dark:from-amber-950/40 dark:via-amber-900/30 dark:to-yellow-950/40',
          border: 'border-amber-300 dark:border-amber-600',
          text: 'text-amber-950 dark:text-amber-100',
          badge: 'bg-gradient-to-r from-amber-500 to-yellow-500 text-amber-950 border border-amber-300',
          accent: 'text-amber-700 dark:text-amber-200',
        }
      case 'silver':
        return {
          bg: 'bg-gradient-to-br from-slate-100 via-slate-75 to-slate-50 dark:from-slate-800/50 dark:via-slate-750/50 dark:to-slate-900/50',
          border: 'border-slate-300 dark:border-slate-600',
          text: 'text-slate-950 dark:text-slate-100',
          badge: 'bg-gradient-to-r from-slate-400 to-slate-300 text-slate-900 border border-slate-300',
          accent: 'text-slate-600 dark:text-slate-400',
        }
      case 'bronze':
        return {
          bg: 'bg-gradient-to-br from-orange-50 via-amber-50 to-orange-100 dark:from-orange-950/40 dark:via-orange-900/30 dark:to-amber-950/40',
          border: 'border-orange-300 dark:border-orange-700',
          text: 'text-orange-950 dark:text-orange-100',
          badge: 'bg-gradient-to-r from-orange-500 to-amber-500 text-orange-950 border border-orange-300',
          accent: 'text-orange-700 dark:text-orange-200',
        }
      default:
        return {
          bg: 'bg-gradient-to-br from-cyan-50 via-blue-50 to-cyan-100 dark:from-cyan-950/40 dark:via-cyan-900/30 dark:to-blue-950/40',
          border: 'border-cyan-300 dark:border-cyan-700',
          text: 'text-cyan-950 dark:text-cyan-100',
          badge: 'bg-gradient-to-r from-cyan-500 to-blue-500 text-cyan-50 border border-cyan-300',
          accent: 'text-cyan-700 dark:text-cyan-200',
        }
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-500" />
      </div>
    )
  }

  if (sponsors.length === 0) {
    return (
      <div className="flex items-center justify-center gap-3 py-20 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50">
        <AlertCircle size={20} className="text-slate-400" />
        <p className="text-slate-600 dark:text-slate-400 text-base font-medium">No sponsors yet</p>
      </div>
    )
  }

  return (
    <div className="w-full space-y-16 py-6">
      {orderedCategories.map((category) => {
        const categorySponsors = groupedSponsors[category]
        const colors = getCategoryColor(category)

        return (
          <section key={category} className="w-full">
            {/* Category Header - Centered with Enhanced Styling */}
            <div className="mb-8 sm:mb-10 text-center">
              <div
                className={`inline-block mb-3 sm:mb-4 px-6 sm:px-8 py-2 sm:py-3 rounded-full text-base sm:text-lg font-bold uppercase tracking-widest shadow-lg ${colors.badge}`}
              >
                {category} Sponsor{categorySponsors.length !== 1 ? 's' : ''}
              </div>
              <div className="flex items-center justify-center gap-2 sm:gap-3 mt-2 sm:mt-3">
                <div className="h-px flex-1 max-w-[80px] sm:max-w-[100px] bg-gradient-to-r from-transparent via-slate-400 to-transparent" />
                <p className={`text-xs sm:text-sm font-semibold ${colors.accent}`}>
                  {categorySponsors.length} {categorySponsors.length === 1 ? 'Organization' : 'Organizations'}
                </p>
                <div className="h-px flex-1 max-w-[80px] sm:max-w-[100px] bg-gradient-to-r from-transparent via-slate-400 to-transparent" />
              </div>
            </div>

            {/* Sponsors List - Full Width Cards */}
            <div className={`relative w-full space-y-4 rounded-none sm:rounded-3xl border-0 sm:border-2 ${colors.border} ${colors.bg} p-4 sm:p-8 overflow-hidden`}>
              {/* Curved background accent */}
              <div className="absolute inset-0 rounded-none sm:rounded-3xl opacity-40 pointer-events-none"
                   style={{
                     backgroundImage: `radial-gradient(circle at 20% 50%, rgba(255,255,255,0.1) 0%, transparent 50%), 
                                       radial-gradient(circle at 80% 80%, rgba(0,0,0,0.05) 0%, transparent 50%)`,
                   }}
              />
              <div className="relative space-y-4">
              {categorySponsors
                .sort((a, b) => a.displayOrder - b.displayOrder)
                .map((sponsor) => (
                  <div
                    key={sponsor.id}
                    className={`relative flex flex-col sm:flex-row gap-4 sm:gap-6 p-4 sm:p-6 rounded-lg sm:rounded-xl border-0 sm:border border-white/20 dark:border-slate-700 bg-white dark:bg-slate-900/70 sm:hover:shadow-xl transition-all duration-300 group`}
                  >
                    {/* Logo - Left Side */}
                    <div className="flex-shrink-0 w-full sm:w-48">
                      <div className={`flex items-center justify-center h-36 sm:h-48 rounded-lg border-0 sm:border-2 ${colors.border} overflow-hidden shadow-sm sm:shadow-md dark:bg-slate-950/50 bg-white`}>
                        {sponsor.websiteUrl ? (
                          <a
                            href={sponsor.websiteUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center justify-center w-full h-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                            title={`Visit ${sponsor.name}`}
                          >
                            <img
                              src={sponsor.logoUrl}
                              alt={sponsor.name}
                              className="max-h-32 sm:max-h-40 max-w-[95%] object-contain"
                              onError={(e) => {
                                e.currentTarget.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="120" height="80" viewBox="0 0 120 80"%3E%3Crect fill="%23f0f0f0" width="120" height="80"/%3E%3Ctext x="60" y="40" font-size="12" text-anchor="middle" dy=".3em" fill="%23999"%3ELogo%3C/text%3E%3C/svg%3E'
                              }}
                            />
                          </a>
                        ) : (
                          <img
                            src={sponsor.logoUrl}
                            alt={sponsor.name}
                            className="max-h-32 sm:max-h-40 max-w-[95%] object-contain"
                            onError={(e) => {
                              e.currentTarget.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="120" height="80" viewBox="0 0 120 80"%3E%3Crect fill="%23f0f0f0" width="120" height="80"/%3E%3Ctext x="60" y="40" font-size="12" text-anchor="middle" dy=".3em" fill="%23999"%3ELogo%3C/text%3E%3C/svg%3E'
                            }}
                          />
                        )}
                      </div>
                    </div>

                    {/* Content - Right Side */}
                    <div className="flex-1 flex flex-col gap-2 sm:gap-3">
                      {/* Sponsor Name */}
                      <div>
                        <h3 className="font-bold text-base sm:text-xl text-slate-900 dark:text-white">
                          {sponsor.name}
                        </h3>
                      </div>

                      {/* Description */}
                      {sponsor.description && (
                        <div className="flex-1">
                          <p className="text-xs sm:text-base text-slate-700 dark:text-slate-200 leading-relaxed line-clamp-3 sm:line-clamp-none">
                            {sponsor.description}
                          </p>
                        </div>
                      )}

                      {/* Website Link */}
                      {sponsor.websiteUrl && (
                        <div className="pt-1 sm:pt-2">
                          <a
                            href={sponsor.websiteUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-cyan-600 dark:text-cyan-400 hover:text-cyan-700 dark:hover:text-cyan-300 transition-colors group/link"
                          >
                            <span>Visit</span>
                            <ExternalLink size={14} className="sm:w-4 w-3 transform group-hover/link:translate-x-0.5 transition-transform" />
                          </a>
                        </div>
                      )}
                    </div>

                    {/* Featured Badge - Top Right */}
                    {sponsor.isFeatured && (
                      <div className="absolute top-3 right-3 px-3 py-1.5 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-xs sm:text-sm font-bold rounded-full shadow-lg">
                        ⭐ Featured
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </section>
        )
      })}
    </div>
  )
}
