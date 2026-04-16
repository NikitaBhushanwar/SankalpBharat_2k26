import { NextRequest, NextResponse } from 'next/server'
import {
  readPublishState,
  writePublishState,
  type PublishSection,
} from '@/lib/admin-repository'
import { getSupabaseAdmin } from '@/lib/supabase-admin'
import { requireAdminSession } from '@/lib/admin-session'

export async function GET() {
  try {
    const supabase = getSupabaseAdmin()
    const publishState = await readPublishState(supabase)

    return NextResponse.json(
      {
        success: true,
        data: publishState,
      },
      { status: 200 }
    )
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch publish state',
      },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const supabase = getSupabaseAdmin()
    const admin = await requireAdminSession(request, supabase)
    const body = await request.json()
    const { section, value } = body as {
      section?: PublishSection
      value?: boolean
    }

    if (!section || typeof value !== 'boolean') {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid payload',
        },
        { status: 400 }
      )
    }

    if (section === 'finalRoundSelector' && !admin.is_super_admin) {
      return NextResponse.json(
        {
          success: false,
          error: 'Not authorized',
        },
        { status: 403 }
      )
    }

    await writePublishState(supabase, section, value)
    const publishState = await readPublishState(supabase)

    return NextResponse.json(
      {
        success: true,
        data: publishState,
        message: 'Publish state updated',
      },
      { status: 200 }
    )
  } catch (error) {
    const status =
      error instanceof Error && error.message === 'Not authenticated'
        ? 401
        : error instanceof Error && error.message === 'Not authorized'
          ? 403
          : 500

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to update publish state',
      },
      { status }
    )
  }
}
