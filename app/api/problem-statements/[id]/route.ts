import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase-admin'
import { mapProblemStatementRow } from '@/lib/admin-repository'
import { requireAdminSession } from '@/lib/admin-session'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = getSupabaseAdmin()
    const { id } = await params
    const { data: statement, error } = await supabase
      .from('problem_statements')
      .select('*')
      .eq('id', id)
      .single()

    if (error || !statement) {
      return NextResponse.json({ success: false, error: 'Problem statement not found' }, { status: 404 })
    }

    return NextResponse.json(
      {
        success: true,
        data: mapProblemStatementRow(statement),
      },
      { status: 200 }
    )
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch problem statement',
      },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = getSupabaseAdmin()
    await requireAdminSession(request, supabase)
    const { id } = await params
    const body = await request.json()
    const { title, domain, description, pdfLink } = body

    const updatePayload: {
      title?: string
      domain?: string
      description?: string
      pdf_link?: string
    } = {}

    if (title !== undefined) {
      updatePayload.title = String(title).trim()
    }

    if (domain !== undefined) {
      updatePayload.domain = String(domain).trim()
    }

    if (description !== undefined) {
      updatePayload.description = String(description).trim()
    }

    if (pdfLink !== undefined) {
      updatePayload.pdf_link = String(pdfLink).trim()
    }

    const { data: statement, error: updateError } = await supabase
      .from('problem_statements')
      .update(updatePayload)
      .eq('id', id)
      .select('*')
      .single()

    if (updateError || !statement) {
      return NextResponse.json({ success: false, error: 'Problem statement not found' }, { status: 404 })
    }

    return NextResponse.json(
      {
        success: true,
        data: mapProblemStatementRow(statement),
        message: 'Problem statement updated successfully',
      },
      { status: 200 }
    )
  } catch (error) {
    const status = error instanceof Error && error.message === 'Not authenticated' ? 401 : 500

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to update problem statement',
      },
      { status }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = getSupabaseAdmin()
    await requireAdminSession(request, supabase)
    const { id } = await params

    const { data: deleted, error: deleteError } = await supabase
      .from('problem_statements')
      .delete()
      .eq('id', id)
      .select('*')
      .single()

    if (deleteError || !deleted) {
      return NextResponse.json({ success: false, error: 'Problem statement not found' }, { status: 404 })
    }

    return NextResponse.json(
      {
        success: true,
        data: mapProblemStatementRow(deleted),
        message: 'Problem statement deleted successfully',
      },
      { status: 200 }
    )
  } catch (error) {
    const status = error instanceof Error && error.message === 'Not authenticated' ? 401 : 500

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to delete problem statement',
      },
      { status }
    )
  }
}
