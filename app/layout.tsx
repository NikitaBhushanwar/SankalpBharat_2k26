import React from "react"
import type { Metadata, Viewport } from 'next'
import { Texturina } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { AuthProvider } from '@/context/auth-context'
import { ThemeProvider } from '@/context/theme-provider'
import Navbar from '@/components/navbar'
import Galaxy from '@/components/Galaxy'
import FooterWrapper from '@/components/footer-wrapper'
import { Loader } from '@/components/loader'
import './globals.css'

const texturina = Texturina({
  subsets: ["latin"],
  variable: "--font-texturina",
  weight: ["700","800","900"],
});

export const metadata: Metadata = {
  title: 'Sankalp Bharat Hackathon 2026',
  description: 'Innovating Sustainable Technology for Viksit Bharat',
  icons: {
    icon: '/sb_logo.webp',
    shortcut: '/sb_logo.webp',
  },
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
      <body className={`${texturina.className} antialiased transition-colors duration-300`}>
        <ThemeProvider>
          <AuthProvider>
            <Loader />
            <Navbar />
            <div className="fixed inset-0 z-[4] pointer-events-none dark:hidden light-ambient" />
            <div className="fixed inset-0 z-[5] pointer-events-none hidden dark:block galaxy-layer">
              <Galaxy
                density={0.8}
                glowIntensity={0.55}
                twinkleIntensity={0.35}
                speed={0.95}
                saturation={0}
              />
            </div>
            <main className="relative z-10 site-glass-shell">
              {children}
            </main>
            <FooterWrapper />
            <Analytics />
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}