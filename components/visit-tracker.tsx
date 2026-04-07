'use client'

import { useEffect } from 'react'
import { usePathname } from 'next/navigation'

const VISITOR_ID_KEY = 'sb_visitor_id'
const LAST_VISIT_AT_KEY = 'sb_last_visit_at'
const VISIT_THROTTLE_MS = 30 * 60 * 1000

const createVisitorId = () => {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID().replace(/-/g, '_')
  }

  return `v_${Math.random().toString(36).slice(2)}_${Date.now().toString(36)}`
}

export default function VisitTracker() {
  const pathname = usePathname()

  useEffect(() => {
    if (pathname?.startsWith('/admin')) {
      return
    }

    const now = Date.now()
    const existingId = localStorage.getItem(VISITOR_ID_KEY)
    const visitorId = existingId && existingId.length > 0 ? existingId : createVisitorId()
    const lastVisitAtRaw = localStorage.getItem(LAST_VISIT_AT_KEY)
    const lastVisitAt = Number(lastVisitAtRaw)

    if (!existingId) {
      localStorage.setItem(VISITOR_ID_KEY, visitorId)
    }

    if (Number.isFinite(lastVisitAt) && now - lastVisitAt < VISIT_THROTTLE_MS) {
      return
    }

    localStorage.setItem(LAST_VISIT_AT_KEY, String(now))

    void fetch('/api/analytics/visit', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        visitorId,
        path: pathname ?? '/',
      }),
      keepalive: true,
    })
  }, [pathname])

  return null
}