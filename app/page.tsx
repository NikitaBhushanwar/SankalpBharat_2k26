'use client';

import { useEffect, useRef, useState } from 'react';
import { HeroSection } from '@/components/hero-section';
import { AboutSection } from '@/components/about-section';
import ThemesSection from '@/components/themes-section';
import { TimelineSection } from '@/components/timeline-section';
import { GuidelinesSection } from '@/components/guidelines-section';
import { RegistrationSection } from '@/components/registration-section';
import ModernFooter from '@/components/modern-footer';

export default function Home() {
  const [hasScrolled, setHasScrolled] = useState(false);
  const hasAutoSnappedRef = useRef(false);
  const introCompletedRef = useRef(false);
  const isForcingScrollRef = useRef(false);

  useEffect(() => {
    const INTRO_KEY = 'sb-home-intro-completed';
    const heroSection = document.getElementById('hackathon-2k26');

    if (!heroSection) return;

    introCompletedRef.current = localStorage.getItem(INTRO_KEY) === 'true';

    if (introCompletedRef.current) {
      hasAutoSnappedRef.current = true;
      setHasScrolled(true);
      requestAnimationFrame(() => {
        heroSection.scrollIntoView({ behavior: 'auto', block: 'start' });
      });
    }

    const onScroll = () => {
      const heroTop = heroSection.getBoundingClientRect().top + window.scrollY;

      if (window.scrollY > 0) {
        setHasScrolled(true);
      }

      if (
        !hasAutoSnappedRef.current &&
        window.scrollY > 10 &&
        window.scrollY < heroTop
      ) {
        hasAutoSnappedRef.current = true;
        introCompletedRef.current = true;
        localStorage.setItem(INTRO_KEY, 'true');

        heroSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }

      if (
        introCompletedRef.current &&
        window.scrollY < heroTop &&
        !isForcingScrollRef.current
      ) {
        isForcingScrollRef.current = true;
        window.scrollTo({ top: heroTop, behavior: 'auto' });
        requestAnimationFrame(() => {
          isForcingScrollRef.current = false;
        });
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
