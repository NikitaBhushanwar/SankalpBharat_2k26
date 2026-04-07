import { NextRequest, NextResponse } from 'next/server'
import {
  createAnnouncement,
  readAnnouncements,
  type AnnouncementEntry,
} from '@/lib/admin-repository'
import { requireAdminSession } from '@/lib/admin-session'
import { getSupabaseAdmin } from '@/lib/supabase-admin'

interface ApiResponse<T> {
  success: boolean
  data?: T
  total?: number
  error?: string
}

export async function GET(request: NextRequest) {
  try {
    const supabase = getSupabaseAdmin()
    const limitParam = request.nextUrl.searchParams.get('limit')
    const limit = limitParam ? Number(limitParam) : undefined

    const announcements = await readAnnouncements(supabase, limit)

    return NextResponse.json<ApiResponse<AnnouncementEntry[]>>(
      {
        success: true,
        data: announcements,
        total: announcements.length,
      },
      { status: 200 }
    )
  } catch (error) {
    return NextResponse.json<ApiResponse<null>>(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch announcements',
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
    const title = String(body.title ?? '').trim()
    const message = String(body.message ?? '').trim()
    const tag = String(body.tag ?? 'Update').trim() || 'Update'

    if (!title || !message) {
      return NextResponse.json<ApiResponse<null>>(
        {
          success: false,
          error: 'Title and message are required',
        },
        { status: 400 }
      )
    }

    const announcement = await createAnnouncement(supabase, {
      title,
      message,
      tag,
    })

    return NextResponse.json<ApiResponse<AnnouncementEntry>>(
      {
        success: true,
        data: announcement,
      },
      { status: 201 }
    )
  } catch (error) {
    return NextResponse.json<ApiResponse<null>>(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create announcement',
      },
      { status: 500 }
    )
  }
}