import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase-admin'
import { requireAdminSession } from '@/lib/admin-session'
import { 
  updateSponsor, 
  deleteSponsor,
  type SponsorEntry 
} from '@/lib/admin-repository'

interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
}

const isValidRouteId = (id: unknown): id is string =>
  typeof id === 'string' && id.trim().length > 0 && id !== 'undefined' && id !== 'null'

const getSponsorsStoragePathFromUrl = (url?: string | null): string | null => {
  if (!url || typeof url !== 'string') {
    return null
  }

  // Handle absolute public URL format:
  // https://<project>.supabase.co/storage/v1/object/public/sponsors/<path>
  const publicMarker = '/storage/v1/object/public/sponsors/'
  const publicMarkerIndex = url.indexOf(publicMarker)

  if (publicMarkerIndex !== -1) {
    return decodeURIComponent(url.slice(publicMarkerIndex + publicMarker.length))
  }

  // Handle already stored relative paths in sponsors bucket.
  if (!url.includes('://') && !url.startsWith('data:')) {
    return url
  }

  return null
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = getSupabaseAdmin()
    await requireAdminSession(request, supabase)
    const body = await request.json()
    const { id } = await params

    if (!isValidRouteId(id)) {
      return NextResponse.json<ApiResponse<null>>(
        {
          success: false,
          error: 'Invalid sponsor id',
        },
        { status: 400 }
      )
    }

    const updatedSponsor = await updateSponsor(supabase, id, body)

    return NextResponse.json<ApiResponse<SponsorEntry>>(
      {
        success: true,
        data: updatedSponsor,
      },
      { status: 200 }
    )
  } catch (error) {
    return NextResponse.json<ApiResponse<null>>(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to update sponsor',
      },
      { status: 500 }
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

    if (!isValidRouteId(id)) {
      return NextResponse.json<ApiResponse<null>>(
        {
          success: false,
          error: 'Invalid sponsor id',
        },
        { status: 400 }
      )
    }

    const { data: sponsorRow, error: sponsorError } = await supabase
      .from('sponsors')
      .select('logo_url')
      .eq('id', id)
      .maybeSingle<{ logo_url: string | null }>()

    if (sponsorError) {
      throw new Error(sponsorError.message)
    }

    if (!sponsorRow) {
      return NextResponse.json<ApiResponse<null>>(
        {
          success: false,
          error: 'Sponsor not found',
        },
        { status: 404 }
      )
    }

    const storagePath = getSponsorsStoragePathFromUrl(sponsorRow.logo_url)

    if (storagePath) {
      const { error: removeImageError } = await supabase.storage
        .from('sponsors')
        .remove([storagePath])

      // Do not block sponsor deletion for non-critical storage failures.
      if (removeImageError) {
        console.warn('Failed to remove sponsor image from storage:', removeImageError.message)
      }
    }

    await deleteSponsor(supabase, id)

    return NextResponse.json<ApiResponse<null>>(
      {
        success: true,
      },
      { status: 200 }
    )
  } catch (error) {
    return NextResponse.json<ApiResponse<null>>(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to delete sponsor',
      },
      { status: 500 }
    )
  }
}
