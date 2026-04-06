'use client'

import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react'
import { ArrowLeft, Clock3, Megaphone } from 'lucide-react'
import type { AnnouncementEntry } from '@/lib/admin-repository'

interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
}

const formatDateTime = (value: string) =>
  new Intl.DateTimeFormat('en-IN', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value))

const getBadgeLabel = (announcement: AnnouncementEntry) => {
  const ageInMs = Date.now() - new Date(announcement.createdAt).getTime()

  if (ageInMs <= 1000 * 60 * 60 * 72) {
    return 'NEW'
  }

  return announcement.tag.trim().toUpperCase() || 'UPDATE'
}

export default function AnnouncementsPage() {
  const [announcements, setAnnouncements] = useState<AnnouncementEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchAnnouncements = async () => {
      setLoading(true)
      setError(null)

      try {
        const response = await fetch('/api/announcements', {
          cache: 'no-store',
        })
        const json = (await response.json()) as ApiResponse<AnnouncementEntry[]>

        if (!response.ok || !json.success) {
          throw new Error(json.error || 'Failed to fetch announcements')
        }

        setAnnouncements(json.data ?? [])
      } catch (fetchError) {
        setError(fetchError instanceof Error ? fetchError.message : 'Failed to fetch announcements')
      } finally {
        setLoading(false)
      }
    }

    void fetchAnnouncements()
  }, [])

  const latestAnnouncement = useMemo(() => announcements[0], [announcements])

  return (
    <main className="min-h-screen px-4 sm:px-6 lg:px-8 pt-36 pb-10">
      <div className="mx-auto max-w-6xl rounded-3xl border border-cyan-500/20 bg-slate-950/80 backdrop-blur-xl shadow-2xl p-4 sm:p-6 lg:p-8">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <Link href="/" className="inline-flex items-center gap-2 text-sm font-semibold text-slate-300 hover:text-cyan-300 transition">
            <ArrowLeft size={16} /> Back to Home
          </Link>

          <div className="inline-flex items-center gap-2 rounded-full border border-cyan-500/20 bg-cyan-500/10 px-3 py-1 text-[11px] font-black uppercase tracking-[0.2em] text-cyan-200">
            <Megaphone size={13} /> Live Updates
          </div>
        </div>

        <div className="mb-8 rounded-3xl border border-cyan-500/20 bg-gradient-to-br from-cyan-500/10 via-slate-900/70 to-blue-500/10 p-5 sm:p-6 lg:p-8">
          <p className="text-xs font-black uppercase tracking-[0.28em] text-cyan-300">Announcements</p>
          <h1 className="mt-2 text-3xl sm:text-4xl lg:text-5xl font-black text-white">All event updates in one place</h1>
          <p className="mt-3 max-w-3xl text-sm sm:text-base text-slate-300">
            The newest notices stay on top, and each post carries a timestamp so teams can see what changed and when.
          </p>

          {latestAnnouncement && (
            <div className="mt-5 inline-flex flex-wrap items-center gap-2 rounded-2xl border border-cyan-400/20 bg-slate-950/50 px-4 py-3 text-sm text-slate-200">
              <span className="rounded-full bg-cyan-500/15 px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-cyan-200">
                {getBadgeLabel(latestAnnouncement)}
              </span>
              <span className="font-semibold">Latest:</span>
              <span>{latestAnnouncement.title}</span>
            </div>
          )}
        </div>

        {error && <div className="mb-5 rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-300">{error}</div>}

        {loading ? (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: 6 }).map((_, index) => (
              <div key={index} className="h-40 rounded-2xl border border-white/10 bg-slate-900/60 animate-pulse" />
            ))}
          </div>
        ) : announcements.length === 0 ? (
          <div className="rounded-3xl border border-white/10 bg-slate-900/60 p-8 text-center text-slate-300">
            No announcements have been posted yet.
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {announcements.map((announcement) => (
              <article key={announcement.id} className="rounded-3xl border border-cyan-500/15 bg-slate-900/70 p-5 shadow-lg shadow-cyan-950/20 transition hover:-translate-y-0.5 hover:border-cyan-400/30">
                <div className="flex items-start justify-between gap-3">
                  <span className="rounded-full bg-cyan-500/15 px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-cyan-200">
                    {getBadgeLabel(announcement)}
                  </span>
                  <div className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-300">
                    <Clock3 size={12} /> {formatDateTime(announcement.createdAt)}
                  </div>
                </div>

                <h2 className="mt-4 text-xl font-black text-white">{announcement.title}</h2>
                <p className="mt-3 text-sm leading-relaxed text-slate-300">{announcement.message}</p>

                <div className="mt-4 flex flex-wrap items-center gap-2 text-[11px] font-semibold text-slate-400">
                  <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1">Tag: {announcement.tag}</span>
                  <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1">
                    Updated {formatDateTime(announcement.updatedAt)}
                  </span>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </main>
  )
}