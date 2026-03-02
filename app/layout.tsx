import React from "react"
import type { Metadata, Viewport } from 'next'
import { Geist } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { AuthProvider } from '@/context/auth-context'
import { ThemeProvider } from '@/context/theme-provider'
import Navbar from '@/components/navbar'
import Galaxy from '@/components/Galaxy'
import './globals.css'

const geist = Geist({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: 'Sankalp Bharat Hackathon 2026',
  description: 'Innovating Sustainable Technology for Viksit Bharat',
};

export const viewport: Viewport = {
  themeColor: '#10b981',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body className={`${geist.className} antialiased transition-colors duration-300`}>
        <ThemeProvider>
          <AuthProvider>
            <Navbar />
            <div className="fixed inset-0 z-[5] pointer-events-none">
              <Galaxy
                mouseRepulsion
                mouseInteraction
                density={1}
                glowIntensity={0.3}
                saturation={0}
                hueShift={140}
                twinkleIntensity={0.3}
                rotationSpeed={0.1}
                repulsionStrength={2}
                autoCenterRepulsion={0}
                starSpeed={0.5}
                speed={1}
                transparent
              />
            </div>
            <main className="relative z-10">
              {children}
            </main>
            <Analytics />
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}