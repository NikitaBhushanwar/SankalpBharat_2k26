import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase-admin'
import { mapProblemStatementRow } from '@/lib/admin-repository'
import { requireAdminSession } from '@/lib/admin-session'

export async function GET() {
  try {
    const supabase = getSupabaseAdmin()

    const { data, error, count } = await supabase
      .from('problem_statements')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: true })

    if (error) {
      throw new Error(error.message)
    }

    const normalizedData = (data ?? []).map((item) => mapProblemStatementRow(item))

    return NextResponse.json(
      {
        success: true,
        data: normalizedData,
        total: count ?? normalizedData.length,
      },
      { status: 200 }
    )
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch problem statements',
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
    const { title, domain, description, pdfLink } = body

    if (!title || !domain || !description || !pdfLink) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing required fields',
        },
        { status: 400 }
      )
    }

    const { data: newStatement, error: createError } = await supabase
      .from('problem_statements')
      .insert({
        title: String(title).trim(),
        domain: String(domain).trim(),
        description: String(description).trim(),
        pdf_link: String(pdfLink).trim(),
      })
      .select('*')
      .single()

    if (createError || !newStatement) {
      throw new Error(createError?.message || 'Failed to add problem statement')
    }

    return NextResponse.json(
      {
        success: true,
        data: mapProblemStatementRow(newStatement),
        message: 'Problem statement added successfully',
      },
      { status: 201 }
    )
  } catch (error) {
    const status = error instanceof Error && error.message === 'Not authenticated' ? 401 : 500

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to add problem statement',
      },
      { status }
    )
  }
}
