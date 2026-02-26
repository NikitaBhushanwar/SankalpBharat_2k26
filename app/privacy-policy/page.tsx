import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Privacy Policy - Sankalp Bharat 2K26',
  description: 'Privacy policy for Sankalp Bharat 2K26 website.',
}

export default function PrivacyPolicyPage() {
  return (
    <main className="min-h-screen px-6 py-16 max-w-4xl mx-auto">
      <h1 className="text-4xl font-black mb-6">Privacy Policy</h1>
      <p className="text-muted-foreground mb-4">
        This website collects only the minimum information required for event communication and registration handling.
      </p>
      <p className="text-muted-foreground mb-4">
        Participant data is used strictly for Sankalp Bharat 2K26 operations, updates, and coordination with organizing partners.
      </p>
      <p className="text-muted-foreground mb-10">
        For privacy-related requests, contact the organizing team at cse@stvincentngp.edu.in.
      </p>
      <Link href="/" className="btn-modern inline-block">Back to Home</Link>
    </main>
  )
}
