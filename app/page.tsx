'use client';

import { HeroSection } from '@/components/hero-section';
import { AboutSection } from '@/components/about-section';
import SponsorSlider from '@/components/sponsor-slider';
import ThemesSection from '@/components/themes-section';
import { TimelineSection } from '@/components/timeline-section';
import { GuidelinesSection } from '@/components/guidelines-section';
import { RegistrationSection } from '@/components/registration-section';
import WhatsAppCommunityFab from '@/components/whatsapp-community-fab';

export default function Home() {
  return (
    <main className="min-h-screen">
      <HeroSection visible />
      <WhatsAppCommunityFab />
      <AboutSection />
      <ThemesSection />
      <TimelineSection />
      <GuidelinesSection />
      <RegistrationSection />
    </main>
  );
}
