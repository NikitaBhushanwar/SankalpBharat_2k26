import { NextRequest, NextResponse } from 'next/server'
import {
  DEFAULT_REGISTRATION_LINK,
  readRegistrationLink,
  writeRegistrationLink,
} from '@/lib/admin-repository'
import { assertSuperAdminRequest } from '@/lib/admin-access'
import { getSupabaseAdmin } from '@/lib/supabase-admin'

interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
}

interface RegistrationLinkData {
  registrationLink: string
}

const isValidUrl = (value: string) => {
  try {
    const parsed = new URL(value)
    return parsed.protocol === 'http:' || parsed.protocol === 'https:'
  } catch {
    return false
  }
}

export async function GET() {
  try {
    const supabase = getSupabaseAdmin()
    const registrationLink = await readRegistrationLink(supabase)

    return NextResponse.json<ApiResponse<RegistrationLinkData>>(
      {
        success: true,
        data: { registrationLink },
      },
      { status: 200 }
    )
  } catch (error) {
    return NextResponse.json<ApiResponse<RegistrationLinkData>>(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch registration link',
        data: { registrationLink: DEFAULT_REGISTRATION_LINK },
      },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const supabase = getSupabaseAdmin()
    await assertSuperAdminRequest(request, supabase)

    const body = (await request.json()) as { registrationLink?: string }
    const registrationLink = String(body.registrationLink ?? '').trim()

    if (!registrationLink || !isValidUrl(registrationLink)) {
      return NextResponse.json<ApiResponse<RegistrationLinkData>>(
        {
          success: false,
          error: 'Please provide a valid http/https URL',
        },
        { status: 400 }
      )
    }

    await writeRegistrationLink(supabase, registrationLink)

    return NextResponse.json<ApiResponse<RegistrationLinkData>>(
      {
        success: true,
        data: { registrationLink },
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

    return NextResponse.json<ApiResponse<RegistrationLinkData>>(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to update registration link',
      },
      { status }
    )
  }
}
