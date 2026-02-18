'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { Menu, X } from 'lucide-react';
import ThemeToggle from './theme-toggle';
import Logo from './logo';

const navLinks = [
  { href: '/', label: 'Home' },
  { href: '#about', label: 'About' },
  { href: '#leaderboard', label: 'Leaderboard' },
  { href: '/winners', label: 'Winners' },
  { href: '#contact', label: 'Contact' },
];

export default function Navbar() {
  const [scrollProgress, setScrollProgress] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [windowDim, setWindowDim] = useState({ w: 0, h: 0 });

  /* --------------------------------------------
     Window + Scroll Tracking (REFERENCE STYLE)
  --------------------------------------------- */
  useEffect(() => {
    const onResize = () =>
      setWindowDim({ w: window.innerWidth, h: window.innerHeight });

    const onScroll = () =>
      setScrollProgress(Math.min(window.scrollY / 450, 1));

    onResize();
    onScroll();

    window.addEventListener('resize', onResize);
    window.addEventListener('scroll', onScroll, { passive: true });

    return () => {
      window.removeEventListener('resize', onResize);
      window.removeEventListener('scroll', onScroll);
    };
  }, []);

  /* --------------------------------------------
     Logo Diagonal Math 
  --------------------------------------------- */
  const logoInitialSize = Math.min(windowDim.w * 0.8, 380);
  const logoFinalSize = 44;

  const containerWidth = Math.min(windowDim.w, 1280);
  const paddingX = windowDim.w > 640 ? 32 : 16;

  // Navbar logo slot center (KNOWN GEOMETRY)
  const targetX =
    (windowDim.w - containerWidth) / 2 +
    paddingX +
    logoFinalSize / 2;

  const targetY = 28 + logoFinalSize / 2;

  // Hero center start
  const centerX = windowDim.w / 2;
  const centerY = windowDim.h / 2 - 120;

  // Interpolation
  const currentX = centerX + (targetX - centerX) * scrollProgress;
  const currentY = centerY + (targetY - centerY) * scrollProgress;
  const currentSize =
    logoInitialSize -
    (logoInitialSize - logoFinalSize) * scrollProgress;

  /* --------------------------------------------
     Navbar Entrance
  --------------------------------------------- */
  const navOpacity =
    scrollProgress > 0.4 ? (scrollProgress - 0.4) * 2 : 0;

  const navY = -100 + Math.min(scrollProgress * 160, 100);

  return (
    <>
      {/* ================= Floating Logo + Intro Title ================= */}
<div
  className="fixed z-[60] pointer-events-none flex flex-col items-center"
  style={{
    left: `${currentX}px`,
    top: `${currentY}px`,
    transform: 'translate(-50%, -50%)',
  }}
>
  {/* Logo */}
  <div
    style={{
      width: `${currentSize}px`,
      height: `${currentSize}px`,
    }}
  >
    <Logo className="w-full h-full drop-shadow-2xl" />
  </div>

  {/* Intro Text (Only when at top) */}
  {scrollProgress < 0.05 && (
    <h1
      className="mt-8 text-3xl md:text-4xl font-black tracking-[0.2em]
                 text-slate-900 dark:text-white
                 transition-all duration-1000 ease-out
                 animate-intro-title"
    >
      SANKALP BHARAT
    </h1>
  )}
</div>


      {/* ================= Floating Navbar ================= */}
      <nav
        className="fixed inset-x-0 top-0 z-50 transition-all duration-500"
        style={{
          opacity: navOpacity,
          transform: `translateY(${navY}px)`,
          pointerEvents: scrollProgress > 0.45 ? 'auto' : 'none',
        }}
      >
        <div className="mx-auto max-w-7xl mt-4 px-4">
          <div className="rounded-2xl border border-white/20 bg-white/90 dark:bg-slate-900/90 backdrop-blur-2xl shadow-2xl px-6 py-3 flex items-center justify-between">

            {/* Branding */}
            <div className="flex items-center gap-4 min-w-[240px]">
              <div className="w-[44px] h-[44px]" />
              <div className="h-8 w-px bg-gray-300 dark:bg-slate-700" />
              <div className="leading-tight">
                <div className="text-sm font-black uppercase tracking-wide">
                  Sankalp Bharat
                </div>
                <div className="text-xs font-semibold text-orange-500">
                  National Innovation Event
                </div>
              </div>
            </div>

            {/* Desktop Links */}
            <div className="hidden md:flex gap-8">
              {navLinks.map(link => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-xs font-black uppercase tracking-widest text-slate-500 hover:text-orange-500 transition"
                >
                  {link.label}
                </Link>
              ))}
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3">
              <ThemeToggle />
              <Link
                href="/register"
                className="hidden sm:block bg-orange-500 text-white px-5 py-2 rounded-full text-sm font-black shadow-lg hover:scale-105 transition"
              >
                Register
              </Link>
              <button
                onClick={() => setIsOpen(!isOpen)}
                className="md:hidden p-2 rounded-xl bg-slate-100 dark:bg-slate-800"
              >
                {isOpen ? <X size={20} /> : <Menu size={20} />}
              </button>
            </div>
          </div>
        </div>
      </nav>
    </>
  );
}
