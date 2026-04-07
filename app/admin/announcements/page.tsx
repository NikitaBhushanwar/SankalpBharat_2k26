'use client'

import { FormEvent, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Clock3, LogOut, Megaphone, Pencil, Plus, Trash2 } from 'lucide-react'
import { useAuth } from '@/context/auth-context'
import type { AnnouncementEntry } from '@/lib/admin-repository'

interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
}

const emptyForm = {
  title: '',
  message: '',
  tag: 'Update',
}

const formatDateTime = (value: string) =>
  new Intl.DateTimeFormat('en-IN', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value))

const notifyAnnouncementsUpdated = () => {
  const updateAt = String(Date.now())

  if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
    const channel = new BroadcastChannel('sb_admin_updates')
    channel.postMessage({ type: 'announcements-updated', updatedAt: updateAt })
    channel.close()
  }

  localStorage.setItem('sb_announcements_updated_at', updateAt)
}

export default function AdminAnnouncementsPage() {
  const router = useRouter()
  const { isAuthenticated, logout } = useAuth()

  const [announcements, setAnnouncements] = useState<AnnouncementEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState(emptyForm)

  useEffect(() => {
    if (!isAuthenticated) {
      router.replace('/admin/login')
      return
    }

    void loadAnnouncements()
  }, [isAuthenticated, router])

  const loadAnnouncements = async () => {
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

  const resetForm = () => {
    setForm(emptyForm)
    setEditingId(null)
    setShowForm(false)
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setSaving(true)
    setError(null)

    try {
      const payload = {
        title: form.title.trim(),
        message: form.message.trim(),
        tag: form.tag.trim() || 'Update',
      }

      const endpoint = editingId ? `/api/announcements/${editingId}` : '/api/announcements'
      const method = editingId ? 'PUT' : 'POST'

      const response = await fetch(endpoint, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const json = (await response.json()) as ApiResponse<AnnouncementEntry>

      if (!response.ok || !json.success) {
        throw new Error(json.error || 'Failed to save announcement')
      }

      notifyAnnouncementsUpdated()
      await loadAnnouncements()
      resetForm()
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : 'Failed to save announcement')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this announcement?')) {
      return
    }

    setSaving(true)
    setError(null)

    try {
      const response = await fetch(`/api/announcements/${id}`, {
        method: 'DELETE',
      })
      const json = (await response.json()) as ApiResponse<null>

      if (!response.ok || !json.success) {
        throw new Error(json.error || 'Failed to delete announcement')
      }

      notifyAnnouncementsUpdated()
      await loadAnnouncements()
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : 'Failed to delete announcement')
    } finally {
      setSaving(false)
    }
  }

  if (!isAuthenticated) {
    return null
  }

  return (
    <section className="min-h-screen px-4 sm:px-6 lg:px-8 pt-28 pb-10">
      <div className="mx-auto max-w-6xl rounded-3xl border border-cyan-500/20 bg-slate-950/80 backdrop-blur-xl shadow-2xl p-4 sm:p-6 lg:p-8">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <button
            onClick={() => router.push('/admin/dashboard')}
            className="inline-flex items-center gap-2 text-sm font-semibold text-slate-300 hover:text-cyan-300 transition"
          >
            <ArrowLeft size={16} /> Back to Dashboard
          </button>

          <button
            onClick={() => {
              logout()
              router.replace('/admin/login')
            }}
            className="inline-flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold uppercase tracking-wider bg-red-500/20 text-red-300 hover:bg-red-500/30 transition"
          >
            <LogOut size={14} /> Logout
          </button>
        </div>

        <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-[0.22em] text-cyan-300">
              <Megaphone size={14} /> Admin Content
            </p>
            <h1 className="mt-1 text-2xl sm:text-3xl lg:text-4xl font-black text-white">Announcements</h1>
            <p className="mt-1 text-sm text-slate-400">Publish updates that appear at the top of the site and in the moving ticker.</p>
          </div>

          <button
            onClick={() => {
              setShowForm((prev) => !prev)
              if (editingId) {
                resetForm()
              }
            }}
            className="inline-flex items-center gap-2 rounded-xl bg-cyan-500 px-4 py-2 text-sm font-black text-slate-950 transition hover:brightness-110"
          >
            <Plus size={16} /> {showForm ? 'Close Form' : 'Add Announcement'}
          </button>
        </div>

        {error && <div className="mb-5 rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-300">{error}</div>}

        {showForm && (
          <form onSubmit={handleSubmit} className="mb-6 grid gap-3 rounded-3xl border border-cyan-500/15 bg-slate-900/80 p-4 sm:p-5">
            <input
              value={form.title}
              onChange={(event) => setForm((prev) => ({ ...prev, title: event.target.value }))}
              placeholder="Announcement title"
              className="rounded-xl border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-white outline-none focus:border-cyan-400"
              required
            />
            <input
              value={form.tag}
              onChange={(event) => setForm((prev) => ({ ...prev, tag: event.target.value }))}
              placeholder="Tag like New, Update, Urgent"
              className="rounded-xl border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-white outline-none focus:border-cyan-400"
              required
            />
            <textarea
              value={form.message}
              onChange={(event) => setForm((prev) => ({ ...prev, message: event.target.value }))}
              placeholder="Full announcement message"
              rows={5}
              className="rounded-xl border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-white outline-none focus:border-cyan-400"
              required
            />

            <div className="flex flex-wrap justify-end gap-2">
              <button
                type="button"
                onClick={resetForm}
                className="rounded-xl bg-slate-700 px-4 py-2 text-xs font-bold uppercase tracking-wider text-slate-200"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="rounded-xl bg-cyan-500 px-4 py-2 text-xs font-black uppercase tracking-wider text-slate-950 disabled:opacity-60"
              >
                {editingId ? 'Update Announcement' : 'Save Announcement'}
              </button>
            </div>
          </form>
        )}

        <div className="rounded-3xl border border-cyan-500/15 bg-slate-900/55 overflow-hidden">
          {loading ? (
            <div className="p-10 text-center text-slate-400">Loading announcements...</div>
          ) : announcements.length === 0 ? (
            <div className="p-10 text-center text-slate-400">No announcements added yet.</div>
          ) : (
            <div className="space-y-3 p-3 sm:p-4">
              {announcements.map((announcement) => (
                <article key={announcement.id} className="rounded-2xl border border-white/10 bg-slate-950/60 p-4">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="rounded-full bg-cyan-500/15 px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-cyan-200">
                          {announcement.tag}
                        </span>
                        <span className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-300">
                          <Clock3 size={12} /> {formatDateTime(announcement.createdAt)}
                        </span>
                      </div>

                      <h2 className="mt-3 text-xl font-black text-white">{announcement.title}</h2>
                      <p className="mt-2 text-sm leading-relaxed text-slate-300">{announcement.message}</p>
                      <p className="mt-2 text-xs text-slate-400">Updated {formatDateTime(announcement.updatedAt)}</p>
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          setEditingId(announcement.id)
                          setForm({
                            title: announcement.title,
                            message: announcement.message,
                            tag: announcement.tag,
                          })
                          setShowForm(true)
                        }}
                        className="rounded-lg bg-slate-800 p-2 text-slate-200 hover:bg-slate-700 transition"
                        aria-label="Edit announcement"
                      >
                        <Pencil size={14} />
                      </button>
                      <button
                        onClick={() => void handleDelete(announcement.id)}
                        className="rounded-lg bg-slate-800 p-2 text-slate-200 hover:bg-red-500/40 transition"
                        aria-label="Delete announcement"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  )
}