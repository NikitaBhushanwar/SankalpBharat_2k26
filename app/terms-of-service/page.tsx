import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Terms of Service - Sankalp Bharat 2K26',
  description: 'Terms of service for Sankalp Bharat 2K26 website.',
}

export default function TermsOfServicePage() {
  return (
    <main className="min-h-screen px-6 py-16 max-w-4xl mx-auto">
      <h1 className="text-4xl font-black mb-6">Terms of Service</h1>
      <p className="text-muted-foreground mb-4">
        By using this website, participants agree to follow event timelines, submission rules, and code of conduct defined by organizers.
      </p>
      <p className="text-muted-foreground mb-4">
        All submissions must be original and must comply with the evaluation and checkpoint requirements of Sankalp Bharat 2K26.
      </p>
      <p className="text-muted-foreground mb-10">
        The organizing committee reserves the right to take final decisions on eligibility, evaluations, and disputes.
      </p>
      <Link href="/" className="btn-modern inline-block">Back to Home</Link>
    </main>
  )
}
