'use client'

import { useEffect, useState } from 'react'

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
  leaderboard: boolean
  winners: boolean
  problemStatements: boolean
  problemStatementsDownload: boolean
  finalProblemStatements: boolean
  finalProblemStatementsDownload: boolean
}

export default function ProblemStatementsLive() {
  const [items, setItems] = useState<ProblemStatementEntry[]>([])
  const [finalItems, setFinalItems] = useState<FinalProblemStatementEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isLive, setIsLive] = useState(false)
  const [isDownloadLive, setIsDownloadLive] = useState(false)
  const [isFinalLive, setIsFinalLive] = useState(false)
  const [isFinalDownloadLive, setIsFinalDownloadLive] = useState(false)

  useEffect(() => {
    const fetchStatements = async () => {
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
        setError(fetchError instanceof Error ? fetchError.message : 'Failed to load problem statements')
      } finally {
        setLoading(false)
      }
    }

    void fetchStatements()
  }, [])

  if (loading) {
    return <div className="p-8 text-center text-muted-foreground">Loading problem statements...</div>
  }

  if (error) {
    return <div className="p-8 text-center text-red-400">{error}</div>
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

  const renderStatementCards = (
    statements: Array<ProblemStatementEntry | FinalProblemStatementEntry>,
    sectionType: 'regular' | 'final',
    canDownload: boolean,
    isSectionLive: boolean,
    emptyMessage: string
  ) => {
    if (!isSectionLive) {
      return <div className="p-8 text-center text-muted-foreground">{emptyMessage}</div>
    }

    if (statements.length === 0) {
      return <div className="p-8 text-center text-muted-foreground">No problem statements added yet.</div>
    }

    return (
      <div className="grid gap-4 sm:gap-5">
        {statements.map((item, index) => {
          const hasPdf = Boolean(item.pdfLink && item.pdfLink.trim())
          const domainChips = getDomainChips(item.domain)

          return (
            <article key={item.id} className={`glass-effect rounded-2xl border p-5 sm:p-6 shadow-[0_0_0_1px_rgba(148,163,184,0.12)] ${sectionType === 'final' ? 'border-emerald-500/25' : 'border-border/50'}`}>
              <div className="mb-4 space-y-2">
                <p className={`text-xs uppercase tracking-widest font-bold ${sectionType === 'final' ? 'text-emerald-500 dark:text-emerald-300' : 'text-cyan-600 dark:text-cyan-300'}`}>
                  {sectionType === 'final' ? `Final PS ${String(index + 1).padStart(2, '0')}` : `Statement ${String(index + 1).padStart(2, '0')}`}
                </p>
                <div className="flex flex-wrap gap-2">
                  {(domainChips.length > 0 ? domainChips : [item.domain]).map((domain) => (
                    <span
                      key={`${item.id}-${domain}`}
                      className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold ${sectionType === 'final' ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300' : 'border-cyan-500/30 bg-cyan-500/10 text-cyan-700 dark:text-cyan-300'}`}
                    >
                      {domain}
                    </span>
                  ))}
                </div>
              </div>
              <h3 className="text-xl sm:text-2xl font-black text-foreground mb-2">{item.title}</h3>
              <p className="text-muted-foreground leading-relaxed">{item.description}</p>

              <div className="mt-4 flex flex-wrap gap-2">
                <a
                  href={hasPdf ? getViewLink(item.pdfLink) : '#'}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`inline-flex items-center justify-center rounded-lg px-3 py-2 text-xs font-bold uppercase tracking-wider border transition ${
                    hasPdf
                      ? 'bg-background/80 text-foreground border-border hover:bg-background'
                      : 'bg-background/50 text-muted-foreground border-border/70 pointer-events-none'
                  }`}
                >
                  View Full PS
                </a>
                {canDownload && (
                  <a
                    href={hasPdf ? `/api/problem-statements/download?link=${encodeURIComponent(item.pdfLink ?? '')}` : '#'}
                    className={`inline-flex items-center justify-center rounded-lg px-3 py-2 text-xs font-bold uppercase tracking-wider transition ${
                      hasPdf ? 'btn-modern' : 'bg-primary/30 text-primary-foreground/70 pointer-events-none'
                    }`}
                  >
                    Download PS
                  </a>
                )}
              </div>
            </article>
          )
        })}
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div className="space-y-3">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <h2 className="text-xl sm:text-2xl font-black text-emerald-500 dark:text-emerald-300">Final Problem Statements</h2>
        </div>
        {renderStatementCards(finalItems, 'final', isFinalDownloadLive, isFinalLive, 'Final problem statements will be live soon.')}
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <h2 className="text-xl sm:text-2xl font-black text-cyan-600 dark:text-cyan-300">Problem Statements</h2>
        </div>
        {renderStatementCards(items, 'regular', isDownloadLive, isLive, 'Problem statements will be live soon.')}
      </div>
    </div>
  )
}
