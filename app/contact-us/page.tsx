import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowLeft, Mail, Phone, MapPin } from 'lucide-react'
import ContactForm from '@/components/contact-form'

export const metadata: Metadata = {
  title: 'Contact Us - Sankalp Bharat Hackathon 2K26',
  description: 'Contact details for Sankalp Bharat Hackathon 2K26 organizers.',
}

export default function ContactUsPage() {
  return (
    <main className="min-h-screen px-4 sm:px-6 lg:px-8 pt-28 pb-10">
      <div className="max-w-5xl mx-auto rounded-3xl border border-emerald-500/20 bg-white/80 dark:bg-teal-950/80 backdrop-blur-xl p-5 sm:p-7 lg:p-10">
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
          <div className="rounded-2xl border border-border/50 bg-white/80 dark:bg-teal-900/60 dark:backdrop-blur p-6">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center mb-4">
              <Mail size={18} className="text-emerald-400" />
            </div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Email</h2>
            <a
              href="mailto:sankalpbharat2k26@gmail.com"
              className="text-slate-600 dark:text-slate-300 hover:text-emerald-400 transition"
            >
              sankalpbharat2k26@gmail.com
            </a>
          </div>

          <div className="rounded-2xl border border-border/50 bg-white/80 dark:bg-teal-900/60 dark:backdrop-blur p-6">
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

          <div className="rounded-2xl border border-border/50 bg-white/80 dark:bg-teal-900/60 dark:backdrop-blur p-6">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center mb-4">
              <MapPin size={18} className="text-emerald-400" />
            </div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Address</h2>
            <p className="text-slate-600 dark:text-slate-300">St. Vincent Pallotti College, Nagpur, Maharashtra, India</p>
          </div>
        </div>

        <section className="mt-8 sm:mt-10 rounded-2xl border border-border/50 bg-white/80 dark:bg-teal-900/60 dark:backdrop-blur p-5 sm:p-6">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Visit Our Campus</h2>
          <p className="text-slate-600 dark:text-slate-300 mb-5">
            Find St. Vincent Pallotti College of Engineering and Technology on the map.
          </p>

          <div className="overflow-hidden rounded-xl border border-emerald-500/20 bg-slate-950/40">
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3724.699716887783!2d79.0451582746791!3d21.00467078063862!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3bd4bdc6b03bfded%3A0x51964eb66fa3ec5e!2sSt.%20Vincent%20Pallotti%20College%20of%20Engineering%20and%20Technology!5e0!3m2!1sen!2sin!4v1772999139415!5m2!1sen!2sin"
              className="h-[320px] w-full md:h-[420px]"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="St. Vincent Pallotti College Location"
            />
          </div>

          <a
            href="https://maps.google.com/?q=St.%20Vincent%20Pallotti%20College%20of%20Engineering%20and%20Technology%2C%20Nagpur"
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 inline-flex h-10 items-center justify-center rounded-xl border border-emerald-500/40 bg-emerald-500/10 px-4 text-sm font-semibold text-emerald-300 transition hover:bg-emerald-500/20"
          >
            Open in Google Maps
          </a>
        </section>

        <ContactForm />
      </div>
    </main>
  )
}
