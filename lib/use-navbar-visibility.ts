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
  }, [])

  return visibility
}
