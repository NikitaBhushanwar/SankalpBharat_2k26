'use client';

import Link from 'next/link';
import { useState } from 'react';
import { usePathname } from 'next/navigation';
import { Menu, X } from 'lucide-react';
import ThemeToggle from './theme-toggle';

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

  const [isOpen, setIsOpen] = useState(false);

  /* ================= ADMIN NAVBAR ================= */

  if (isAdmin) {
    return (
      <nav className="fixed inset-x-0 top-0 z-50 bg-white dark:bg-slate-900 shadow px-6 py-2 flex justify-between items-center">

        <div className="flex items-center gap-3">

          {/* Logo */}
          <div className="relative w-[96px] h-[56px] flex-shrink-0">
            <img
              src="/sb_logo.webp"
              className="object-contain w-full h-full"
              alt="Logo"
            />
          </div>

          {/* Name */}
          <div className="relative w-[320px] h-[56px] flex-shrink-0">
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

  return (
    <>
      {/* Navbar */}
      <nav className="fixed inset-x-0 top-0 z-50">
        <div className="mx-auto max-w-7xl mt-2 px-4">
          <div className="rounded-2xl border border-white/20 bg-white/90 dark:bg-slate-900/90 backdrop-blur-2xl shadow-2xl px-6 py-2 flex items-center justify-between">

            <div className="flex items-center gap-3">

              {/* Logo */}
              <div className="relative w-[96px] h-[56px] flex-shrink-0">
                <img
                  src="/sb_logo.webp"
                  className="object-contain w-full h-full"
                  alt="Logo"
                />
              </div>

              {/* Name */}
              <div className="relative w-[320px] h-[56px] flex-shrink-0">
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