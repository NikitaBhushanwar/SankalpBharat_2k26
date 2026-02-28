'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { Menu, X } from 'lucide-react';
import ThemeToggle from './theme-toggle';
import SBLogo from './logo';

const navLinks = [
  { href: '/', label: 'Home' },
  { href: '/#about', label: 'About' },
  { href: '/comming-soon', label: 'Leaderboard' },
  { href: '/comming-soon', label: 'Winners' },
  { href: '/#contact', label: 'Contact' },
];

export default function Navbar() {
  const pathname = usePathname();
  const isAdmin = pathname.startsWith('/admin');

  const [scrollProgress, setScrollProgress] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [windowDim, setWindowDim] = useState({ w: 0, h: 0 });

  useEffect(() => {
    if (isAdmin) return;

    const onResize = () =>
      setWindowDim({ w: window.innerWidth, h: window.innerHeight });

    const onScroll = () =>
      setScrollProgress(Math.min(window.scrollY / 40, 1));

    onResize();
    onScroll();

    window.addEventListener('resize', onResize);
    window.addEventListener('scroll', onScroll);

    return () => {
      window.removeEventListener('resize', onResize);
      window.removeEventListener('scroll', onScroll);
    };
  }, [isAdmin]);

  /* ================= ADMIN NAVBAR ================= */

  if (isAdmin) {
    return (
      <nav className="fixed inset-x-0 top-0 z-50 bg-white dark:bg-slate-900 shadow px-6 py-4 flex justify-between items-center">

        <div className="flex items-center gap-3">

          {/* Logo */}
          <div className="relative w-[70px] h-[70px] flex-shrink-0">
            <img
              src="/sb_logo.webp"
              className="object-contain w-full h-full"
              alt="Logo"
            />
          </div>

          {/* Name */}
          <div className="relative w-[260px] h-[70px] flex-shrink-0">
            <img
              src="/sb_name.webp"
              className="object-contain w-full h-full"
              alt="Sankalp Bharat"
            />
          </div>

        </div>

        <ThemeToggle />
      </nav>
    );
  }

  /* ================= HERO ANIMATION ================= */

  const logoInitialSize = Math.min(windowDim.w * 0.9, 520);
  const logoFinalSize = 70;

  const currentSize =
    logoInitialSize -
    (logoInitialSize - logoFinalSize) * scrollProgress;

  const nameScale = 1 - scrollProgress * 0.6;

  return (
    <>
      {/* Floating Hero Logo + Name */}
      <div
        className="fixed inset-0 z-[60] pointer-events-none flex flex-col items-center justify-center transition-all duration-300"
        style={{
          opacity: scrollProgress < 1 ? 1 : 0,
          transform: `translateY(-${scrollProgress * 120}px)`,
        }}
      >
        <SBLogo
          size={currentSize}
          showName
          nameWidth={520 * nameScale}
        />
      </div>

      {/* Navbar */}
      <nav
        className="fixed inset-x-0 top-0 z-50 transition-all duration-300"
        style={{
          opacity: scrollProgress,
          transform: `translateY(${(1 - scrollProgress) * -60}px)`,
        }}
      >
        <div className="mx-auto max-w-7xl mt-4 px-4">
          <div className="rounded-2xl border border-white/20 bg-white/90 dark:bg-slate-900/90 backdrop-blur-2xl shadow-2xl px-6 py-1 flex items-center justify-between">

            <div className="flex items-center gap-3">

              {/* Logo */}
              <div className="relative w-[70px] h-[70px] flex-shrink-0">
                <img
                  src="/sb_logo.webp"
                  className="object-contain w-full h-full"
                  alt="Logo"
                />
              </div>

              {/* Name */}
              <div className="relative w-[260px] h-[70px] flex-shrink-0">
                <img
                  src="/sb_name.webp"
                  className="object-contain w-full h-full"
                  alt="Sankalp Bharat"
                />
              </div>

            </div>

            {/* Desktop Links */}
            <div className="hidden md:flex gap-8">
              {navLinks.map(link => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-sm font-black uppercase tracking-widest text-slate-500 hover:text-orange-500 transition"
                >
                  {link.label}
                </Link>
              ))}
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3">
              <ThemeToggle />
              <Link
                href="https://unstop.com/"
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