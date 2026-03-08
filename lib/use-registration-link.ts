'use client'

import { useEffect, useState } from 'react'

const DEFAULT_REGISTRATION_LINK = 'https://unstop.com/'

interface ApiResponse {
  success: boolean
  data?: {
    registrationLink?: string
  }
}

export function useRegistrationLink() {
  const [registrationLink, setRegistrationLink] = useState(DEFAULT_REGISTRATION_LINK)

  useEffect(() => {
    const fetchRegistrationLink = async () => {
      try {
        const response = await fetch('/api/site-settings/registration-link', {
          cache: 'no-store',
        })
        const json = (await response.json()) as ApiResponse

        const nextLink = json.data?.registrationLink?.trim()
        if (response.ok && json.success && nextLink) {
          setRegistrationLink(nextLink)
        }
      } catch {
      }
    }

    void fetchRegistrationLink()
  }, [])

  return registrationLink
}
