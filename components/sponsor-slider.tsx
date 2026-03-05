"use client";

const items = Array.from({ length: 12 }, () => "To Be Declared");

export default function SponsorSlider() {
  return (
    <section className="relative w-full py-4 sm:py-5 overflow-hidden">
      <div className="absolute inset-0 tech-grid opacity-15" />

      <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
        <div
          className="w-[220px] h-[220px] sm:w-[320px] sm:h-[320px] rounded-full blur-3xl opacity-25
                     bg-gradient-to-r from-orange-500/50 via-emerald-500/40 to-blue-500/50
                     sponsor-pulse-slow"
        />
      </div>

      <h2 className="relative z-10 text-sm sm:text-base font-black text-center mb-3 tracking-tight text-slate-900 dark:text-white uppercase">
        Sponsors
      </h2>

      <div className="relative z-10 mx-auto w-full max-w-7xl px-3 sm:px-4 lg:px-6">
        <div
          className="relative overflow-hidden rounded-2xl sm:rounded-3xl
                     border border-border/50 glass-effect
                     shadow-2xl py-2 sm:py-3 group"
        >
          <div className="pointer-events-none absolute left-0 top-0 h-full w-14 sm:w-24
                          bg-gradient-to-r from-white/90 dark:from-slate-900/60 to-transparent z-20" />
          <div className="pointer-events-none absolute right-0 top-0 h-full w-14 sm:w-24
                          bg-gradient-to-l from-white/90 dark:from-slate-900/60 to-transparent z-20" />

          <div className="flex w-max sponsor-scroll-track gap-3 sm:gap-4 md:gap-5 px-2">
            {[...items, ...items].map((label, index) => (
              <div
                key={`${label}-${index}`}
                className="flex-shrink-0 inline-flex items-center justify-center rounded-full
                           px-2 py-1 sm:px-3 sm:py-1.5 md:px-4 md:py-2
                           border border-orange-500/30 bg-orange-500/10
                           text-orange-600 dark:text-orange-300 text-[9px] sm:text-xs md:text-sm
                           font-extrabold uppercase tracking-wider"
              >
                {label}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
