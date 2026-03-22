import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase-admin'
import { requireAdminSession } from '@/lib/admin-session'

interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
}

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '10mb',
    },
  },
}

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

    // Validate file type
    const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp', 'image/svg+xml']
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json<ApiResponse<null>>(
        {
          success: false,
          error: 'Invalid file type. Allowed: PNG, JPG, JPEG, WEBP, SVG',
        },
        { status: 400 }
      )
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json<ApiResponse<null>>(
        {
          success: false,
          error: 'File size exceeds 5MB limit',
        },
        { status: 400 }
      )
    }

    // Create unique filename
    const timestamp = Date.now()
    const randomString = Math.random().toString(36).substring(2, 8)
    const extension = file.name.split('.').pop() || 'png'
    const filename = `sponsor_${timestamp}_${randomString}.${extension}`

    // Upload to Supabase Storage
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    const { data, error } = await supabase.storage
      .from('sponsors')
      .upload(filename, buffer, {
        contentType: file.type,
        cacheControl: '31536000', // Cache for 1 year
        upsert: false,
      })

    if (error) {
      throw new Error(error.message)
    }

    // Get public URL
    const {
      data: { publicUrl },
    } = supabase.storage.from('sponsors').getPublicUrl(data.path)

    return NextResponse.json<ApiResponse<{ url: string; filename: string }>>(
      {
        success: true,
        data: {
          url: publicUrl,
          filename: data.path,
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
