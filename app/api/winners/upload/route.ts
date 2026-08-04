import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase-admin'
import { requireAdminSession } from '@/lib/admin-session'

interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
}

const ALLOWED_TYPES = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp', 'image/svg+xml']
const MAX_FILE_SIZE = 5 * 1024 * 1024
const BUCKET_CANDIDATES = ['winners', 'sponsors', 'qualified-teams']

export async function POST(request: NextRequest) {
  try {
    const supabase = getSupabaseAdmin()
    await requireAdminSession(request, supabase)

    const formData = await request.formData()
    const file = formData.get('file') as File

    if (!file) {
      return NextResponse.json<ApiResponse<null>>(
        {
          success: false,
          error: 'No file provided',
        },
        { status: 400 }
      )
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json<ApiResponse<null>>(
        {
          success: false,
          error: 'Invalid file type. Allowed: PNG, JPG, JPEG, WEBP, SVG',
        },
        { status: 400 }
      )
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json<ApiResponse<null>>(
        {
          success: false,
          error: 'File size exceeds 5MB limit',
        },
        { status: 400 }
      )
    }

    const timestamp = Date.now()
    const randomString = Math.random().toString(36).substring(2, 8)
    const extension = file.name.split('.').pop() || 'png'
    const filename = `winner_${timestamp}_${randomString}.${extension}`

    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    let uploadedPath: string | null = null
    let uploadedBucket: string | null = null
    let lastErrorMessage = 'Failed to upload winner image'

    for (const bucket of BUCKET_CANDIDATES) {
      const { data, error } = await supabase.storage
        .from(bucket)
        .upload(filename, buffer, {
          contentType: file.type,
          cacheControl: '31536000',
          upsert: false,
        })

      if (!error && data?.path) {
        uploadedPath = data.path
        uploadedBucket = bucket
        break
      }

      if (error?.message) {
        lastErrorMessage = error.message
      }
    }

    if (!uploadedPath || !uploadedBucket) {
      throw new Error(lastErrorMessage)
    }

    const {
      data: { publicUrl },
    } = supabase.storage.from(uploadedBucket).getPublicUrl(uploadedPath)

    return NextResponse.json<ApiResponse<{ url: string; filename: string; bucket: string }>>(
      {
        success: true,
        data: {
          url: publicUrl,
          filename: uploadedPath,
          bucket: uploadedBucket,
        },
      },
      { status: 200 }
    )
  } catch (error) {
    return NextResponse.json<ApiResponse<null>>(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to upload image',
      },
      { status: 500 }
    )
  }
}