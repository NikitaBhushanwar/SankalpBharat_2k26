import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase-admin'
import { requireAdminSession } from '@/lib/admin-session'

interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
}

/**
 * Initialize sponsors storage bucket
 * Creates the bucket if it doesn't exist and sets proper policies
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = getSupabaseAdmin()
    await requireAdminSession(request, supabase)

    // Check if bucket exists
    const { data: buckets } = await supabase.storage.listBuckets()
    
    const sponsorsBucketExists = buckets?.some((b) => b.name === 'sponsors')

    if (!sponsorsBucketExists) {
      // Create the bucket if it doesn't exist
      const { data, error } = await supabase.storage.createBucket('sponsors', {
        public: true, // Make it publicly accessible to view images
        allowedMimeTypes: [
          'image/png',
          'image/jpeg',
          'image/jpg',
          'image/webp',
          'image/svg+xml',
        ],
        fileSizeLimit: 5242880, // 5MB
      })

      if (error) {
        throw new Error(`Failed to create bucket: ${error.message}`)
      }

      return NextResponse.json<ApiResponse<{ message: string }>>(
        {
          success: true,
          data: {
            message: 'Sponsors bucket created successfully',
          },
        },
        { status: 201 }
      )
    }

    return NextResponse.json<ApiResponse<{ message: string }>>(
      {
        success: true,
        data: {
          message: 'Sponsors bucket already exists',
        },
      },
      { status: 200 }
    )
  } catch (error) {
    return NextResponse.json<ApiResponse<null>>(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Initialization failed',
      },
      { status: 500 }
    )
  }
}
