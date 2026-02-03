'use client'

import { useEffect, useState } from 'react'

export function Loader() {
  const [isVisible, setIsVisible] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false)
    }, 2500)

    return () => clearTimeout(timer)
  }, [])

  if (!isVisible) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background">
      {/* Animated loader background */}
      <div className="absolute inset-0 tech-grid opacity-50" />

      {/* Loader content */}
      <div className="relative z-10 text-center">
        <div className="inline-block">
          {/* Outer rotating ring */}
          <div className="animate-spin border-2 border-transparent border-t-accent border-r-secondary w-24 h-24 rounded-full" />

          {/* Inner rotating ring (counter-clockwise) */}
          <div className="absolute top-0 left-0 w-24 h-24 border-2 border-transparent border-b-accent border-l-secondary rounded-full animate-spin"
            style={{ animationDirection: 'reverse', animationDuration: '2s' }}
          />

          {/* Center text */}
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center">
            <div className="text-sm font-mono text-muted-foreground mb-2">INITIALIZING</div>
            <div className="text-xs text-accent font-bold animate-pulse">SANKALP BHARAT</div>
          </div>
        </div>

        {/* Loading progress */}
        <div className="mt-12">
          <div className="w-48 h-1 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-accent to-secondary animate-pulse"
              style={{
                animation: 'loadingProgress 2.5s ease-in-out forwards'
              }}
            />
          </div>
          <p className="text-xs text-muted-foreground mt-3 font-mono">Loading experience...</p>
        </div>
      </div>

      {/* Bottom decoration */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-2">
        <div className="w-1 h-1 rounded-full bg-accent animate-bounce" style={{ animationDelay: '0s' }} />
        <div className="w-1 h-1 rounded-full bg-secondary animate-bounce" style={{ animationDelay: '0.2s' }} />
        <div className="w-1 h-1 rounded-full bg-accent animate-bounce" style={{ animationDelay: '0.4s' }} />
      </div>

      <style jsx>{`
        @keyframes loadingProgress {
          0% {
            width: 0%;
            box-shadow: 0 0 10px rgba(0, 255, 65, 0.5);
          }
          50% {
            box-shadow: 0 0 20px rgba(0, 255, 65, 0.5), 0 0 40px rgba(0, 229, 255, 0.3);
          }
          100% {
            width: 100%;
            box-shadow: 0 0 10px rgba(0, 229, 255, 0.5);
          }
        }
      `}</style>
    </div>
  )
}
