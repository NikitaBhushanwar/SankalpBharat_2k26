import React from "react"
import type { Metadata, Viewport } from 'next'
import { Geist } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { AuthProvider } from '@/context/auth-context'
import { ThemeProvider } from '@/context/theme-provider'
import Navbar from '@/components/navbar'
import InteractiveBackground from '@/components/interactive-background'
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
    <html lang="en" suppressHydrationWarning>
      <body className={`${geist.className} antialiased transition-colors duration-300`}>
        <ThemeProvider>
          <AuthProvider>
            <Navbar />
            <InteractiveBackground />
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