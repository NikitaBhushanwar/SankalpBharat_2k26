'use client';

import { useEffect, useState } from 'react';
import { HeroSection } from '@/components/hero-section';
import { AboutSection } from '@/components/about-section';
import { ThemesSection } from '@/components/themes-section';
import { TimelineSection } from '@/components/timeline-section';
import { GuidelinesSection } from '@/components/guidelines-section';
import { RegistrationSection } from '@/components/registration-section';
import ModernFooter from '@/components/modern-footer';

export default function Home() {
  const [hasScrolled, setHasScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      if (window.scrollY > 0) {
        setHasScrolled(true);
        window.removeEventListener('scroll', onScroll);
      }
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <>
      <main className="min-h-screen">
        <HeroSection visible={hasScrolled} />
        <AboutSection />
        <ThemesSection />
        <TimelineSection />
        <GuidelinesSection />
        <RegistrationSection />
      </main>
      <ModernFooter />
    </>
  );
}
