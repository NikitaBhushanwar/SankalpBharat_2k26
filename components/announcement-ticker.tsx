'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Megaphone } from 'lucide-react'
import type { AnnouncementEntry } from '@/lib/admin-repository'

interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
}

const RECENT_WINDOW_MS = 1000 * 60 * 60 * 72

const getBadgeLabel = (announcement: AnnouncementEntry) => {
  const ageInMs = Date.now() - new Date(announcement.createdAt).getTime()

  if (ageInMs <= RECENT_WINDOW_MS) {
    return 'NEW'
  }

  return announcement.tag.trim().toUpperCase() || 'UPDATE'
}

export default function AnnouncementTicker() {
  const pathname = usePathname()
  const isAdminRoute = pathname.startsWith('/admin')
  const [announcements, setAnnouncements] = useState<AnnouncementEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [activeIndex, setActiveIndex] = useState(0)
  const [isPaused, setIsPaused] = useState(false)

  useEffect(() => {
    if (isAdminRoute) {
      setLoading(false)
      setAnnouncements([])
      return
    }

    const fetchAnnouncements = async () => {
      setLoading(true)

      try {
        const response = await fetch('/api/announcements?limit=6', {
          cache: 'no-store',
        })
        const json = (await response.json()) as ApiResponse<AnnouncementEntry[]>

        if (response.ok && json.success) {
          setAnnouncements(json.data ?? [])
        } else {
          setAnnouncements([])
        }
      } catch {
        setAnnouncements([])
      } finally {
        setLoading(false)
      }
    }

    void fetchAnnouncements()

    const handleStorage = (event: StorageEvent) => {
      if (event.key === 'sb_announcements_updated_at') {
        void fetchAnnouncements()
      }
    }

    let channel: BroadcastChannel | null = null

    if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
      channel = new BroadcastChannel('sb_admin_updates')
      channel.onmessage = (event) => {
        if (event.data?.type === 'announcements-updated') {
          void fetchAnnouncements()
        }
      }
    }

    window.addEventListener('storage', handleStorage)

    return () => {
      window.removeEventListener('storage', handleStorage)
      channel?.close()
    }
  }, [isAdminRoute])

  const displayAnnouncements =
    announcements.length > 0
      ? announcements
      : [
          {
            id: 'fallback-announcement',
            title: loading ? 'Loading announcements...' : 'No announcements posted yet',
            message: '',
            tag: 'Info',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
        ]

  useEffect(() => {
    setActiveIndex(0)
  }, [displayAnnouncements.length])

  useEffect(() => {
    if (isAdminRoute || displayAnnouncements.length <= 1 || isPaused) {
      return
    }

    const interval = window.setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % displayAnnouncements.length)
    }, 2400)

    return () => window.clearInterval(interval)
  }, [displayAnnouncements.length, isAdminRoute, isPaused])

  if (isAdminRoute) {
    return null
  }

  return (
    <div className="fixed inset-x-0 top-[4.85rem] sm:top-[5.35rem] z-40 pointer-events-none">
      <div className="mx-auto max-w-7xl px-4">
        <div className="pointer-events-auto overflow-hidden rounded-2xl border border-cyan-500/30 bg-slate-950/80 backdrop-blur-2xl shadow-[0_0_34px_rgba(6,182,212,0.14),0_8px_32px_rgba(0,0,0,0.42)]">
          <div className="flex min-h-[2.6rem] items-stretch">
            <div className="shrink-0 flex items-center gap-2 border-r border-cyan-500/20 px-3 sm:px-4 text-[10px] sm:text-[11px] font-black uppercase tracking-[0.2em] text-cyan-300 bg-cyan-500/8">
              <Megaphone size={13} />
              <span className="hidden sm:inline">Announcements</span>
            </div>

            <div
              className="relative flex-1 overflow-hidden"
              onMouseEnter={() => setIsPaused(true)}
              onMouseLeave={() => setIsPaused(false)}
            >
              <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-10 bg-gradient-to-r from-slate-950 to-transparent sm:w-14" />
              <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-10 bg-gradient-to-l from-slate-950 to-transparent sm:w-14" />

              <div className={`w-full px-3 py-1.5 sm:px-4 sm:py-2 ${loading ? 'opacity-75' : ''}`}>
                <div
                  className="flex transition-transform duration-500 ease-out"
                  style={{ transform: `translate3d(-${activeIndex * 100}%, 0, 0)` }}
                >
                  {displayAnnouncements.map((announcement, index) => (
                    <div key={`${announcement.id}-${index}`} className="min-w-full pr-2 sm:pr-3">
                      <Link
                        href="/announcements"
                        className="inline-flex w-full items-center gap-2 rounded-full border border-cyan-500/20 bg-cyan-500/12 px-2.5 py-1 text-[10px] font-semibold tracking-wide text-slate-100 transition hover:border-cyan-400/50 hover:bg-cyan-500/22 sm:px-3 sm:text-[11px]"
                      >
                        <span className="shrink-0 rounded-full bg-cyan-400/15 px-2 py-0.5 text-[9px] font-black tracking-[0.14em] text-cyan-200 sm:text-[10px]">
                          {getBadgeLabel(announcement)}
                        </span>
                        <span className="truncate whitespace-nowrap">{announcement.title}</span>
                      </Link>
                    </div>
                  ))}
                </div>
              </div>

              {displayAnnouncements.length > 1 && (
                <div className="pointer-events-none absolute right-3 top-1/2 z-20 hidden -translate-y-1/2 items-center gap-1.5 sm:flex">
                  {displayAnnouncements.map((announcement, index) => (
                    <span
                      key={`${announcement.id}-dot-${index}`}
                      className={`h-1.5 rounded-full transition-all duration-300 ${
                        index === activeIndex ? 'w-4 bg-cyan-300' : 'w-1.5 bg-slate-500/70'
                      }`}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}