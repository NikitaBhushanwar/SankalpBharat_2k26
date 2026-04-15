import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase-admin'
import { requireAdminSession } from '@/lib/admin-session'
import {
  createFinalProblemStatement,
  readAllFinalProblemStatements,
  type FinalProblemStatementEntry,
} from '@/lib/admin-repository'

interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
}

export async function GET() {
  try {
    const supabase = getSupabaseAdmin()
    const statements = await readAllFinalProblemStatements(supabase)

    return NextResponse.json<ApiResponse<FinalProblemStatementEntry[]>>(
      {
        success: true,
        data: statements,
      },
      { status: 200 }
    )
  } catch (error) {
    return NextResponse.json<ApiResponse<null>>(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch final problem statements',
      },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = getSupabaseAdmin()
    await requireAdminSession(request, supabase)
    const body = await request.json()

    const problemStatementId = String(body.problemStatementId ?? '').trim()
    const title = String(body.title ?? '').trim()
    const domain = String(body.domain ?? '').trim()
    const description = String(body.description ?? '').trim()
    const pdfLink = String(body.pdfLink ?? '').trim()

    if (!problemStatementId || !title || !domain || !description || !pdfLink) {
      return NextResponse.json<ApiResponse<null>>(
        {
          success: false,
          error: 'Problem statement ID, title, domain, description, and PDF link are required',
        },
        { status: 400 }
      )
    }

    const created = await createFinalProblemStatement(supabase, {
      problemStatementId,
      title,
      domain,
      description,
      pdfLink,
    })

    return NextResponse.json<ApiResponse<FinalProblemStatementEntry>>(
      {
        success: true,
        data: created,
      },
      { status: 201 }
    )
  } catch (error) {
    const status = error instanceof Error && error.message === 'Not authenticated' ? 401 : 500

    return NextResponse.json<ApiResponse<null>>(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create final problem statement',
      },
      { status }
    )
  }
}
