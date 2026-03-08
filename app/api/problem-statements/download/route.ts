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

export async function GET(request: NextRequest) {
  try {
    const supabase = getSupabaseAdmin()
    const publishState = await readPublishState(supabase)

    if (!publishState.problemStatementsDownload) {
      return NextResponse.json(
        {
          success: false,
          error: 'Download is currently disabled by admin',
        },
        { status: 403 }
      )
    }

    const link = request.nextUrl.searchParams.get('link')

    if (!link) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing PDF link',
        },
        { status: 400 }
      )
    }

    const fileId = getDriveFileId(link)

    if (!fileId) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid Google Drive link',
        },
        { status: 400 }
      )
    }

    const downloadUrl = `https://drive.google.com/uc?export=download&id=${encodeURIComponent(fileId)}`
    const driveResponse = await fetch(downloadUrl, {
      redirect: 'follow',
      cache: 'no-store',
    })

    if (!driveResponse.ok || !driveResponse.body) {
      return NextResponse.json(
        {
          success: false,
          error: 'Failed to download file from Google Drive',
        },
        { status: 502 }
      )
    }

    return new NextResponse(driveResponse.body, {
      status: 200,
      headers: {
        'Content-Type': driveResponse.headers.get('content-type') || 'application/pdf',
        'Content-Disposition': `attachment; filename="problem-statement-${fileId}.pdf"`,
        'Cache-Control': 'no-store',
      },
    })
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to process download',
      },
      { status: 500 }
    )
  }
}
