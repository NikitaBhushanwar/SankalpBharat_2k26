"use client";

import { useEffect, useState } from "react";
import SponsorSlider from "./sponsor-slider";
import {
  Leaf,
  TreePine,
  Droplets,
  Recycle,
  Wind,
  Sprout,
  Wheat,
  Tractor,
  Cpu,
  CircuitBoard,
} from "lucide-react";
import { useRegistrationLink } from '@/lib/use-registration-link';

interface HeroSectionProps {
  visible: boolean;
}

export function HeroSection({ visible }: HeroSectionProps) {
  const registrationLink = useRegistrationLink();
  const [countdown, setCountdown] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
    isLive: false,
  });

  useEffect(() => {
    const eventDate = new Date('2026-04-17T09:00:00+05:30').getTime();

    const updateCountdown = () => {
      const now = new Date().getTime();
      const distance = eventDate - now;

      if (distance <= 0) {
        setCountdown({ days: 0, hours: 0, minutes: 0, seconds: 0, isLive: true });
        return;
      }

      const days = Math.floor(distance / (1000 * 60 * 60 * 24));
      const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((distance % (1000 * 60)) / 1000);

      setCountdown({ days, hours, minutes, seconds, isLive: false });
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <section
      id="hackathon-2k26"
      className={`
        relative min-h-[86vh] sm:min-h-screen flex items-start justify-center overflow-hidden
        transition-all duration-700 pt-20 sm:pt-15
        ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-12 pointer-events-none"}
      `}
    >
      {/* ================= BACKGROUND ================= */}
      <div className="absolute inset-0 -z-30 bg-hero-tricolor transition-all duration-500" />

      {/* Dark ambient glow layers */}
      <div className="absolute inset-0 -z-20 pointer-events-none hidden dark:block">
        <div className="absolute top-32 left-1/4 w-[420px] h-[420px] bg-sky-500/8 blur-3xl rounded-full" />
        <div className="absolute bottom-32 right-1/4 w-[380px] h-[380px] bg-orange-500/10 blur-3xl rounded-full" />
      </div>

      {/* ================= FLOATING BLOBS ================= */}
      <FloatingBlob
        className="top-32 left-1/4 bg-orange-400/30 dark:bg-orange-500/15"
        size="w-[420px] h-[420px]"
      />
      <FloatingBlob
        className="bottom-32 right-1/4 bg-blue-400/20 dark:bg-blue-500/10"
        size="w-[380px] h-[380px]"
      />
      <FloatingBlob
        className="top-1/3 right-24 bg-blue-400/30 dark:bg-blue-500/15"
        size="w-[260px] h-[260px]"
      />

      {/* ================= DOODLES ================= */}
      <div className="hidden lg:block">
        <FloatingIcon icon={<TreePine />} className="top-24 left-16 text-green-600 dark:text-green-400" />
        <FloatingIcon icon={<Droplets />} className="top-[45%] left-28 text-sky-500 dark:text-sky-400" />
        <FloatingIcon icon={<Wind />} className="bottom-28 left-20 text-teal-500 dark:text-teal-400" />

        <FloatingIcon icon={<Sprout />} className="top-32 right-24 text-emerald-600 dark:text-emerald-400" />
        <FloatingIcon icon={<Wheat />} className="top-[60%] right-36 text-lime-600 dark:text-lime-400" />
        <FloatingIcon icon={<Tractor />} className="bottom-24 right-28 text-green-700 dark:text-green-500 scale-90" />

        <FloatingIcon icon={<Recycle />} className="top-[18%] left-[52%] text-green-500 dark:text-green-400 scale-90" />
        <FloatingIcon icon={<Leaf />} className="bottom-[22%] right-[52%] text-emerald-500 dark:text-emerald-400 scale-90" />

        <FloatingIcon icon={<Cpu />} className="top-[30%] left-[70%] text-blue-500 dark:text-blue-400 scale-75" />
        <FloatingIcon icon={<CircuitBoard />} className="bottom-[35%] right-[70%] text-indigo-500 dark:text-indigo-400 scale-75" />
      </div>

      {/* ================= CONTENT ================= */}
      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 text-center">
        
        <div className="relative mx-auto -mt-4 sm:-mt-3 w-[220px] sm:w-[300px] md:w-[390px] lg:w-[500px] xl:w-[620px]">
          <div className="pointer-events-none absolute inset-0 -z-10 rounded-2xl bg-slate-950/45 blur-xl" />
          <div className="pointer-events-none absolute -inset-x-3 -inset-y-2 -z-10 rounded-3xl bg-cyan-400/20 blur-2xl" />
          <img
            src="/svpcet_logo.webp"
            alt="SVPCET Logo"
            className="w-full h-auto object-contain"
          />
        </div>
        
        <p
          className="-mt-4 sm:-mt-10 max-w-2xl mx-auto text-xs md:text-sm
                     text-foreground/80 leading-relaxed"
        >
         PRESENTS
        </p>

        <p
          className="mt-0 inline-flex max-w-3xl mx-auto rounded-xl bg-slate-950/35 px-3 py-1 text-base sm:text-2xl md:text-3xl
                     text-muted-foreground leading-relaxed backdrop-blur-[2px]"
        >
          <span className="mx-1 tracking-widest font-extrabold bg-gradient-to-r from-red-700 via-orange-400 to-red-500 dark:from-red-700 dark:via-orange-400 dark:to-red-500 bg-clip-text text-transparent drop-shadow-[0_0_10px_rgba(251,146,60,0.7)]">
            NATIONAL  LEVEL  HACKATHON
          </span>
        </p>

        <div className="relative mx-auto mt-0 max-w-[150px] sm:max-w-[190px] md:max-w-[220px] overflow-visible">
          <div className="pointer-events-none absolute inset-0 -z-10 rounded-full bg-slate-950/45 blur-xl" />
          <div className="pointer-events-none absolute -inset-2 -z-10 rounded-full bg-cyan-400/45 blur-2xl" />
          <img
            src="/sb_logo.webp"
            alt="Sankalp Bharat 2K26"
            className="w-full h-auto object-contain blue-glow"
          />
        </div>
        
        <div className="relative mx-auto mt-0 max-w-[150px] sm:max-w-[190px] md:max-w-[220px] overflow-visible">
          <div className="pointer-events-none absolute inset-0 -z-10 rounded-full bg-slate-950/45 blur-xl" />
          <div className="pointer-events-none absolute -inset-2 -z-10 rounded-full bg-orange-400/45 blur-2xl" />
          <img
            src="/sb_name.webp"
            alt="Sankalp Bharat 2K26"
            className="w-full h-auto object-contain white-glow"
          />
        </div>


        {/* Description */}
        <p
          className="mt-2 max-w-3xl mx-auto px-2 py-1 text-xs sm:text-base md:text-lg
                     text-foreground/90 leading-relaxed rounded-xl bg-slate-950/25 backdrop-blur-[2px]"
        >
          Innovating
          <span className="mx-1 font-semibold bg-gradient-to-r from-green-600 to-emerald-500 dark:from-green-400 dark:to-emerald-300 bg-clip-text text-transparent">
            sustainable
          </span>
          solutions for a
          <span className="mx-1 font-semibold bg-gradient-to-r from-orange-600 to-amber-500 dark:from-orange-400 dark:to-amber-300 bg-clip-text text-transparent">
            Viksit Bharat
          </span>
        </p>

        <div className="mt-3 max-w-3xl mx-auto">
          <div className="inline-flex max-w-full flex-wrap items-center justify-center gap-2 px-3 py-2 sm:px-4 sm:py-1.5 rounded-full border border-primary/40 bg-slate-950/70 backdrop-blur mb-5 shadow-sm">
            <span className="w-2 h-2 rounded-full bg-orange-400 animate-pulse" />
            <span className="text-[10px] sm:text-xs font-semibold text-foreground tracking-wide uppercase">Event Countdown · 17 April 2026, 09:00 AM</span>
          </div>

          {countdown.isLive ? (
            <div className="glass-effect rounded-2xl p-6 border border-emerald-500/40">
              <p className="text-xl sm:text-2xl md:text-3xl font-black text-emerald-400">Hackathon is Live!</p>
            </div>
          ) : (
            <div className="flex items-center justify-center gap-0 sm:gap-1">
              <CountdownCard value={countdown.days} label="Days" />
              <CountdownCard value={countdown.hours} label="Hours" />
              <CountdownCard value={countdown.minutes} label="Minutes" />
              <CountdownCard value={countdown.seconds} label="Seconds" />
            </div>
          )}

         
        </div>

        {/* Sponsors placed within hero */}
        <div className="mt-4 sm:mt-6">
          <SponsorSlider />
        </div>

        {/* Scroll Hint */}
        <div className="mt-4 sm:mt-8 text-sm text-muted-foreground animate-bounce">
          Explore ↓
        </div>
      </div>
    </section>
  );
}

/* ================= HELPERS ================= */

function FloatingBlob({
  className,
  size,
}: {
  className: string;
  size: string;
}) {
  return (
    <div
      className={`absolute ${className} ${size}
                  rounded-full blur-3xl animate-float`}
    />
  );
}

function FloatingIcon({
  icon,
  className,
}: {
  icon: React.ReactNode;
  className: string;
}) {
  return (
    <div className={`absolute ${className} animate-drift opacity-70`}>
      <div className="w-10 h-10 flex items-center justify-center">
        {icon}
      </div>
    </div>
  );
}

function CountdownCard({ value, label }: { value: number; label: string }) {
  return (
    <div className="glass-effect rounded-xl border border-orange-500/25 px-2.5 py-1.5 sm:px-2 sm:py-1.5 text-center card-hover min-w-[64px] sm:min-w-[60px]">
      <div className="text-2xl sm:text-xl md:text-2xl font-black text-orange-500 dark:text-orange-400 leading-none">
        {String(value).padStart(2, '0')}
      </div>
      <div className="mt-1 text-[10px] sm:text-[9px] font-semibold uppercase tracking-wide text-muted-foreground">
        {label}
      </div>
    </div>
  );
}