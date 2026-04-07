'use client'

import { useState } from 'react'
import Image from 'next/image'
import { X } from 'lucide-react'

const WHATSAPP_COMMUNITY_LINK = 'https://chat.whatsapp.com/CI5erudUvOkBOlVKAR1EBu?mode=gi_t'

export default function WhatsAppCommunityFab() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      <section className="px-4 sm:px-6 lg:px-8 mt-3 sm:mt-4 mb-6 sm:mb-8">
        <div className="mx-auto max-w-5xl rounded-2xl border border-blue-600/25 bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 p-2.5 sm:p-3.5 shadow-[0_12px_26px_rgba(2,6,23,0.38)]">
          <button
            type="button"
            onClick={() => setIsOpen(true)}
            aria-label="Join WhatsApp community"
            className="w-full rounded-xl border border-white/8 bg-white/5 px-3 py-2.5 text-left transition hover:bg-white/8 sm:px-4 sm:py-3"
          >
            <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center sm:gap-3">
              <div className="flex items-center gap-3 min-w-0 flex-1">
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-emerald-500/15 ring-1 ring-emerald-400/30 shadow-[0_0_16px_rgba(16,185,129,0.16)] sm:h-14 sm:w-14">
                  <Image src="/whatsapp-svg.svg" alt="WhatsApp" width={38} height={38} priority className="h-9 w-9 sm:h-10 sm:w-10" />
                </span>

                <span className="min-w-0">
                  <span className="block text-sm sm:text-base font-black text-white leading-tight">Join the WhatsApp Community</span>
                  <span className="mt-0.5 block text-[11px] sm:text-xs text-slate-300 leading-snug">
                    All announcements, reminders, and event updates happen here.
                  </span>
                </span>
              </div>

              <span className="inline-flex items-center justify-center rounded-full bg-emerald-500 px-4 py-1.5 text-xs sm:text-sm font-black text-slate-950 transition hover:brightness-110 sm:shrink-0 sm:ml-auto">
                Join Now
              </span>
            </div>
          </button>
        </div>
      </section>

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
