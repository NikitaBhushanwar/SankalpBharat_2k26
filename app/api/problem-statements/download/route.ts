import { NextRequest, NextResponse } from 'next/server'
import { readPublishState } from '@/lib/admin-repository'
import { getSupabaseAdmin } from '@/lib/supabase-admin'

const getDriveFileId = (link: string) => {
  const fromFilePath = link.match(/\/d\/([^/]+)/)?.[1]
  if (fromFilePath) return fromFilePath

  const fromQuery = link.match(/[?&]id=([^&]+)/)?.[1]
  if (fromQuery) return fromQuery

  return null
}

type DownloadTarget = {
  primary: string
  fallback?: string
}

const toUrl = (raw: string) => {
  const trimmed = raw.trim()
  if (!trimmed) return null

  try {
    return new URL(trimmed)
  } catch {
    try {
      return new URL(`https://${trimmed}`)
    } catch {
      return null
    }
  }
}

const normalizeHost = (host: string) => host.toLowerCase().replace(/^www\./, '')

const getDownloadTarget = (link: string): DownloadTarget | null => {
  const parsed = toUrl(link)
  if (!parsed) return null

  try {
    const host = normalizeHost(parsed.hostname)

    if (host === 'docs.google.com') {
      const docId = parsed.pathname.match(/\/document\/d\/([^/]+)/)?.[1]
      if (docId) {
        return {
          primary: `https://docs.google.com/document/d/${encodeURIComponent(docId)}/export?format=pdf`,
          fallback: `https://docs.google.com/document/d/${encodeURIComponent(docId)}/view`,
        }
      }

      const sheetId = parsed.pathname.match(/\/spreadsheets\/d\/([^/]+)/)?.[1]
      if (sheetId) {
        return {
          primary: `https://docs.google.com/spreadsheets/d/${encodeURIComponent(sheetId)}/export?format=pdf`,
          fallback: `https://docs.google.com/spreadsheets/d/${encodeURIComponent(sheetId)}/edit`,
        }
      }

      const slideId = parsed.pathname.match(/\/presentation\/d\/([^/]+)/)?.[1]
      if (slideId) {
        return {
          primary: `https://docs.google.com/presentation/d/${encodeURIComponent(slideId)}/export/pdf`,
          fallback: `https://docs.google.com/presentation/d/${encodeURIComponent(slideId)}/edit`,
        }
      }
    }

    if (host === 'drive.google.com' || host === 'drive.usercontent.google.com') {
      const fileId = getDriveFileId(parsed.toString())
      if (fileId) {
        return {
          primary: `https://drive.google.com/uc?export=download&id=${encodeURIComponent(fileId)}`,
          fallback: `https://drive.google.com/file/d/${encodeURIComponent(fileId)}/view`,
        }
      }
    }

    if (host.endsWith('dropbox.com')) {
      const direct = new URL(parsed.toString())
      direct.searchParams.set('dl', '1')
      return {
        primary: direct.toString(),
        fallback: parsed.toString(),
      }
    }

    if (parsed.protocol === 'http:' || parsed.protocol === 'https:') {
      return {
        primary: parsed.toString(),
      }
    }
  } catch {
    return null
  }

  return null
}

const canPreflight = (url: string) => {
  try {
    const parsed = new URL(url)
    const host = normalizeHost(parsed.hostname)
    return (
      host.endsWith('google.com') ||
      host.endsWith('googleusercontent.com') ||
      host.endsWith('dropbox.com')
    )
  } catch {
    return false
  }
}

const textError = (message: string, status: number) =>
  new NextResponse(message, {
    status,
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'no-store',
    },
  })

export async function GET(request: NextRequest) {
  try {
    const supabase = getSupabaseAdmin()
    const publishState = await readPublishState(supabase)

    if (!publishState.problemStatementsDownload) {
      return textError('Download is currently disabled by admin', 403)
    }

    const link = request.nextUrl.searchParams.get('link')

    if (!link) {
      return textError('Missing PDF link', 400)
    }

    const downloadTarget = getDownloadTarget(link)

    if (!downloadTarget) {
      return textError('Invalid download link', 400)
    }

    if (downloadTarget.fallback && canPreflight(downloadTarget.primary)) {
      try {
        const preflight = await fetch(downloadTarget.primary, {
          method: 'HEAD',
          redirect: 'follow',
          cache: 'no-store',
        })

        if (!preflight.ok) {
          return NextResponse.redirect(downloadTarget.fallback, {
            status: 302,
            headers: {
              'Cache-Control': 'no-store',
            },
          })
        }
      } catch {
        return NextResponse.redirect(downloadTarget.fallback, {
          status: 302,
          headers: {
            'Cache-Control': 'no-store',
          },
        })
      }
    }

    return NextResponse.redirect(downloadTarget.primary, {
      status: 302,
      headers: {
        'Cache-Control': 'no-store',
      },
    })
  } catch (error) {
    return textError(error instanceof Error ? error.message : 'Failed to process download', 500)
  }
}
