'use client';

import Link from 'next/link';
import { useState } from 'react';
import { usePathname } from 'next/navigation';
import { Menu, X } from 'lucide-react';
import ThemeToggle from './theme-toggle';

const navLinks = [
  { href: '/', label: 'Home' },
  { href: '/about-event', label: 'About' },
  { href: '/problem-statements', label: 'Problems' },
  { href: '/comming-soon', label: 'Sponsors' },
  { href: '/contact-us', label: 'Contact' },
];

export default function Navbar() {
  const pathname = usePathname();
  const isAdmin = pathname.startsWith('/admin');
  const [isOpen, setIsOpen] = useState(false);

  /* ================= ADMIN NAVBAR ================= */

  if (isAdmin) {
    return (
      <nav className="fixed inset-x-0 top-3 z-50 bg-white dark:bg-slate-900 shadow px-6 py-2 flex justify-between items-center">
        
        <Link href="/" className="flex items-center gap-4" aria-label="Go to homepage">
          {/* Bigger Logo */}
          <img
            src="/sb_logo.webp"
            className="h-16 sm:h-18 lg:h-20 w-auto object-contain"
            alt="Logo"
          />

          {/* Name */}
          <img
            src="/sb_name.webp"
            className="h-10 sm:h-12 w-auto object-contain"
            alt="Sankalp Bharat"
          />
        </Link>

        <ThemeToggle />
      </nav>
    );
  }

  /* ================= MAIN NAVBAR ================= */

  return (
    <nav className="fixed inset-x-0 top-3 z-50">
      <div className="mx-auto max-w-7xl px-4">
        <div className="rounded-2xl border border-white/20 bg-white/90 dark:bg-slate-900/90 backdrop-blur-2xl shadow-2xl px-3 sm:px-6 py-2 flex items-center justify-between gap-3">

          {/* Logo Section */}
          <Link href="/" className="flex items-center gap-2 sm:gap-4 min-w-0 flex-1" aria-label="Go to homepage">
            <img
              src="/sb_logo.webp"
              className="h-10 sm:h-14 lg:h-16 w-auto object-contain flex-shrink-0"
              alt="Logo"
            />

            <img
              src="/sb_name.webp"
              className="h-6 sm:h-10 w-auto max-w-[150px] sm:max-w-none object-contain"
              alt="Sankalp Bharat"
            />
          </Link>

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
          <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
            <div className="hidden md:block">
              <ThemeToggle />
            </div>

            <Link
              href="https://unstop.com/"
              className="bg-orange-500 text-white px-3 sm:px-5 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-black shadow-lg hover:scale-105 transition"
            >
              Register
            </Link>

           <button
              onClick={() => setIsOpen(!isOpen)}
              className="md:hidden p-2 rounded-xl bg-slate-100 dark:bg-slate-800"
              aria-label="Toggle mobile menu"
            >
              {isOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>

        </div>

        {isOpen && (
          <div className="md:hidden mt-2 rounded-2xl border border-white/20 bg-white/90 dark:bg-slate-900/90 backdrop-blur-2xl shadow-2xl px-4 py-4 space-y-3">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setIsOpen(false)}
                className="block text-sm font-black uppercase tracking-widest text-slate-600 dark:text-slate-300 hover:text-orange-500 transition"
              >
                {link.label}
              </Link>
            ))}

            <div className="pt-2 border-t border-slate-200/60 dark:border-slate-700/60 flex items-center justify-start">
              <ThemeToggle />
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}