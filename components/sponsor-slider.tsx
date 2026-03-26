'use client'

import { useEffect, useState } from 'react'
import type { SponsorEntry } from '@/lib/admin-repository'

export default function SponsorSlider() {
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

  // Fallback if no sponsors
  const displaySponsors =
    sponsors.length > 0
      ? sponsors
      : Array.from({ length: 6 }, (_, i) => ({
          id: `placeholder-${i}`,
          name: 'Partner',
          logoUrl: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="120" height="80" viewBox="0 0 120 80"%3E%3Crect fill="%23f0f0f0" width="120" height="80"/%3E%3Ctext x="60" y="40" font-size="12" text-anchor="middle" dy=".3em" fill="%23999"%3ELogo%3C/text%3E%3C/svg%3E',
          secondaryLogoUrl: null,
          websiteUrl: null,
          category: 'Partner',
          titlePrimary: null,
          titleSecondary: null,
          description: null,
          displayOrder: 0,
          isFeatured: false,
        }))

  return (
    <section className="relative w-full py-4 sm:py-6 overflow-hidden">
      <div className="absolute inset-0 tech-grid opacity-15" />

      <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
        <div
          className="w-[220px] h-[220px] sm:w-[320px] sm:h-[320px] rounded-full blur-3xl opacity-25
                     bg-gradient-to-r from-orange-500/50 via-emerald-500/40 to-blue-500/50
                     sponsor-pulse-slow"
        />
      </div>

      <h2 className="relative z-10 text-sm sm:text-base font-black text-center mb-4 sm:mb-6 tracking-tight text-foreground uppercase">
        Our Sponsors
      </h2>

      <div className="relative z-10 mx-auto w-full max-w-7xl px-3 sm:px-4 lg:px-6">
        <div
          className="relative overflow-hidden rounded-2xl sm:rounded-3xl
                     border border-border/50 glass-effect
                     shadow-2xl py-3 sm:py-4 md:py-6 px-2 sm:px-4"
        >
          {/* Gradient overlays */}
          <div className="pointer-events-none absolute left-0 top-0 h-full w-14 sm:w-24
                          bg-gradient-to-r from-background/90 to-transparent z-20" />
          <div className="pointer-events-none absolute right-0 top-0 h-full w-14 sm:w-24
                          bg-gradient-to-l from-background/90 to-transparent z-20" />

          {loading ? (
            <div className="flex items-center justify-center h-24 sm:h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500" />
            </div>
          ) : sponsors.length === 0 ? (
            <div className="flex items-center justify-center h-24 sm:h-32">
              <p className="text-muted-foreground text-sm">No sponsors yet</p>
            </div>
          ) : sponsors.length === 1 ? (
            // Single sponsor - show centered without duplication
            <div className="flex items-center justify-center py-3 sm:py-4 md:py-6">
              {sponsors[0].websiteUrl ? (
                <a
                  href={sponsors[0].websiteUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`inline-flex items-center justify-center ${sponsors[0].secondaryLogoUrl ? 'h-40 sm:h-28 md:h-36' : 'h-24 sm:h-28 md:h-36'} w-full
                             px-4 sm:px-6 md:px-8 py-2 sm:py-3 md:py-4
                             rounded-lg sm:rounded-xl
                             border border-orange-500/30 bg-orange-500/10
                             hover:border-orange-500/60 hover:bg-orange-500/20
                             transition-all duration-300 group/sponsor ${sponsors[0].secondaryLogoUrl ? 'max-w-[92vw] sm:max-w-[560px] md:max-w-[700px]' : 'max-w-[320px] sm:max-w-[420px]'}`}
                  title={sponsors[0].name}
                >
                  <div className={`grid w-full items-center ${sponsors[0].secondaryLogoUrl ? 'grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-4' : 'grid-cols-1'}`}>
                    <div className="h-16 sm:h-20 md:h-24 min-w-0 rounded-lg border border-orange-500/30 bg-slate-900/60 flex items-center justify-center px-2 sm:px-3">
                      <img
                        src={sponsors[0].logoUrl}
                        alt={`${sponsors[0].name} primary logo`}
                        className="h-full w-full max-w-full object-contain"
                        onError={(e) => {
                          e.currentTarget.src =
                            'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="120" height="80" viewBox="0 0 120 80"%3E%3Crect fill="%23f0f0f0" width="120" height="80"/%3E%3Ctext x="60" y="40" font-size="10" text-anchor="middle" dy=".3em" fill="%23999"%3ENo Logo%3C/text%3E%3C/svg%3E'
                        }}
                      />
                    </div>
                    {sponsors[0].secondaryLogoUrl && (
                      <div className="h-16 sm:h-20 md:h-24 min-w-0 rounded-lg border border-orange-500/30 bg-slate-900/60 flex items-center justify-center px-2 sm:px-3">
                        <img
                          src={sponsors[0].secondaryLogoUrl}
                          alt={`${sponsors[0].name} secondary logo`}
                          className="h-full w-full max-w-full object-contain"
                          onError={(e) => {
                            e.currentTarget.src =
                              'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="120" height="80" viewBox="0 0 120 80"%3E%3Crect fill="%23f0f0f0" width="120" height="80"/%3E%3Ctext x="60" y="40" font-size="10" text-anchor="middle" dy=".3em" fill="%23999"%3ENo Logo%3C/text%3E%3C/svg%3E'
                          }}
                        />
                      </div>
                    )}
                  </div>
                </a>
              ) : (
                <div
                  className={`inline-flex items-center justify-center ${sponsors[0].secondaryLogoUrl ? 'h-40 sm:h-28 md:h-36' : 'h-24 sm:h-28 md:h-36'} w-full
                             px-4 sm:px-6 md:px-8 py-2 sm:py-3 md:py-4
                             rounded-lg sm:rounded-xl
                             border border-orange-500/30 bg-orange-500/10 ${sponsors[0].secondaryLogoUrl ? 'max-w-[92vw] sm:max-w-[560px] md:max-w-[700px]' : 'max-w-[320px] sm:max-w-[420px]'}`}
                  title={sponsors[0].name}
                >
                  <div className={`grid w-full items-center ${sponsors[0].secondaryLogoUrl ? 'grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-4' : 'grid-cols-1'}`}>
                    <div className="h-16 sm:h-20 md:h-24 min-w-0 rounded-lg border border-orange-500/30 bg-slate-900/60 flex items-center justify-center px-2 sm:px-3">
                      <img
                        src={sponsors[0].logoUrl}
                        alt={`${sponsors[0].name} primary logo`}
                        className="h-full w-full max-w-full object-contain"
                        onError={(e) => {
                          e.currentTarget.src =
                            'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="120" height="80" viewBox="0 0 120 80"%3E%3Crect fill="%23f0f0f0" width="120" height="80"/%3E%3Ctext x="60" y="40" font-size="10" text-anchor="middle" dy=".3em" fill="%23999"%3ENo Logo%3C/text%3E%3C/svg%3E'
                        }}
                      />
                    </div>
                    {sponsors[0].secondaryLogoUrl && (
                      <div className="h-16 sm:h-20 md:h-24 min-w-0 rounded-lg border border-orange-500/30 bg-slate-900/60 flex items-center justify-center px-2 sm:px-3">
                        <img
                          src={sponsors[0].secondaryLogoUrl}
                          alt={`${sponsors[0].name} secondary logo`}
                          className="h-full w-full max-w-full object-contain"
                          onError={(e) => {
                            e.currentTarget.src =
                              'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="120" height="80" viewBox="0 0 120 80"%3E%3Crect fill="%23f0f0f0" width="120" height="80"/%3E%3Ctext x="60" y="40" font-size="10" text-anchor="middle" dy=".3em" fill="%23999"%3ENo Logo%3C/text%3E%3C/svg%3E'
                          }}
                        />
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          ) : (
            // Multiple sponsors - show with infinite scroll (duplicated)
            <div className="flex w-max sponsor-scroll-track gap-4 sm:gap-6 md:gap-8">
              {[...displaySponsors, ...displaySponsors].map((sponsor, index) => (
                <div
                  key={`${sponsor.id}-${index}`}
                  className="flex-shrink-0 h-20 sm:h-24 md:h-32 w-auto max-w-[86vw] sm:max-w-none flex items-center justify-center"
                >
                  {sponsor.websiteUrl ? (
                    <a
                      href={sponsor.websiteUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`h-full px-2 sm:px-3 md:px-4 py-1 sm:py-2 flex items-center justify-center
                                 rounded-lg sm:rounded-xl
                                 border border-orange-500/30 bg-orange-500/10
                                 hover:border-orange-500/60 hover:bg-orange-500/20
                                 transition-all duration-300 group/sponsor ${sponsor.secondaryLogoUrl ? 'w-[220px] sm:w-[280px] md:w-[340px]' : 'w-[130px] sm:w-[160px] md:w-[190px]'}`}
                      title={sponsor.name}
                    >
                      <div className={`grid w-full items-center ${sponsor.secondaryLogoUrl ? 'grid-cols-2 gap-2 sm:gap-3' : 'grid-cols-1'}`}>
                        <div className="h-14 sm:h-16 md:h-20 min-w-0 rounded-lg border border-orange-500/30 bg-slate-900/60 flex items-center justify-center px-1 sm:px-2">
                          <img
                            src={sponsor.logoUrl}
                            alt={`${sponsor.name} primary logo`}
                            className="h-full w-full max-w-full object-contain"
                            onError={(e) => {
                              e.currentTarget.src =
                                'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="120" height="80" viewBox="0 0 120 80"%3E%3Crect fill="%23f0f0f0" width="120" height="80"/%3E%3Ctext x="60" y="40" font-size="10" text-anchor="middle" dy=".3em" fill="%23999"%3ENo Logo%3C/text%3E%3C/svg%3E'
                            }}
                          />
                        </div>
                        {sponsor.secondaryLogoUrl && (
                          <div className="h-14 sm:h-16 md:h-20 min-w-0 rounded-lg border border-orange-500/30 bg-slate-900/60 flex items-center justify-center px-1 sm:px-2">
                            <img
                              src={sponsor.secondaryLogoUrl}
                              alt={`${sponsor.name} secondary logo`}
                              className="h-full w-full max-w-full object-contain"
                              onError={(e) => {
                                e.currentTarget.src =
                                  'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="120" height="80" viewBox="0 0 120 80"%3E%3Crect fill="%23f0f0f0" width="120" height="80"/%3E%3Ctext x="60" y="40" font-size="10" text-anchor="middle" dy=".3em" fill="%23999"%3ENo Logo%3C/text%3E%3C/svg%3E'
                              }}
                            />
                          </div>
                        )}
                      </div>
                    </a>
                  ) : (
                    <div
                      className={`h-full px-2 sm:px-3 md:px-4 py-1 sm:py-2 flex items-center justify-center
                                 rounded-lg sm:rounded-xl
                                 border border-orange-500/30 bg-orange-500/10 ${sponsor.secondaryLogoUrl ? 'w-[220px] sm:w-[280px] md:w-[340px]' : 'w-[130px] sm:w-[160px] md:w-[190px]'}`}
                      title={sponsor.name}
                    >
                      <div className={`grid w-full items-center ${sponsor.secondaryLogoUrl ? 'grid-cols-2 gap-2 sm:gap-3' : 'grid-cols-1'}`}>
                        <div className="h-14 sm:h-16 md:h-20 min-w-0 rounded-lg border border-orange-500/30 bg-slate-900/60 flex items-center justify-center px-1 sm:px-2">
                          <img
                            src={sponsor.logoUrl}
                            alt={`${sponsor.name} primary logo`}
                            className="h-full w-full max-w-full object-contain"
                            onError={(e) => {
                              e.currentTarget.src =
                                'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="120" height="80" viewBox="0 0 120 80"%3E%3Crect fill="%23f0f0f0" width="120" height="80"/%3E%3Ctext x="60" y="40" font-size="10" text-anchor="middle" dy=".3em" fill="%23999"%3ENo Logo%3C/text%3E%3C/svg%3E'
                            }}
                          />
                        </div>
                        {sponsor.secondaryLogoUrl && (
                          <div className="h-14 sm:h-16 md:h-20 min-w-0 rounded-lg border border-orange-500/30 bg-slate-900/60 flex items-center justify-center px-1 sm:px-2">
                            <img
                              src={sponsor.secondaryLogoUrl}
                              alt={`${sponsor.name} secondary logo`}
                              className="h-full w-full max-w-full object-contain"
                              onError={(e) => {
                                e.currentTarget.src =
                                  'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="120" height="80" viewBox="0 0 120 80"%3E%3Crect fill="%23f0f0f0" width="120" height="80"/%3E%3Ctext x="60" y="40" font-size="10" text-anchor="middle" dy=".3em" fill="%23999"%3ENo Logo%3C/text%3E%3C/svg%3E'
                              }}
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Info text */}
        {sponsors.length === 0 && !loading && (
          <p className="text-center text-muted-foreground text-sm mt-4">
            Sponsors coming soon!
          </p>
        )}
      </div>
    </section>
  )
}
