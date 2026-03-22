'use client';

import Link from 'next/link';
import { useState } from 'react';
import { usePathname } from 'next/navigation';
import { Menu, X } from 'lucide-react';
import { useRegistrationLink } from '@/lib/use-registration-link';
import { useNavbarVisibility } from '@/lib/use-navbar-visibility';

const navLinks = [
  { href: '/', label: 'Home' },
  { href: '/about-event', label: 'About' },
  { href: '/leaderboard', label: 'Leaderboard', visibilityKey: 'leaderboard' as const },
  { href: '/winners', label: 'Winners', visibilityKey: 'winners' as const },
  { href: '/problem-statements', label: 'Problem Statements' },
  { href: '/qualified-teams', label: 'Qualified Teams', visibilityKey: 'qualifiedTeams' as const },
  { href: '/sponsors', label: 'Sponsors' },
  { href: '/contact-us', label: 'Contact' },
];

export default function Navbar() {
  const pathname = usePathname();
  const isAdmin = pathname.startsWith('/admin');
  const [isOpen, setIsOpen] = useState(false);
  const registrationLink = useRegistrationLink();
  const navbarVisibility = useNavbarVisibility();

  const filteredNavLinks = navLinks.filter((link) => {
    if (!('visibilityKey' in link) || !link.visibilityKey) {
      return true
    }

    return Boolean(navbarVisibility[link.visibilityKey])
  })
  const isDenseDesktopNav = filteredNavLinks.length > 5;
  const desktopGridStyle = isDenseDesktopNav
    ? { gridTemplateColumns: `repeat(${Math.max(filteredNavLinks.length, 1)}, minmax(0, 1fr))` }
    : undefined;

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
        <div className="rounded-2xl border border-cyan-500/30 bg-slate-950/78 backdrop-blur-2xl shadow-[0_0_34px_rgba(6,182,212,0.14),0_8px_32px_rgba(0,0,0,0.42)] px-3 sm:px-6 py-2 flex items-center justify-between md:grid md:grid-cols-[auto_1fr_auto] md:items-center gap-3 relative overflow-hidden">
          <div className="pointer-events-none absolute inset-x-10 top-0 h-px bg-gradient-to-r from-transparent via-cyan-400/80 to-transparent" />
          <div className="pointer-events-none absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-cyan-500/10 to-transparent" />
          <div className="pointer-events-none absolute inset-y-0 right-0 w-24 bg-gradient-to-l from-blue-500/10 to-transparent" />
          <div className="pointer-events-none absolute -left-10 top-1/2 h-20 w-20 -translate-y-1/2 rounded-full bg-cyan-500/8 blur-2xl" />
          <div className="pointer-events-none absolute -right-8 top-1/2 h-16 w-16 -translate-y-1/2 rounded-full bg-blue-500/8 blur-2xl" />

          {/* Logo Section */}
          <Link href="/" className="flex items-center gap-2 sm:gap-4 min-w-0" aria-label="Go to homepage">
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
            <div
              className={`hidden md:min-w-0 md:items-center md:px-1 md:overflow-hidden ${
                isDenseDesktopNav
                  ? 'md:grid gap-x-1 xl:gap-x-2'
                  : 'md:flex md:justify-center md:gap-4 lg:gap-6 xl:gap-8'
              }`}
              style={desktopGridStyle}
            >
            {filteredNavLinks.map(link => (
              <Link
                key={link.href}
                href={link.href}
                  className={`h-10 flex flex-col items-center justify-center px-1 font-black uppercase text-center transition-all duration-200 ${
                  isDenseDesktopNav
                    ? 'text-[10px] xl:text-[11px] 2xl:text-[12px] tracking-[0.04em] xl:tracking-[0.07em] 2xl:tracking-[0.1em] leading-[1.02]'
                    : 'text-[11px] lg:text-[12px] xl:text-[13px] tracking-[0.12em] lg:tracking-[0.14em] leading-[1.05] whitespace-nowrap'
                } ${
                  isActiveLink(link.href)
                    ? 'text-cyan-300 drop-shadow-[0_0_8px_rgba(6,182,212,0.55)]'
                    : 'text-slate-300/85 hover:text-cyan-300 hover:drop-shadow-[0_0_8px_rgba(6,182,212,0.8)]'
                }`}
              >
                  {isDenseDesktopNav && link.href === '/problem-statements' ? (
                    <>
                      <span className="block">Problem</span>
                      <span className="block">Statements</span>
                    </>
                  ) : isDenseDesktopNav && link.href === '/qualified-teams' ? (
                    <>
                      <span className="block">Qualified</span>
                      <span className="block">Teams</span>
                    </>
                  ) : (
                    <span className="whitespace-nowrap">{link.label}</span>
                  )}
              </Link>
            ))}
          </div>

          {/* Actions */}
          <div className="ml-2 sm:ml-4 md:ml-0 flex items-center gap-2 sm:gap-4 flex-shrink-0">
            <Link
              href={registrationLink}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-gradient-to-r from-orange-400 via-orange-500 to-orange-600 text-white px-3 sm:px-5 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-black whitespace-nowrap shadow-[0_0_20px_rgba(249,115,22,0.45)] hover:shadow-[0_0_30px_rgba(249,115,22,0.62)] hover:scale-105 transition-all duration-200"
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
            {filteredNavLinks.map((link) => (
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
