import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase-admin'
import { requireAdminSession } from '@/lib/admin-session'
import { 
  readAllSponsors, 
  createSponsor, 
  type SponsorEntry 
} from '@/lib/admin-repository'

interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
}

export async function GET(request: NextRequest) {
  try {
    const supabase = getSupabaseAdmin()
    const sponsors = await readAllSponsors(supabase)

    return NextResponse.json<ApiResponse<SponsorEntry[]>>(
      {
        success: true,
        data: sponsors,
      },
      { status: 200 }
    )
  } catch (error) {
    return NextResponse.json<ApiResponse<null>>(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch sponsors',
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

    const {
      name,
      logoUrl,
      secondaryLogoUrl,
      websiteUrl,
      category,
      titlePrimary,
      titleSecondary,
      description,
      displayOrder,
      isFeatured,
    } = body as Omit<SponsorEntry, 'id'>

    if (!name || !logoUrl || !category) {
      return NextResponse.json<ApiResponse<null>>(
        {
          success: false,
          error: 'Name, logo URL, and category are required',
        },
        { status: 400 }
      )
    }

    const sponsor = await createSponsor(supabase, {
      name,
      logoUrl,
      secondaryLogoUrl: secondaryLogoUrl || null,
      websiteUrl: websiteUrl || null,
      category,
      titlePrimary: titlePrimary || null,
      titleSecondary: titleSecondary || null,
      description: description || null,
      displayOrder: displayOrder || 0,
      isFeatured: isFeatured || false,
    })

    return NextResponse.json<ApiResponse<SponsorEntry>>(
      {
        success: true,
        data: sponsor,
      },
      { status: 201 }
    )
  } catch (error) {
    return NextResponse.json<ApiResponse<null>>(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create sponsor',
      },
      { status: 500 }
    )
  }
}
