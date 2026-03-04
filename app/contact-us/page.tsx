import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowLeft, Mail, Phone, MapPin } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Contact Us - Sankalp Bharat Hackathon 2K26',
  description: 'Contact details for Sankalp Bharat Hackathon 2K26 organizers.',
}

export default function ContactUsPage() {
  return (
    <main className="min-h-screen px-4 sm:px-6 lg:px-8 pt-28 pb-10">
      <div className="max-w-5xl mx-auto rounded-3xl border border-emerald-500/20 bg-white/80 dark:bg-slate-950/80 backdrop-blur-xl p-5 sm:p-7 lg:p-10">
        <div className="mb-8">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 dark:text-slate-300 hover:text-emerald-400 transition"
          >
            <ArrowLeft size={16} /> Back to Home
          </Link>
        </div>

        <div className="mb-10 text-center">
          <p className="text-xs font-semibold tracking-[0.2em] uppercase text-emerald-400 mb-3">Contact Us</p>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 dark:text-white">Get in Touch</h1>
          <p className="mt-3 text-slate-600 dark:text-slate-300 max-w-3xl mx-auto">
            Reach out to the organizing team for registration, participation, sponsorship, or event-related queries.
          </p>
        </div>

        <div className="grid gap-4 sm:gap-6 md:grid-cols-3">
          <div className="rounded-2xl border border-border/50 bg-white/80 dark:bg-slate-900/60 p-6">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center mb-4">
              <Mail size={18} className="text-emerald-400" />
            </div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Email</h2>
            <a
              href="mailto:cse@stvincentngp.edu.in"
              className="text-slate-600 dark:text-slate-300 hover:text-emerald-400 transition"
            >
              cse@stvincentngp.edu.in
            </a>
          </div>

          <div className="rounded-2xl border border-border/50 bg-white/80 dark:bg-slate-900/60 p-6">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center mb-4">
              <Phone size={18} className="text-emerald-400" />
            </div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Phone</h2>
            <a
              href="tel:+917122582922"
              className="text-slate-600 dark:text-slate-300 hover:text-emerald-400 transition"
            >
              +91 712-2582922
            </a>
          </div>

          <div className="rounded-2xl border border-border/50 bg-white/80 dark:bg-slate-900/60 p-6">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center mb-4">
              <MapPin size={18} className="text-emerald-400" />
            </div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Address</h2>
            <p className="text-slate-600 dark:text-slate-300">St. Vincent Pallotti College, Nagpur, Maharashtra, India</p>
          </div>
        </div>
      </div>
    </main>
  )
}
