'use client';

import Link from 'next/link';
import { useState } from 'react';
import { usePathname } from 'next/navigation';
import { Menu, X } from 'lucide-react';
import { useRegistrationLink } from '@/lib/use-registration-link';

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
  const registrationLink = useRegistrationLink();
  const isActiveLink = (href: string) => {
    if (href === '/') {
      return pathname === '/';
    }

    return pathname === href || pathname.startsWith(`${href}/`);
  };

  /* ================= ADMIN NAVBAR ================= */

  if (isAdmin) {
    return (
      <nav className="fixed inset-x-0 top-3 z-50">
        <div className="mx-auto max-w-7xl px-4">
          <div className="rounded-2xl border border-cyan-500/30 bg-slate-950/80 backdrop-blur-2xl shadow-[0_0_36px_rgba(6,182,212,0.16),0_8px_32px_rgba(0,0,0,0.42)] px-4 sm:px-6 py-2 flex justify-between items-center relative overflow-hidden">
            <div className="pointer-events-none absolute inset-x-10 top-0 h-px bg-gradient-to-r from-transparent via-cyan-400/80 to-transparent" />
            <div className="pointer-events-none absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-cyan-500/10 to-transparent" />
            <div className="pointer-events-none absolute inset-y-0 right-0 w-24 bg-gradient-to-l from-blue-500/10 to-transparent" />

            <Link href="/" className="flex items-center gap-4 min-w-0" aria-label="Go to homepage">
              <div className="overflow-visible">
                <img
                  src="/sb_logo.webp"
                  className="h-16 sm:h-18 lg:h-20 w-auto object-contain blue-glow"
                  alt="Logo"
                />
              </div>

              <img
                src="/sb_name.webp"
                className="h-10 sm:h-12 w-auto object-contain"
                alt="Sankalp Bharat"
              />
            </Link>

          </div>
        </div>
      </nav>
    );
  }

  /* ================= MAIN NAVBAR ================= */

  return (
    <nav className="fixed inset-x-0 top-3 z-50">
      <div className="mx-auto max-w-7xl px-4">
        <div className="rounded-2xl border border-cyan-500/30 bg-slate-950/78 backdrop-blur-2xl shadow-[0_0_34px_rgba(6,182,212,0.14),0_8px_32px_rgba(0,0,0,0.42)] px-3 sm:px-6 py-2 flex items-center justify-between gap-3 relative overflow-hidden">
          <div className="pointer-events-none absolute inset-x-10 top-0 h-px bg-gradient-to-r from-transparent via-cyan-400/80 to-transparent" />
          <div className="pointer-events-none absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-cyan-500/10 to-transparent" />
          <div className="pointer-events-none absolute inset-y-0 right-0 w-24 bg-gradient-to-l from-blue-500/10 to-transparent" />
          <div className="pointer-events-none absolute -left-10 top-1/2 h-20 w-20 -translate-y-1/2 rounded-full bg-cyan-500/8 blur-2xl" />
          <div className="pointer-events-none absolute -right-8 top-1/2 h-16 w-16 -translate-y-1/2 rounded-full bg-blue-500/8 blur-2xl" />

          {/* Logo Section */}
          <Link href="/" className="flex items-center gap-2 sm:gap-4 min-w-0 flex-1" aria-label="Go to homepage">
            <div className="overflow-visible">
            <img
              src="/sb_logo.webp"
              className="h-10 sm:h-14 lg:h-16 w-auto object-contain flex-shrink-0 blue-glow"
              alt="Logo"
            />
            </div>

            <div className="overflow-visible">
              <img
                src="/sb_name.webp"
                className="h-6 sm:h-10 w-auto max-w-[150px] sm:max-w-none object-contain white-glow"
                alt="Sankalp Bharat"
              />
            </div>
          </Link>

          {/* Desktop Links */}
          <div className="hidden md:flex gap-8">
            {navLinks.map(link => (
              <Link
                key={link.href}
                href={link.href}
                className={`text-sm font-black uppercase tracking-widest transition-all duration-200 ${
                  isActiveLink(link.href)
                    ? 'text-cyan-300 drop-shadow-[0_0_8px_rgba(6,182,212,0.55)]'
                    : 'text-slate-300/85 hover:text-cyan-300 hover:drop-shadow-[0_0_8px_rgba(6,182,212,0.8)]'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 sm:gap-4 flex-shrink-0">
            <Link
              href={registrationLink}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white px-3 sm:px-5 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-black shadow-[0_0_20px_rgba(6,182,212,0.38)] hover:shadow-[0_0_30px_rgba(6,182,212,0.55)] hover:scale-105 transition-all duration-200"
            >
              Register
            </Link>

           <button
              onClick={() => setIsOpen(!isOpen)}
              className="md:hidden p-2 rounded-xl bg-background/80 border border-border/70"
              aria-label="Toggle mobile menu"
            >
              {isOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>

        </div>

        {isOpen && (
          <div className="md:hidden mt-2 rounded-2xl border border-cyan-500/25 bg-card/85 backdrop-blur-2xl shadow-[0_0_30px_rgba(6,182,212,0.1),0_8px_32px_rgba(0,0,0,0.5)] px-4 py-4 space-y-3">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setIsOpen(false)}
                className={`block text-sm font-black uppercase tracking-widest transition-all duration-200 ${
                  isActiveLink(link.href)
                    ? 'text-cyan-300'
                    : 'text-slate-200/90 hover:text-cyan-300 hover:drop-shadow-[0_0_6px_rgba(6,182,212,0.7)]'
                }`}
              >
                {link.label}
              </Link>
            ))}

          </div>
        )}
      </div>
    </nav>
  );
}
