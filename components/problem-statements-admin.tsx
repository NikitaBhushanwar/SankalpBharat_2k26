'use client'

import { FormEvent, useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { AlertTriangle, ArrowLeft, CheckCircle2, LogOut, Pencil, Plus, Trash2 } from 'lucide-react'
import { createPortal } from 'react-dom'
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
  problemStatementId: string
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

interface FinalRoundProblemStatementAllocation {
  id: string
  problemStatementId: string
  title: string
  maxSlots: number
  filledSlots: number
  isFull: boolean
}

interface FinalRoundTeamAllocation {
  id: string
  teamId: string
  teamName: string
  selectedProblemStatementId: string | null
  selectedAt: string | null
  selectedProblemStatement: {
    id: string
    problemStatementId: string
    title: string
  } | null
}

interface FinalRoundAdminOverview {
  problemStatements: FinalRoundProblemStatementAllocation[]
  teams: FinalRoundTeamAllocation[]
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

const emptyFinalForm = {
  problemStatementId: '',
  title: '',
  domain: '',
  description: '',
  pdfLink: '',
}

const emptyTeamCredentialForm = {
  teamId: '',
  teamName: '',
  password: '',
}

const ADMIN_POLL_INTERVAL_MS = 3000

export default function ProblemStatementsAdmin({ embedded = false }: ProblemStatementsAdminProps) {
  const router = useRouter()
  const { isAuthenticated, logout, user } = useAuth()
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
  const [finalForm, setFinalForm] = useState(emptyFinalForm)
  const [teamCredentialForm, setTeamCredentialForm] = useState(emptyTeamCredentialForm)
  const [isLive, setIsLive] = useState(false)
  const [isDownloadLive, setIsDownloadLive] = useState(false)
  const [isFinalLive, setIsFinalLive] = useState(false)
  const [isFinalDownloadLive, setIsFinalDownloadLive] = useState(false)
  const [finalRoundOverview, setFinalRoundOverview] = useState<FinalRoundAdminOverview>({
    problemStatements: [],
    teams: [],
  })
  const [resetTeamIdToConfirm, setResetTeamIdToConfirm] = useState<string | null>(null)
  const [teamCredentialNotice, setTeamCredentialNotice] = useState<string | null>(null)
  const [teamCredentialSaving, setTeamCredentialSaving] = useState(false)
  const [notice, setNotice] = useState<string | null>(null)
  const canManageFinalRoundTeamCredentials = Boolean(user?.isSuperAdmin)

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

  const loadFinalRoundOverview = async (silenceErrors = false) => {
    try {
      const response = await fetch('/api/final-round/admin/overview', { cache: 'no-store' })
      const json = (await response.json()) as ApiResponse<FinalRoundAdminOverview>

      if (response.status === 401 && !embedded) {
        router.replace('/admin/login')
        return
      }

      if (!response.ok || !json.success) {
        throw new Error(json.error || 'Failed to fetch final round allocation overview')
      }

      setFinalRoundOverview(json.data ?? { problemStatements: [], teams: [] })
    } catch (overviewError) {
      if (!silenceErrors) {
        setError(overviewError instanceof Error ? overviewError.message : 'Failed to fetch final round allocation overview')
      }
    }
  }

  useEffect(() => {
    if (!isAuthenticated) {
      return
    }

    const poll = () => {
      void loadFinalRoundOverview(true)
    }

    poll()
    const interval = window.setInterval(poll, ADMIN_POLL_INTERVAL_MS)

    return () => {
      window.clearInterval(interval)
    }
  }, [embedded, isAuthenticated, router])

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
      await loadFinalRoundOverview(true)

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
    setFinalForm(emptyFinalForm)
    setShowFinalForm(false)
  }

  const resetTeamCredentialForm = () => {
    setTeamCredentialForm(emptyTeamCredentialForm)
    setTeamCredentialNotice(null)
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
        problemStatementId: finalForm.problemStatementId.trim(),
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

  const onResetTeamSelection = async (teamId: string) => {
    setLoading(true)
    setError(null)
    setNotice(null)

    try {
      const response = await fetch('/api/final-round/admin/reset-selection', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ teamId }),
      })

      const json = (await response.json()) as ApiResponse<FinalRoundAdminOverview>

      if (!response.ok || !json.success || !json.data) {
        throw new Error(json.error || 'Failed to reset team selection')
      }

      setFinalRoundOverview(json.data)
      setNotice(`Selection reset for ${teamId}. Team can choose again.`)
    } catch (resetError) {
      setError(resetError instanceof Error ? resetError.message : 'Failed to reset team selection')
    } finally {
      setLoading(false)
    }
  }

  const onSaveTeamCredentials = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setTeamCredentialSaving(true)
    setError(null)
    setTeamCredentialNotice(null)

    const teamId = teamCredentialForm.teamId.trim()
    const teamName = teamCredentialForm.teamName.trim() || teamId
    const password = teamCredentialForm.password

    if (!teamId || !password) {
      setError('Team ID and password are required.')
      setTeamCredentialSaving(false)
      return
    }

    try {
      const response = await fetch('/api/final-round/admin/teams', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          teamId,
          teamName,
          password,
        }),
      })

      const json = (await response.json()) as ApiResponse<FinalRoundAdminOverview>

      if (!response.ok || !json.success || !json.data) {
        throw new Error(json.error || 'Failed to save final round team credentials')
      }

      setFinalRoundOverview({
        ...json.data,
        teams: [
          {
            id: `pending-${teamId}`,
            teamId,
            teamName,
            selectedProblemStatementId: null,
            selectedAt: null,
            selectedProblemStatement: null,
          },
          ...json.data.teams.filter((team) => team.teamId !== teamId),
        ],
      })
      setTeamCredentialNotice(`Saved credentials for ${teamId}.`)
      resetTeamCredentialForm()
      await loadFinalRoundOverview(true)
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : 'Failed to save final round team credentials')
    } finally {
      setTeamCredentialSaving(false)
    }
  }

  const onDeleteTeamCredentials = async (teamId: string) => {
    setLoading(true)
    setError(null)
    setTeamCredentialNotice(null)

    setFinalRoundOverview((previous) => ({
      ...previous,
      teams: previous.teams.filter((team) => team.teamId !== teamId),
    }))

    try {
      const response = await fetch(`/api/final-round/admin/teams?teamId=${encodeURIComponent(teamId)}`, {
        method: 'DELETE',
      })

      const json = (await response.json()) as ApiResponse<FinalRoundAdminOverview>

      if (!response.ok || !json.success || !json.data) {
        throw new Error(json.error || 'Failed to remove final round team credentials')
      }

      setFinalRoundOverview(json.data)
      setTeamCredentialNotice(`Removed credentials for ${teamId}.`)
      await loadFinalRoundOverview(true)
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : 'Failed to remove final round team credentials')
    } finally {
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
        {notice && (
          <div className="mb-5 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3 text-sm text-emerald-200 flex items-center gap-2">
            <CheckCircle2 size={16} />
            <span>{notice}</span>
          </div>
        )}
        {teamCredentialNotice && (
          <div className="mb-5 rounded-xl border border-cyan-500/30 bg-cyan-500/10 p-3 text-sm text-cyan-200 flex items-center gap-2">
            <CheckCircle2 size={16} />
            <span>{teamCredentialNotice}</span>
          </div>
        )}

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
                  setFinalForm(emptyFinalForm)
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
            <input value={finalForm.problemStatementId} onChange={(e) => setFinalForm((prev) => ({ ...prev, problemStatementId: e.target.value }))} placeholder="Problem Statement ID (e.g. PS-F01)" className="rounded-xl bg-slate-800 border border-slate-700 px-3 py-2 text-sm text-white" required />
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
                      <p className="text-xs text-emerald-200 font-semibold">PS ID: {item.problemStatementId || 'Not set'}</p>
                      <h3 className="text-lg font-bold text-white">{item.title}</h3>
                      <p className="text-xs text-cyan-300 mt-1">Domain: {item.domain}</p>
                      <p className="text-xs text-slate-400 mt-1 break-all">PDF Link: {item.pdfLink || 'Not added yet'}</p>
                      <p className="text-sm text-slate-300 mt-2 leading-relaxed">{item.description}</p>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => { setEditingFinalId(item.id); setFinalForm({ problemStatementId: item.problemStatementId ?? '', title: item.title, domain: item.domain, description: item.description, pdfLink: item.pdfLink ?? '' }); setShowFinalForm(true) }} className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700"><Pencil size={14} /></button>
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

        <div className="mt-6 rounded-2xl border border-fuchsia-500/20 overflow-hidden">
          <div className="px-4 py-3 bg-slate-900/80 border-b border-fuchsia-500/20">
            <h2 className="text-sm font-black uppercase tracking-wider text-fuchsia-300">Final Round Allocation Control</h2>
          </div>

          <div className="p-4 sm:p-5 space-y-5">
            {canManageFinalRoundTeamCredentials && (
              <div className="rounded-2xl border border-cyan-500/20 bg-slate-900/60 p-4 sm:p-5 space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="text-xs uppercase tracking-wider text-slate-400 font-semibold">Final Round Login</p>
                    <h3 className="text-lg font-black text-white">Team Credentials</h3>
                  </div>
                  <button
                    type="button"
                    onClick={resetTeamCredentialForm}
                    className="rounded-xl bg-slate-800 px-3 py-2 text-xs font-bold uppercase tracking-wider text-slate-200"
                  >
                    Clear
                  </button>
                </div>

                <form onSubmit={onSaveTeamCredentials} className="grid gap-3 sm:grid-cols-3">
                  <input
                    value={teamCredentialForm.teamId}
                    onChange={(event) => setTeamCredentialForm((prev) => ({ ...prev, teamId: event.target.value }))}
                    placeholder="Team ID"
                    className="rounded-xl bg-slate-800 border border-slate-700 px-3 py-2 text-sm text-white"
                    required
                  />
                  <input
                    value={teamCredentialForm.teamName}
                    onChange={(event) => setTeamCredentialForm((prev) => ({ ...prev, teamName: event.target.value }))}
                    placeholder="Team Name"
                    className="rounded-xl bg-slate-800 border border-slate-700 px-3 py-2 text-sm text-white"
                  />
                  <input
                    type="password"
                    value={teamCredentialForm.password}
                    onChange={(event) => setTeamCredentialForm((prev) => ({ ...prev, password: event.target.value }))}
                    placeholder="Password"
                    className="rounded-xl bg-slate-800 border border-slate-700 px-3 py-2 text-sm text-white"
                    required
                  />
                  <div className="sm:col-span-3 flex flex-wrap gap-2 justify-end">
                    <button
                      type="submit"
                      disabled={teamCredentialSaving}
                      className="rounded-xl bg-cyan-500 px-4 py-2 text-xs font-black uppercase tracking-wider text-slate-950 disabled:opacity-60"
                    >
                      {teamCredentialSaving ? 'Saving...' : 'Save Team Login'}
                    </button>
                  </div>
                </form>

                <div className="rounded-xl border border-white/10 bg-slate-950/40 p-3 text-xs text-slate-300">
                  Adding a team here creates or updates the final-round login. If Team Name is left empty, it will default to the Team ID.
                </div>

                {finalRoundOverview.teams.length > 0 && (
                  <div className="overflow-x-auto">
                    <table className="min-w-full text-sm">
                      <thead>
                        <tr className="text-left text-slate-300 border-b border-slate-700">
                          <th className="py-2 pr-3">Team ID</th>
                          <th className="py-2 pr-3">Team Name</th>
                          <th className="py-2 pr-0">Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {finalRoundOverview.teams.map((team) => (
                          <tr key={team.id} className="border-b border-slate-800/70 text-slate-200">
                            <td className="py-2 pr-3 font-semibold">{team.teamId}</td>
                            <td className="py-2 pr-3">{team.teamName}</td>
                            <td className="py-2 pr-0">
                              <div className="flex gap-2">
                                <button
                                  type="button"
                                  onClick={() => setTeamCredentialForm({ teamId: team.teamId, teamName: team.teamName, password: '' })}
                                  className="px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider bg-cyan-500/20 text-cyan-200 hover:bg-cyan-500/30"
                                >
                                  Edit
                                </button>
                                <button
                                  type="button"
                                  disabled={loading}
                                  onClick={() => {
                                    void onDeleteTeamCredentials(team.teamId)
                                  }}
                                  className="px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider bg-rose-500/20 text-rose-200 hover:bg-rose-500/30 disabled:opacity-40 disabled:cursor-not-allowed"
                                >
                                  Remove
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {!canManageFinalRoundTeamCredentials && (
              <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-4 text-sm text-slate-300">
                Final round team login management is visible only to super admins.
              </div>
            )}

            <div>
              <p className="text-xs uppercase tracking-wider text-slate-400 font-semibold mb-2">Slots Filled by Problem Statement</p>
              {finalRoundOverview.problemStatements.length === 0 ? (
                <p className="text-sm text-slate-400">No final problem statements configured yet.</p>
              ) : (
                <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                  {finalRoundOverview.problemStatements.map((statement) => (
                    <div key={statement.id} className="rounded-xl border border-fuchsia-500/20 bg-slate-900/60 p-3">
                      <p className="text-xs text-fuchsia-300 font-bold uppercase tracking-wider">{statement.problemStatementId || 'Final PS'}</p>
                      <p className="text-sm font-semibold text-white mt-1 line-clamp-2">{statement.title}</p>
                      <p className="text-xs text-slate-300 mt-2">{statement.filledSlots}/{statement.maxSlots} filled</p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div>
              <p className="text-xs uppercase tracking-wider text-slate-400 font-semibold mb-2">Team Selections</p>
              {finalRoundOverview.teams.length === 0 ? (
                <p className="text-sm text-slate-400">No final round teams found.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full text-sm">
                    <thead>
                      <tr className="text-left text-slate-300 border-b border-slate-700">
                        <th className="py-2 pr-3">Team ID</th>
                        <th className="py-2 pr-3">Team Name</th>
                        <th className="py-2 pr-3">Selected PS</th>
                        <th className="py-2 pr-3">Selected At</th>
                        <th className="py-2 pr-0">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {finalRoundOverview.teams.map((team) => (
                        <tr key={team.id} className="border-b border-slate-800/70 text-slate-200">
                          <td className="py-2 pr-3 font-semibold">{team.teamId}</td>
                          <td className="py-2 pr-3">{team.teamName}</td>
                          <td className="py-2 pr-3">
                            {team.selectedProblemStatement
                              ? `${team.selectedProblemStatement.problemStatementId || 'PS'} - ${team.selectedProblemStatement.title}`
                              : 'Not selected'}
                          </td>
                          <td className="py-2 pr-3 text-xs text-slate-400">
                            {team.selectedAt ? new Date(team.selectedAt).toLocaleString() : '-'}
                          </td>
                          <td className="py-2 pr-0">
                            <button
                              type="button"
                              disabled={!team.selectedProblemStatementId || loading}
                              onClick={() => setResetTeamIdToConfirm(team.teamId)}
                              className="px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider bg-amber-500/20 text-amber-200 hover:bg-amber-500/30 disabled:opacity-40 disabled:cursor-not-allowed"
                            >
                              Reset Selection
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>

        {loading && <p className="mt-4 text-xs text-slate-400">Processing...</p>}
      </div>

      {resetTeamIdToConfirm && typeof window !== 'undefined' && createPortal(
        <div className="fixed inset-0 z-[90] flex items-center justify-center bg-slate-950/75 backdrop-blur-sm px-4">
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="admin-reset-selection-title"
            className="w-full max-w-md rounded-3xl border border-amber-400/30 bg-slate-900 shadow-[0_28px_80px_rgba(2,6,23,0.65)]"
          >
            <div className="p-5 sm:p-6 space-y-4">
              <div className="inline-flex items-center gap-2 rounded-full border border-amber-400/30 bg-amber-500/15 px-3 py-1 text-xs font-bold uppercase tracking-[0.2em] text-amber-200">
                <AlertTriangle size={14} /> Confirm Reset
              </div>

              <div className="space-y-2">
                <h3 id="admin-reset-selection-title" className="text-xl font-black text-white">
                  Reset Team Selection?
                </h3>
                <p className="text-sm text-slate-300 leading-relaxed">
                  This will unlock
                  {' '}
                  <span className="font-semibold text-amber-200">{resetTeamIdToConfirm}</span>
                  {' '}
                  and allow the team to choose a problem statement again.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-2 sm:justify-end">
                <button
                  type="button"
                  onClick={() => setResetTeamIdToConfirm(null)}
                  className="inline-flex items-center justify-center rounded-xl border border-slate-600 bg-slate-800 px-4 py-2 text-xs font-black uppercase tracking-[0.18em] text-slate-200 transition hover:bg-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const teamId = resetTeamIdToConfirm
                    setResetTeamIdToConfirm(null)

                    if (teamId) {
                      void onResetTeamSelection(teamId)
                    }
                  }}
                  className="inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-amber-400 to-rose-500 px-4 py-2 text-xs font-black uppercase tracking-[0.18em] text-slate-950 transition hover:brightness-110"
                >
                  Yes, Reset
                </button>
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}
    </section>
  )
}
