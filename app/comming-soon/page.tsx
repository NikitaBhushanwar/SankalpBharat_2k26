import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Comming Soon - Sankalp Bharat 2K26',
  description: 'This section is under preparation and will be available soon.',
}

export default function CommingSoonPage() {
  return (
    <main className="min-h-screen px-6 py-20 max-w-4xl mx-auto flex items-center justify-center">
      <div className="w-full glass-effect rounded-2xl p-10 md:p-14 text-center">
        <p className="text-xs font-mono text-accent tracking-widest uppercase mb-4">Sankalp Bharat 2K26</p>
        <h1 className="text-4xl md:text-6xl font-black mb-4">Comming Soon</h1>
        <p className="text-muted-foreground text-base md:text-lg mb-10">
          The Winners and Leaderboard sections are being finalized and will be live shortly.
        </p>
        <Link href="/" className="btn-modern inline-block">
          Back to Home
        </Link>
      </div>
    </main>
  )
}
