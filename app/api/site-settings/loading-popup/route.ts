import { NextRequest, NextResponse } from 'next/server'
import {
  DEFAULT_LOADING_POPUP_SETTINGS,
  readLoadingPopupSettings,
  writeLoadingPopupSettings,
  type LoadingPopupSettings,
} from '@/lib/admin-repository'
import { assertSuperAdminRequest } from '@/lib/admin-access'
import { getSupabaseAdmin } from '@/lib/supabase-admin'

interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
}

interface LoadingPopupData {
  enabled: boolean
  title: string
  message: string
}

export async function GET() {
  try {
    const supabase = getSupabaseAdmin()
    const popupSettings = await readLoadingPopupSettings(supabase)

    return NextResponse.json<ApiResponse<LoadingPopupData>>(
      {
        success: true,
        data: popupSettings,
      },
      { status: 200 }
    )
  } catch (error) {
    return NextResponse.json<ApiResponse<LoadingPopupData>>(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch loading popup settings',
        data: {
          enabled: DEFAULT_LOADING_POPUP_SETTINGS.enabled,
          title: DEFAULT_LOADING_POPUP_SETTINGS.title,
          message: DEFAULT_LOADING_POPUP_SETTINGS.message,
        },
      },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const supabase = getSupabaseAdmin()
    await assertSuperAdminRequest(request, supabase)

    const body = (await request.json()) as Partial<LoadingPopupSettings>

    if (
      typeof body.enabled !== 'boolean' ||
      typeof body.title !== 'string' ||
      typeof body.message !== 'string'
    ) {
      return NextResponse.json<ApiResponse<LoadingPopupData>>(
        {
          success: false,
          error: 'Invalid payload',
        },
        { status: 400 }
      )
    }

    const title = body.title.trim()
    const message = body.message.trim()

    if (!title || !message) {
      return NextResponse.json<ApiResponse<LoadingPopupData>>(
        {
          success: false,
          error: 'Title and message are required',
        },
        { status: 400 }
      )
    }

    const nextState: LoadingPopupSettings = {
      enabled: body.enabled,
      title,
      message,
    }

    await writeLoadingPopupSettings(supabase, nextState)

    return NextResponse.json<ApiResponse<LoadingPopupData>>(
      {
        success: true,
        data: nextState,
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

    return NextResponse.json<ApiResponse<LoadingPopupData>>(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to update loading popup settings',
      },
      { status }
    )
  }
}
