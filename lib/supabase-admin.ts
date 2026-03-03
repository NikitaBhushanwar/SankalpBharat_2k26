import { createClient, type SupabaseClient } from '@supabase/supabase-js'

const globalForSupabase = globalThis as unknown as {
  __sb_supabase_admin__?: SupabaseClient
}

export function getSupabaseAdmin() {
  if (globalForSupabase.__sb_supabase_admin__) {
    return globalForSupabase.__sb_supabase_admin__
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL
  const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !supabaseServiceRoleKey) {
    throw new Error(
      'Supabase environment variables are missing. Please set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.'
    )
  }

  const client = createClient(supabaseUrl, supabaseServiceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  })

  globalForSupabase.__sb_supabase_admin__ = client
  return client
}
