'use client'

import { useState } from 'react'
import Image from 'next/image'
import { X } from 'lucide-react'

const WHATSAPP_COMMUNITY_LINK = 'https://chat.whatsapp.com/CI5erudUvOkBOlVKAR1EBu?mode=gi_t'

export default function WhatsAppCommunityFab() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        aria-label="Join WhatsApp community"
        className="fixed bottom-5 right-5 z-[115] inline-flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500 text-white shadow-[0_12px_28px_rgba(16,185,129,0.45)] transition hover:scale-105 hover:brightness-110"
      >
        <Image src="/whatsapp-svg.svg" alt="WhatsApp" width={28} height={28} priority />
      </button>

      {isOpen ? (
        <div className="fixed inset-0 z-[130] flex items-center justify-center bg-slate-950/65 p-3 sm:p-4">
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="whatsapp-community-title"
            className="w-full max-w-md rounded-2xl border border-emerald-500/40 bg-white/95 p-5 sm:p-6 shadow-2xl dark:bg-slate-950/95"
          >
            <div className="mb-3 relative">
              <h2 id="whatsapp-community-title" className="text-center text-lg sm:text-xl font-black text-emerald-700 dark:text-emerald-300">
                Join Our WhatsApp Community
              </h2>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                aria-label="Close WhatsApp popup"
                className="absolute right-0 top-0 inline-flex h-8 w-8 items-center justify-center rounded-full border border-border/60 bg-background/60 text-slate-700 transition hover:bg-background dark:text-slate-200"
              >
                <X size={16} />
              </button>
            </div>

            <p className="text-sm sm:text-base text-slate-700 dark:text-slate-200 text-center">
              Stay updated with important announcements, reminders, and event support from the Sankalp Bharat team.
            </p>

            <div className="mt-5 flex justify-center">
              <a
                href={WHATSAPP_COMMUNITY_LINK}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center rounded-full bg-emerald-500 px-5 py-2 text-xs sm:text-sm font-black uppercase tracking-wider text-slate-950 transition hover:brightness-110"
              >
                Join Community
              </a>
            </div>
          </div>
        </div>
      ) : null}
    </>
  )
}
