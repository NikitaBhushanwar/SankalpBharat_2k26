import { HeroSection } from '@/components/hero-section'
import { AboutSection } from '@/components/about-section'
import { ThemesSection } from '@/components/themes-section'
import { TimelineSection } from '@/components/timeline-section'
import { GuidelinesSection } from '@/components/guidelines-section'
import { RegistrationSection } from '@/components/registration-section'
import ModernFooter from '@/components/modern-footer'

export default function Home() {
  return (
    <>
      <main className="min-h-screen">
        <HeroSection />
        <AboutSection />
        <ThemesSection />
        <TimelineSection />
        <GuidelinesSection />
        <RegistrationSection />
      </main>
      <ModernFooter />
    </>
  )
}
