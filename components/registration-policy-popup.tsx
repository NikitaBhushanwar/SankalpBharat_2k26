'use client'

import { useEffect, useState } from 'react'
import { X } from 'lucide-react'
import { usePathname } from 'next/navigation'

interface LoadingPopupSettings {
  enabled: boolean
  title: string
  message: string
}

interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
}

const defaultPopupSettings: LoadingPopupSettings = {
  enabled: true,
  title: 'Qualified Teams Are Live',
  message: 'Qualified teams are now live and can be viewed in the Qualified Teams section. Check the latest list to see the updated entries.',
}

export default function RegistrationPolicyPopup() {
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(false)
  const [settings, setSettings] = useState<LoadingPopupSettings>(defaultPopupSettings)
  const [settingsLoaded, setSettingsLoaded] = useState(false)

  useEffect(() => {
    if (pathname.startsWith('/qualified-teams')) {
      return
    }

    if (!settingsLoaded) return

    let timeoutId: number | undefined
    const isMobile = window.matchMedia('(max-width: 767px)').matches
    const hasMobileLoaderPlayed = sessionStorage.getItem('sb_mobile_loader_played') === 'true'

    const openPopup = () => {
      if (!settings.enabled) return
      timeoutId = window.setTimeout(() => {
        setIsOpen(true)
      }, 250)
    }

    const openAfterLoad = () => {
      if (document.readyState === 'complete') {
        openPopup()
      } else {
        window.addEventListener('load', openPopup, { once: true })
      }
    }

    const handleMobileLoaderComplete = () => {
      openPopup()
    }

    if (isMobile && !hasMobileLoaderPlayed) {
      window.addEventListener('sb-mobile-loader-complete', handleMobileLoaderComplete, { once: true })
    } else {
      openAfterLoad()
    }

    return () => {
      window.removeEventListener('load', openPopup)
      window.removeEventListener('sb-mobile-loader-complete', handleMobileLoaderComplete)
      if (timeoutId) window.clearTimeout(timeoutId)
    }
  }, [pathname, settings.enabled, settingsLoaded])

  useEffect(() => {
    const fetchPopupSettings = async () => {
      try {
        const response = await fetch('/api/site-settings/loading-popup', { cache: 'no-store' })
        const json = (await response.json()) as ApiResponse<LoadingPopupSettings>

        if (!response.ok || !json.success || !json.data) {
          return
        }

        setSettings(json.data)
      } catch {
        // Keep default popup copy on network errors.
      } finally {
        setSettingsLoaded(true)
      }
    }

    void fetchPopupSettings()
  }, [])

  const closePopup = () => {
    setIsOpen(false)
  }

  if (pathname.startsWith('/qualified-teams')) return null

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center bg-slate-950/65 p-3 sm:p-4">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="round-policy-title"
        className="w-full max-w-xl rounded-2xl border border-emerald-500/40 bg-white/95 p-5 sm:p-7 shadow-2xl dark:bg-slate-950/95"
      >
        <div className="mb-3 relative">
          <h2 id="round-policy-title" className="text-center text-lg sm:text-xl font-black text-red-600 dark:text-red-400">
            {settings.title}
          </h2>
          <button
            type="button"
            onClick={closePopup}
            aria-label="Close update"
            className="absolute right-0 top-0 inline-flex h-8 w-8 items-center justify-center rounded-full border border-border/60 bg-background/60 text-slate-700 transition hover:bg-background dark:text-slate-200"
          >
            <X size={16} />
          </button>
        </div>

        <p className="text-sm sm:text-base font-semibold text-emerald-700 dark:text-emerald-300">
          {settings.message}
        </p>

        <div className="mt-5 flex justify-end">
          <button
            type="button"
            onClick={closePopup}
            className="inline-flex items-center justify-center rounded-full bg-emerald-500 px-5 py-2 text-xs sm:text-sm font-black uppercase tracking-wider text-slate-950 transition hover:brightness-110"
          >
            Ok
          </button>
        </div>
      </div>
    </div>
  )
}
