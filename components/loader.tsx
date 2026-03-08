'use client'

import { useEffect, useRef, useState } from 'react'

export function Loader() {
  const [isVisible, setIsVisible] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const [isClosing, setIsClosing] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)

  const closeLoader = () => {
    sessionStorage.setItem('sb_mobile_loader_played', 'true')
    setIsClosing(true)
    window.setTimeout(() => {
      setIsVisible(false)
      setIsClosing(false)
    }, 320)
  }

  useEffect(() => {
    const hasPlayed = sessionStorage.getItem('sb_mobile_loader_played') === 'true'
    const mobile = window.matchMedia('(max-width: 767px)').matches

    setIsMobile(mobile)

    if (mobile && !hasPlayed) {
      setIsVisible(true)
    }
  }, [])

  useEffect(() => {
    if (!isVisible || !isMobile) return

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    const video = videoRef.current
    if (!video) {
      document.body.style.overflow = previousOverflow
      return
    }

    const onEnded = () => {
      closeLoader()
    }

    video.currentTime = 0
    void video.play().catch(() => {
      closeLoader()
    })
    video.addEventListener('ended', onEnded)

    const fallbackTimer = window.setTimeout(() => {
      closeLoader()
    }, 8000)

    return () => {
      document.body.style.overflow = previousOverflow
      video.removeEventListener('ended', onEnded)
      window.clearTimeout(fallbackTimer)
    }
  }, [isVisible, isMobile])

  if (!isVisible || !isMobile) return null

  return (
    <div
      className={`fixed inset-0 z-[120] flex items-center justify-center bg-slate-950 transition-opacity duration-300 ease-out ${
        isClosing ? 'opacity-0' : 'opacity-100'
      }`}
    >
      <video
        ref={videoRef}
        className="h-full w-full object-contain"
        src="/Logo_Animation.webm"
        muted
        playsInline
        autoPlay
        preload="auto"
      />
    </div>
  )
}
