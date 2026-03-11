'use client'

import { useEffect, useState } from 'react'

interface ProblemStatementEntry {
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
  leaderboard: boolean
  winners: boolean
  problemStatements: boolean
  problemStatementsDownload: boolean
}

export default function ProblemStatementsLive() {
  const [items, setItems] = useState<ProblemStatementEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isLive, setIsLive] = useState(false)
  const [isDownloadLive, setIsDownloadLive] = useState(false)

  useEffect(() => {
    const fetchStatements = async () => {
      setLoading(true)
      setError(null)

      try {
        const [response, publishResponse] = await Promise.all([
          fetch('/api/problem-statements', { cache: 'no-store' }),
          fetch('/api/publish-state', { cache: 'no-store' }),
        ])
        const json = (await response.json()) as ApiResponse<ProblemStatementEntry[]>
        const publishJson = (await publishResponse.json()) as ApiResponse<PublishState>

        if (!response.ok || !json.success) {
          throw new Error(json.error || 'Failed to fetch problem statements')
        }

        setItems(json.data ?? [])
        if (publishJson.success && publishJson.data) {
          setIsLive(Boolean(publishJson.data.problemStatements))
          setIsDownloadLive(Boolean(publishJson.data.problemStatementsDownload))
        }
      } catch (fetchError) {
        setError(fetchError instanceof Error ? fetchError.message : 'Failed to load problem statements')
      } finally {
        setLoading(false)
      }
    }

    void fetchStatements()
  }, [])

  if (loading) {
    return <div className="p-8 text-center text-slate-500 dark:text-slate-400">Loading problem statements...</div>
  }

  if (error) {
    return <div className="p-8 text-center text-red-400">{error}</div>
  }

  if (items.length === 0) {
    return <div className="p-8 text-center text-slate-500 dark:text-slate-400">Problem statements will be published soon.</div>
  }

  if (!isLive) {
    return <div className="p-8 text-center text-slate-500 dark:text-slate-400">Problem statements are not live yet.</div>
  }

  const getDriveFileId = (link?: string) => {
    if (!link || typeof link !== 'string') return null
    const fromFilePath = link.match(/\/d\/([^/]+)/)?.[1]
    if (fromFilePath) return fromFilePath
    const fromQuery = link.match(/[?&]id=([^&]+)/)?.[1]
    if (fromQuery) return fromQuery
    return null
  }

  const getViewLink = (link?: string) => {
    if (!link) return '#'
    const id = getDriveFileId(link)
    return id ? `https://drive.google.com/file/d/${id}/view` : link
  }

  const getDomainChips = (domain?: string) => {
    if (!domain) return []

    return domain
      .split(',')
      .map((item) => item.trim())
      .filter((item) => item.length > 0)
  }

  return (
    <div className="grid gap-4 sm:gap-5">
      {items.map((item, index) => (
        <article key={item.id} className="glass-effect rounded-2xl border border-border/50 p-5 sm:p-6 shadow-[0_0_0_1px_rgba(148,163,184,0.12)]">
          {(() => {
            const hasPdf = Boolean(item.pdfLink && item.pdfLink.trim())
            const domainChips = getDomainChips(item.domain)

            return (
              <>
          <div className="mb-4 space-y-2">
            <p className="text-xs uppercase tracking-widest text-orange-400 font-bold">Statement {String(index + 1).padStart(2, '0')}</p>
            <div className="flex flex-wrap gap-2">
              {(domainChips.length > 0 ? domainChips : [item.domain]).map((domain) => (
                <span
                  key={`${item.id}-${domain}`}
                  className="inline-flex items-center rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-700 dark:text-emerald-300"
                >
                  {domain}
                </span>
              ))}
            </div>
          </div>
          <h3 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white mb-2">{item.title}</h3>
          <p className="text-slate-600 dark:text-slate-300 leading-relaxed">{item.description}</p>

          <div className="mt-4 flex flex-wrap gap-2">
            <a
              href={hasPdf ? getViewLink(item.pdfLink) : '#'}
              target="_blank"
              rel="noopener noreferrer"
              className={`inline-flex items-center justify-center rounded-lg px-3 py-2 text-xs font-bold uppercase tracking-wider border transition ${
                hasPdf
                  ? 'bg-slate-100 text-slate-800 border-slate-300 hover:bg-slate-200 dark:bg-teal-800 dark:text-slate-100 dark:border-teal-700 dark:hover:bg-teal-700'
                  : 'bg-slate-100/70 text-slate-400 border-slate-300/70 pointer-events-none dark:bg-teal-800/50 dark:text-slate-500 dark:border-teal-700/50'
              }`}
            >
              View PS
            </a>
            {isDownloadLive && (
              <a
                href={
                  hasPdf
                    ? `/api/problem-statements/download?link=${encodeURIComponent(item.pdfLink ?? '')}`
                    : '#'
                }
                download
                className={`inline-flex items-center justify-center rounded-lg px-3 py-2 text-xs font-bold uppercase tracking-wider transition ${
                  hasPdf
                    ? 'bg-orange-500 text-white hover:bg-orange-400'
                    : 'bg-orange-500/40 text-orange-200/70 pointer-events-none'
                }`}
              >
                Download PS
              </a>
            )}
          </div>
              </>
            )
          })()}
        </article>
      ))}
    </div>
  )
}
