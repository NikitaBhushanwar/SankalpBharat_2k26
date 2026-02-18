"use client";

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
  return (
    <section
      className={`
        relative min-h-screen flex items-center justify-center overflow-hidden
        transition-all duration-700 mt-170
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
            National Innovation Hackathon 2026
          </span>
        </div>

        {/* Title */}
        <h1
          className="text-4xl md:text-6xl lg:text-8xl font-black tracking-tight
                     text-slate-900 dark:text-white
                     dark:drop-shadow-[0_0_14px_rgba(255,255,255,0.15)]"
        >
          SANKALP BHARAT
        </h1>

        {/* Subtitle */}
        <h2
          className="mt-4 text-2xl md:text-4xl font-black tracking-tight
                     bg-gradient-to-r
                     from-orange-500 via-green-500 to-blue-500
                     dark:from-orange-400 dark:via-green-400 dark:to-blue-400
                     bg-clip-text text-transparent"
        >
          HACKATHON 2026
        </h2>

        {/* Description */}
        <p
          className="mt-6 max-w-3xl mx-auto text-lg md:text-xl
                     text-slate-600 dark:text-slate-400 leading-relaxed"
        >
          Innovating
          <span className="mx-1 font-semibold bg-gradient-to-r from-green-600 to-emerald-500 dark:from-green-400 dark:to-emerald-300 bg-clip-text text-transparent">
            sustainable
          </span>
          and
          <span className="mx-1 font-semibold bg-gradient-to-r from-blue-600 to-cyan-500 dark:from-blue-400 dark:to-cyan-300 bg-clip-text text-transparent">
            technology-driven
          </span>
          solutions for a
          <span className="mx-1 font-semibold bg-gradient-to-r from-orange-600 to-amber-500 dark:from-orange-400 dark:to-amber-300 bg-clip-text text-transparent">
            Viksit Bharat
          </span>
        </p>

        {/* Stats */}
        <div className="mt-16 grid grid-cols-3 gap-8 max-w-3xl mx-auto">
          <Stat value="₹10L+" label="Prize Pool" />
          <Stat value="500+" label="Participants" />
          <Stat value="48 Hrs" label="Innovation Sprint" />
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

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div className="text-center">
      <div className="text-3xl md:text-4xl font-black text-blue-700 dark:text-blue-400 dark:drop-shadow-[0_0_8px_rgba(59,130,246,0.5)]">
        {value}
      </div>
      <div className="mt-1 text-sm text-slate-500 dark:text-slate-400">
        {label}
      </div>
    </div>
  );
}
