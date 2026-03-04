"use client";

import { useEffect, useState } from "react";
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

interface HeroSectionProps {
  visible: boolean;
}

export function HeroSection({ visible }: HeroSectionProps) {
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
        relative min-h-screen flex items-start justify-center overflow-hidden
        transition-all duration-700 pt-14
        ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-12 pointer-events-none"}
      `}
    >
      {/* ================= BACKGROUND ================= */}
      <div className="absolute inset-0 -z-30 bg-hero-tricolor transition-all duration-500" />

      {/* Dark ambient glow layers */}
      <div className="absolute inset-0 -z-20 pointer-events-none hidden dark:block">
        <div className="absolute top-32 left-1/4 w-[420px] h-[420px] bg-green-500/10 blur-3xl rounded-full" />
        <div className="absolute bottom-32 right-1/4 w-[380px] h-[380px] bg-orange-500/10 blur-3xl rounded-full" />
      </div>

      {/* ================= FLOATING BLOBS ================= */}
      <FloatingBlob
        className="top-32 left-1/4 bg-orange-400/30 dark:bg-orange-500/15"
        size="w-[420px] h-[420px]"
      />
      <FloatingBlob
        className="bottom-32 right-1/4 bg-green-400/30 dark:bg-green-500/15"
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
      <div className="relative z-10 max-w-6xl mx-auto px-6 text-center">

        {/* Badge */}
        <div
          className="inline-flex items-center gap-2 px-5 py-2 rounded-full
                     bg-white/70 dark:bg-slate-900/60 backdrop-blur-xl
                     border border-blue-700/70 dark:border-blue-400/40
                     shadow-md dark:shadow-[0_0_25px_rgba(59,130,246,0.25)]
                     mb-10"
        >
          <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
          <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">
            National Level Hackathon 2K26
          </span>
        </div>

        <div className="mx-auto mt-2 w-[280px] sm:w-[360px] md:w-[460px] lg:w-[560px]">
          <img
            src="/sb_name.webp"
            alt="Sankalp Bharat 2K26"
            className="w-full h-auto object-contain"
          />
        </div>

        {/* Description */}
        <p
          className="mt-6 max-w-3xl mx-auto text-lg md:text-xl
                     text-slate-600 dark:text-slate-400 leading-relaxed"
        >
          Innovating
          <span className="mx-1 font-semibold bg-gradient-to-r from-green-600 to-emerald-500 dark:from-green-400 dark:to-emerald-300 bg-clip-text text-transparent">
            sustainable solutions
          </span>
          solutions for a
          <span className="mx-1 font-semibold bg-gradient-to-r from-orange-600 to-amber-500 dark:from-orange-400 dark:to-amber-300 bg-clip-text text-transparent">
            Viksit Bharat
          </span>
        </p>

        <div className="mt-10 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-blue-500/40 bg-white/85 dark:bg-slate-900/60 backdrop-blur mb-5">
            <span className="w-2 h-2 rounded-full bg-orange-400 animate-pulse" />
            <span className="text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-200 tracking-wide uppercase">Event Countdown · 17 April 2026, 09:00 AM</span>
          </div>

          {countdown.isLive ? (
            <div className="glass-effect rounded-2xl p-6 border border-emerald-500/40">
              <p className="text-2xl md:text-3xl font-black text-emerald-400">Hackathon is Live!</p>
            </div>
          ) : (
            <div className="flex items-center justify-center gap-2 sm:gap-3">
              <CountdownCard value={countdown.days} label="Days" />
              <CountdownCard value={countdown.hours} label="Hours" />
              <CountdownCard value={countdown.minutes} label="Minutes" />
              <CountdownCard value={countdown.seconds} label="Seconds" />
            </div>
          )}

          <div className="mt-6">
            <a
              href="https://unstop.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center rounded-full px-6 py-2.5 text-sm font-black uppercase tracking-wider bg-orange-500 text-white hover:bg-orange-400 transition"
            >
              Register
            </a>
          </div>
        </div>

        {/* Scroll Hint */}
        <div className="mt-20 text-sm text-slate-400 dark:text-slate-500 animate-bounce">
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
    <div className="glass-effect rounded-xl border border-orange-500/25 px-3 py-2 sm:px-4 sm:py-3 text-center card-hover min-w-[70px] sm:min-w-[88px]">
      <div className="text-2xl sm:text-3xl md:text-4xl font-black text-orange-500 dark:text-orange-400 leading-none">
        {String(value).padStart(2, '0')}
      </div>
      <div className="mt-1 text-[10px] sm:text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-300">
        {label}
      </div>
    </div>
  );
}
