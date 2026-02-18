interface SBLogoProps {
  className?: string;
  showTitle?: boolean;
}

export default function SBLogo({ className, showTitle = false }: SBLogoProps) {
  return (
    <div className="flex flex-col items-center justify-center">
      
      {/* SVG LOGO */}
      <svg
        viewBox="0 0 100 100"
        className={className}
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="sbGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#f97316" />
            <stop offset="40%" stopColor="#ffffff" />
            <stop offset="100%" stopColor="#16a34a" />
          </linearGradient>
        </defs>

        <rect width="100" height="100" rx="45" fill="url(#sbGradient)" />
        <text
          x="50%"
          y="55%"
          textAnchor="middle"
          dominantBaseline="middle"
          fontSize="42"
          fontWeight="900"
          fill="black"
          fontFamily="Inter, system-ui, sans-serif"
        >
          SB
        </text>
      </svg>

      {/* TITLE BELOW LOGO */}
      {showTitle && (
        <h1
          className="mt-6 text-3xl md:text-4xl font-black tracking-[0.18em]
                     text-slate-900 dark:text-white
                     transition-all duration-1000 ease-out
                     animate-fade-up"
        >
          SANKALP BHARAT
        </h1>
      )}
    </div>
  );
}
