'use client'

import { FormEvent, useEffect, useRef, useState } from 'react'

const WEB3FORMS_ACCESS_KEY = '64448274-cc7c-4740-b9fb-45b4f13815fa'

export default function ContactForm() {
  const formRef = useRef<HTMLFormElement>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState<{
    type: 'success' | 'error'
    message: string
  } | null>(null)

  useEffect(() => {
    if (!submitStatus) {
      return
    }

    const timer = window.setTimeout(() => {
      setSubmitStatus(null)
    }, 4500)

    return () => {
      window.clearTimeout(timer)
    }
  }, [submitStatus])

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const form = formRef.current
    if (!form) {
      return
    }

    const formData = new FormData(form)
    formData.append('access_key', WEB3FORMS_ACCESS_KEY)

    setSubmitStatus(null)
    setIsSubmitting(true)

    try {
      const response = await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        body: formData,
      })

      const data = (await response.json()) as { message?: string }

      if (response.ok) {
        setSubmitStatus({
          type: 'success',
          message: 'Success! Your message has been sent.',
        })
        form.reset()
      } else {
        setSubmitStatus({
          type: 'error',
          message: `Error: ${data.message ?? 'Unable to send message'}`,
        })
      }
    } catch {
      setSubmitStatus({
        type: 'error',
        message: 'Something went wrong. Please try again.',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <section className="mt-8 sm:mt-10 rounded-2xl border border-border/50 bg-white/80 dark:bg-teal-900/60 dark:backdrop-blur p-6 sm:p-8">
      <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Send us a message</h2>
      <p className="text-slate-600 dark:text-slate-300 mb-6">
        Fill out the form below and our team will get back to you soon.
      </p>

      <form id="form" ref={formRef} onSubmit={onSubmit} className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <input
            type="text"
            name="name"
            placeholder="Name"
            required
            className="h-11 rounded-xl border border-border/60 bg-slate-100/80 dark:bg-teal-900/80 px-4 text-slate-900 dark:text-slate-100 outline-none focus:border-emerald-500"
          />
          <input
            type="email"
            name="email"
            placeholder="Email"
            required
            className="h-11 rounded-xl border border-border/60 bg-slate-100/80 dark:bg-teal-900/80 px-4 text-slate-900 dark:text-slate-100 outline-none focus:border-emerald-500"
          />
        </div>

        <input
          type="text"
          name="subject"
          placeholder="Subject"
          required
          className="h-11 w-full rounded-xl border border-border/60 bg-slate-100/80 dark:bg-teal-900/80 px-4 text-slate-900 dark:text-slate-100 outline-none focus:border-emerald-500"
        />

        <textarea
          name="message"
          placeholder="Your message"
          required
          rows={5}
          className="w-full rounded-xl border border-border/60 bg-slate-100/80 dark:bg-teal-900/80 px-4 py-3 text-slate-900 dark:text-slate-100 outline-none focus:border-emerald-500"
        />

        {submitStatus && (
          <div
            role="status"
            aria-live="polite"
            className={`rounded-xl border px-4 py-3 text-sm font-medium ${
              submitStatus.type === 'success'
                ? 'border-emerald-400/50 bg-emerald-500/10 text-emerald-300'
                : 'border-rose-400/50 bg-rose-500/10 text-rose-300'
            }`}
          >
            {submitStatus.message}
          </div>
        )}

        <button
          type="submit"
          disabled={isSubmitting}
          className="inline-flex h-11 items-center justify-center rounded-xl bg-emerald-500 px-6 font-semibold text-slate-950 transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {isSubmitting ? 'Sending...' : 'Send Message'}
        </button>
      </form>
    </section>
  )
}