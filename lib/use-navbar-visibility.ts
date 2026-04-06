'use client'

import { useEffect, useState } from 'react'

interface NavbarVisibilityState {
  leaderboard: boolean
  winners: boolean
  qualifiedTeams: boolean
}

interface ApiResponse {
  success: boolean
  data?: NavbarVisibilityState
}

const DEFAULT_VISIBILITY: NavbarVisibilityState = {
  leaderboard: false,
  winners: false,
  qualifiedTeams: false,
}

export function useNavbarVisibility() {
  const [visibility, setVisibility] = useState<NavbarVisibilityState>(DEFAULT_VISIBILITY)

  useEffect(() => {
    const fetchVisibility = async () => {
      try {
        const response = await fetch('/api/site-settings/navbar-visibility', {
          cache: 'no-store',
        })
        const json = (await response.json()) as ApiResponse

        if (response.ok && json.success && json.data) {
          setVisibility(json.data)
        }
      } catch {
      }
    }

    void fetchVisibility()

    const handleStorage = (event: StorageEvent) => {
      if (event.key === 'sb_navbar_visibility_updated_at') {
        void fetchVisibility()
      }
    }

    let channel: BroadcastChannel | null = null

    if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
      channel = new BroadcastChannel('sb_admin_updates')
      channel.onmessage = (event) => {
        if (event.data?.type === 'navbar-visibility-updated') {
          void fetchVisibility()
        }
      }
    }

    window.addEventListener('storage', handleStorage)

    return () => {
      window.removeEventListener('storage', handleStorage)
      channel?.close()
    }
  }, [])

  return visibility
}
