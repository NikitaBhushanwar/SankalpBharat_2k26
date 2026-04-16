'use client'

import { useEffect } from 'react'
import confetti from 'canvas-confetti'

const runConfetti = () => {
  confetti({
    particleCount: 100,
    spread: 70,
    origin: { y: 0.6 },
  })
}

const runConfettiSequence = () => {
  runConfetti()

  window.setTimeout(() => {
    confetti({
      particleCount: 90,
      spread: 65,
      origin: { y: 0.58, x: 0.25 },
    })
  }, 240)

  window.setTimeout(() => {
    confetti({
      particleCount: 90,
      spread: 65,
      origin: { y: 0.58, x: 0.75 },
    })
  }, 480)

  window.setTimeout(() => {
    confetti({
      particleCount: 110,
      spread: 78,
      origin: { y: 0.6 },
    })
  }, 740)
}

export default function QualifiedTeamsCelebration() {
  useEffect(() => {
    const timer = window.setTimeout(() => {
      runConfettiSequence()
    }, 180)

    return () => window.clearTimeout(timer)
  }, [])

  return (
    <div className="mb-3 flex items-center justify-center">
      <button
        id="hs-run-on-click-run-confetti"
        type="button"
        onClick={runConfettiSequence}
        className="inline-flex items-center justify-center rounded-full bg-emerald-500 px-4 py-2 text-xs font-black uppercase tracking-wider text-slate-950 transition hover:brightness-110"
      >
        Celebrate
      </button>
    </div>
  )
}
