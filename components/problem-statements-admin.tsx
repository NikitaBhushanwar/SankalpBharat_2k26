'use client'

import { FormEvent, useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Pencil, Plus, Trash2, LogOut } from 'lucide-react'
import { useAuth } from '@/context/auth-context'

interface ProblemStatementEntry {
  id: string
  title: string
  domain: string
  description: string
  pdfLink?: string
}

interface FinalProblemStatementEntry {
  id: string
  title: string
  domain: string
  description: string
  pdfLink?: string
}

interface ApiResponse<T> {
  success: boolean
  data: T
  error?: string
}

interface PublishState {
  problemStatements: boolean
  problemStatementsDownload: boolean
  finalProblemStatements: boolean
  finalProblemStatementsDownload: boolean
}

interface ProblemStatementsAdminProps {
  embedded?: boolean
}

const emptyForm = {
  title: '',
  domain: '',
  description: '',
  pdfLink: '',
}

export default function ProblemStatementsAdmin({ embedded = false }: ProblemStatementsAdminProps) {
  const router = useRouter()
  const { isAuthenticated, logout } = useAuth()
  const formsTopRef = useRef<HTMLDivElement | null>(null)

  const [items, setItems] = useState<ProblemStatementEntry[]>([])
  const [finalItems, setFinalItems] = useState<FinalProblemStatementEntry[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [showFinalForm, setShowFinalForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editingFinalId, setEditingFinalId] = useState<string | null>(null)
  const [form, setForm] = useState(emptyForm)
  const [finalForm, setFinalForm] = useState(emptyForm)
  const [isLive, setIsLive] = useState(false)
  const [isDownloadLive, setIsDownloadLive] = useState(false)
  const [isFinalLive, setIsFinalLive] = useState(false)
  const [isFinalDownloadLive, setIsFinalDownloadLive] = useState(false)

  useEffect(() => {
    if (!isAuthenticated) {
      if (!embedded) {
        router.replace('/admin/login')
      }
      return
    }

    void loadData()
  }, [embedded, isAuthenticated, router])

  useEffect(() => {
    if (showForm || showFinalForm) {
      formsTopRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }, [showFinalForm, showForm])

  const loadData = async () => {
    setLoading(true)
    setError(null)

    try {
      const [response, finalResponse, publishResponse] = await Promise.all([
        fetch('/api/problem-statements', { cache: 'no-store' }),
        fetch('/api/final-problem-statements', { cache: 'no-store' }),
        fetch('/api/publish-state', { cache: 'no-store' }),
      ])

      const json = (await response.json()) as ApiResponse<ProblemStatementEntry[]>
      const finalJson = (await finalResponse.json()) as ApiResponse<FinalProblemStatementEntry[]>
      const publishJson = (await publishResponse.json()) as ApiResponse<PublishState>

      if (!response.ok || !json.success) {
        throw new Error(json.error || 'Failed to fetch problem statements')
      }

      if (!finalResponse.ok || !finalJson.success) {
        throw new Error(finalJson.error || 'Failed to fetch final problem statements')
      }

      setItems(json.data ?? [])
      setFinalItems(finalJson.data ?? [])

      if (publishJson.success && publishJson.data) {
        setIsLive(Boolean(publishJson.data.problemStatements))
        setIsDownloadLive(Boolean(publishJson.data.problemStatementsDownload))
        setIsFinalLive(Boolean(publishJson.data.finalProblemStatements))
        setIsFinalDownloadLive(Boolean(publishJson.data.finalProblemStatementsDownload))
      }
    } catch (fetchError) {
      setError(fetchError instanceof Error ? fetchError.message : 'Failed to load data')
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    setEditingId(null)
    setForm(emptyForm)
    setShowForm(false)
  }

  const resetFinalForm = () => {
    setEditingFinalId(null)
    setFinalForm(emptyForm)
    setShowFinalForm(false)
  }

  const onSave = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const payload = {
        title: form.title.trim(),
        domain: form.domain.trim(),
        description: form.description.trim(),
        pdfLink: form.pdfLink.trim(),
      }

      const endpoint = editingId ? `/api/problem-statements/${editingId}` : '/api/problem-statements'
      const method = editingId ? 'PUT' : 'POST'

      const response = await fetch(endpoint, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      const json = (await response.json()) as ApiResponse<ProblemStatementEntry>
      if (!response.ok || !json.success) {
        throw new Error(json.error || 'Failed to save problem statement')
      }

      await loadData()
      resetForm()
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : 'Failed to save problem statement')
      setLoading(false)
    }
  }

  const onDelete = async (id: string) => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/problem-statements/${id}`, { method: 'DELETE' })
      const json = (await response.json()) as ApiResponse<ProblemStatementEntry>

      if (!response.ok || !json.success) {
        throw new Error(json.error || 'Failed to delete problem statement')
      }

      await loadData()
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : 'Failed to delete problem statement')
      setLoading(false)
    }
  }

  const onSaveFinal = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const payload = {
        title: finalForm.title.trim(),
        domain: finalForm.domain.trim(),
        description: finalForm.description.trim(),
        pdfLink: finalForm.pdfLink.trim(),
      }

      const endpoint = editingFinalId ? `/api/final-problem-statements/${editingFinalId}` : '/api/final-problem-statements'
      const method = editingFinalId ? 'PUT' : 'POST'

      const response = await fetch(endpoint, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      const json = (await response.json()) as ApiResponse<FinalProblemStatementEntry>
      if (!response.ok || !json.success) {
        throw new Error(json.error || 'Failed to save final problem statement')
      }

      await loadData()
      resetFinalForm()
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : 'Failed to save final problem statement')
      setLoading(false)
    }
  }

  const onDeleteFinal = async (id: string) => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/final-problem-statements/${id}`, { method: 'DELETE' })
      const json = (await response.json()) as ApiResponse<FinalProblemStatementEntry>

      if (!response.ok || !json.success) {
        throw new Error(json.error || 'Failed to delete final problem statement')
      }

      await loadData()
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : 'Failed to delete final problem statement')
      setLoading(false)
    }
  }

  const togglePublish = async (section: keyof PublishState) => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/publish-state', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ section, value: !({
          problemStatements: isLive,
          problemStatementsDownload: isDownloadLive,
          finalProblemStatements: isFinalLive,
          finalProblemStatementsDownload: isFinalDownloadLive,
        } as PublishState)[section] }),
      })

      const json = (await response.json()) as ApiResponse<PublishState>

      if (!response.ok || !json.success || !json.data) {
        throw new Error(json.error || 'Failed to update publish state')
      }

      setIsLive(Boolean(json.data.problemStatements))
      setIsDownloadLive(Boolean(json.data.problemStatementsDownload))
      setIsFinalLive(Boolean(json.data.finalProblemStatements))
      setIsFinalDownloadLive(Boolean(json.data.finalProblemStatementsDownload))
    } catch (publishError) {
      setError(publishError instanceof Error ? publishError.message : 'Failed to update publish state')
    } finally {
      setLoading(false)
    }
  }

  if (!isAuthenticated) {
    return null
  }

  return (
    <section className={embedded ? 'w-full' : 'min-h-screen px-4 sm:px-6 lg:px-8 pt-28 pb-10'}>
      <div className={embedded ? 'rounded-3xl border border-cyan-500/20 bg-slate-950/80 backdrop-blur-xl shadow-2xl p-4 sm:p-6 lg:p-8' : 'max-w-6xl mx-auto rounded-3xl border border-cyan-500/20 bg-slate-950/80 backdrop-blur-xl shadow-2xl p-4 sm:p-6 lg:p-8'}>
        {!embedded && (
          <>
            <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
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

            <div className="mb-6">
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white">Problem Statements</h1>
              <p className="text-sm text-slate-400 mt-1">Upload and manage official and final problem statements for public display.</p>
            </div>
          </>
        )}

        {error && <div className="mb-5 rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-300">{error}</div>}

        <div className="flex flex-wrap justify-end gap-2 mb-4">
          <button
            onClick={() => void togglePublish('problemStatements')}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-black transition ${
              isLive ? 'bg-blue-500 text-slate-950' : 'bg-slate-700 text-slate-200'
            }`}
          >
            {isLive ? 'Unpublish PS' : 'Go Live PS'}
          </button>
          <button
            onClick={() => void togglePublish('problemStatementsDownload')}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-black transition ${
              isDownloadLive ? 'bg-sky-500 text-slate-950' : 'bg-slate-700 text-slate-200'
            }`}
          >
            {isDownloadLive ? 'Hide Download PS' : 'Show Download PS'}
          </button>
          <button
            onClick={() => void togglePublish('finalProblemStatements')}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-black transition ${
              isFinalLive ? 'bg-emerald-500 text-slate-950' : 'bg-slate-700 text-slate-200'
            }`}
          >
            {isFinalLive ? 'Unpublish Final PS' : 'Go Live Final PS'}
          </button>
          <button
            onClick={() => {
              setShowForm((prev) => !prev)
              if (editingId) {
                setEditingId(null)
                setForm(emptyForm)
              }
            }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-500 text-slate-950 text-sm font-black hover:brightness-110 transition"
          >
            <Plus size={16} /> {showForm ? 'Close PS Form' : 'Add PS'}
          </button>
          <button
            onClick={() => {
              setShowFinalForm((prev) => !prev)
              if (editingFinalId) {
                setEditingFinalId(null)
                setFinalForm(emptyForm)
              }
            }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-500 text-slate-950 text-sm font-black hover:brightness-110 transition"
          >
            <Plus size={16} /> {showFinalForm ? 'Close Final Form' : 'Add Final PS'}
          </button>
        </div>

        <div ref={formsTopRef} />

        {showFinalForm && (
          <form onSubmit={onSaveFinal} className="grid grid-cols-1 gap-3 rounded-2xl border border-emerald-500/20 bg-slate-900/80 p-4 mb-5">
            <input value={finalForm.title} onChange={(e) => setFinalForm((prev) => ({ ...prev, title: e.target.value }))} placeholder="Industry / real-life problem title" className="rounded-xl bg-slate-800 border border-slate-700 px-3 py-2 text-sm text-white" required />
            <input value={finalForm.domain} onChange={(e) => setFinalForm((prev) => ({ ...prev, domain: e.target.value }))} placeholder="Industry domain" className="rounded-xl bg-slate-800 border border-slate-700 px-3 py-2 text-sm text-white" required />
            <textarea value={finalForm.description} onChange={(e) => setFinalForm((prev) => ({ ...prev, description: e.target.value }))} placeholder="Final problem statement description" rows={4} className="rounded-xl bg-slate-800 border border-slate-700 px-3 py-2 text-sm text-white" required />
            <input value={finalForm.pdfLink} onChange={(e) => setFinalForm((prev) => ({ ...prev, pdfLink: e.target.value }))} placeholder="Google Drive PDF link" className="rounded-xl bg-slate-800 border border-slate-700 px-3 py-2 text-sm text-white" required />
            <div className="flex gap-2 justify-end">
              <button type="button" onClick={resetFinalForm} className="px-3 py-2 rounded-lg text-xs font-bold uppercase tracking-wider bg-slate-700 text-slate-200">Cancel</button>
              <button disabled={loading} type="submit" className="px-3 py-2 rounded-lg text-xs font-bold uppercase tracking-wider bg-emerald-500 text-slate-950 disabled:opacity-60">{editingFinalId ? 'Update Final Statement' : 'Save Final Statement'}</button>
            </div>
          </form>
        )}

        {showForm && (
          <form onSubmit={onSave} className="grid grid-cols-1 gap-3 rounded-2xl border border-blue-500/20 bg-slate-900/80 p-4 mb-5">
            <input value={form.title} onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value }))} placeholder="Problem title" className="rounded-xl bg-slate-800 border border-slate-700 px-3 py-2 text-sm text-white" required />
            <input value={form.domain} onChange={(e) => setForm((prev) => ({ ...prev, domain: e.target.value }))} placeholder="Domain (e.g. Environment, AI, Healthcare)" className="rounded-xl bg-slate-800 border border-slate-700 px-3 py-2 text-sm text-white" required />
            <textarea value={form.description} onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))} placeholder="Detailed problem statement description" rows={4} className="rounded-xl bg-slate-800 border border-slate-700 px-3 py-2 text-sm text-white" required />
            <input value={form.pdfLink} onChange={(e) => setForm((prev) => ({ ...prev, pdfLink: e.target.value }))} placeholder="Google Drive PDF link" className="rounded-xl bg-slate-800 border border-slate-700 px-3 py-2 text-sm text-white" required />
            <div className="flex gap-2 justify-end">
              <button type="button" onClick={resetForm} className="px-3 py-2 rounded-lg text-xs font-bold uppercase tracking-wider bg-slate-700 text-slate-200">Cancel</button>
              <button disabled={loading} type="submit" className="px-3 py-2 rounded-lg text-xs font-bold uppercase tracking-wider bg-blue-500 text-slate-950 disabled:opacity-60">{editingId ? 'Update Statement' : 'Save Statement'}</button>
            </div>
          </form>
        )}

        <div className="rounded-2xl border border-emerald-500/20 overflow-hidden mb-6">
          <div className="px-4 py-3 bg-slate-900/80 border-b border-emerald-500/20">
            <h2 className="text-sm font-black uppercase tracking-wider text-emerald-300">Final Problem Statements</h2>
          </div>
          {finalItems.length === 0 ? (
            <div className="p-10 text-center text-slate-400 font-semibold">No final problem statements uploaded yet.</div>
          ) : (
            <div className="space-y-3 p-3 sm:p-4">
              {finalItems.map((item, index) => (
                <div key={item.id} className="rounded-xl border border-emerald-500/20 bg-slate-900/60 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-xs text-emerald-300 font-bold uppercase tracking-wider mb-1">Final Statement {String(index + 1).padStart(2, '0')}</p>
                      <h3 className="text-lg font-bold text-white">{item.title}</h3>
                      <p className="text-xs text-cyan-300 mt-1">Domain: {item.domain}</p>
                      <p className="text-xs text-slate-400 mt-1 break-all">PDF Link: {item.pdfLink || 'Not added yet'}</p>
                      <p className="text-sm text-slate-300 mt-2 leading-relaxed">{item.description}</p>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => { setEditingFinalId(item.id); setFinalForm({ title: item.title, domain: item.domain, description: item.description, pdfLink: item.pdfLink ?? '' }); setShowFinalForm(true) }} className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700"><Pencil size={14} /></button>
                      <button onClick={() => void onDeleteFinal(item.id)} className="p-2 rounded-lg bg-slate-800 hover:bg-red-500/40"><Trash2 size={14} /></button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="rounded-2xl border border-blue-500/20 overflow-hidden">
          <div className="px-4 py-3 bg-slate-900/80 border-b border-blue-500/20">
            <h2 className="text-sm font-black uppercase tracking-wider text-blue-300">Problem Statements</h2>
          </div>
          {items.length === 0 ? (
            <div className="p-10 text-center text-slate-400 font-semibold">No problem statements uploaded yet.</div>
          ) : (
            <div className="space-y-3 p-3 sm:p-4">
              {items.map((item, index) => (
                <div key={item.id} className="rounded-xl border border-blue-500/20 bg-slate-900/60 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-xs text-blue-300 font-bold uppercase tracking-wider mb-1">Statement {String(index + 1).padStart(2, '0')}</p>
                      <h3 className="text-lg font-bold text-white">{item.title}</h3>
                      <p className="text-xs text-cyan-300 mt-1">Domain: {item.domain}</p>
                      <p className="text-xs text-slate-400 mt-1 break-all">PDF Link: {item.pdfLink || 'Not added yet'}</p>
                      <p className="text-sm text-slate-300 mt-2 leading-relaxed">{item.description}</p>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => { setEditingId(item.id); setForm({ title: item.title, domain: item.domain, description: item.description, pdfLink: item.pdfLink ?? '' }); setShowForm(true) }} className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700"><Pencil size={14} /></button>
                      <button onClick={() => void onDelete(item.id)} className="p-2 rounded-lg bg-slate-800 hover:bg-red-500/40"><Trash2 size={14} /></button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {loading && <p className="mt-4 text-xs text-slate-400">Processing...</p>}
      </div>
    </section>
  )
}
