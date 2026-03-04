'use client'

import { usePathname } from 'next/navigation'
import ModernFooter from './modern-footer'

export default function FooterWrapper() {
  const pathname = usePathname()

  if (pathname.startsWith('/admin')) {
    return null
  }

  return <ModernFooter />
}
