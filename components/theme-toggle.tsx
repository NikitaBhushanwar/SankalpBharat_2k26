'use client';

import { Moon, Sun } from 'lucide-react';
import { useTheme } from '@/context/theme-provider';

export default function ThemeToggle() {
  const { isDark, setTheme } = useTheme();

  return (
    <button
      type="button"
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
      className="relative inline-flex h-9 w-16 items-center rounded-full
                 border border-black/10 dark:border-white/10
                 bg-white/70 dark:bg-slate-800/70
                 px-1 backdrop-blur transition active:scale-95 shadow-sm"
    >
      {/* Sliding Circle */}
      <span
        className={`
          inline-flex h-7 w-7 items-center justify-center rounded-full
          bg-white dark:bg-slate-100 shadow-md transition-transform duration-300 z-10
          ${isDark ? 'translate-x-0' : 'translate-x-7'}
        `}
      >
        {isDark ? (
          <Moon size={12} className="text-slate-700" />
        ) : (
          <Sun size={12} className="text-amber-500" />
        )}
      </span>

      <Sun size={12} className="absolute right-2 text-amber-500 opacity-40" />
      <Moon size={12} className="absolute left-2 text-slate-400 opacity-40" />
    </button>
  );
}
