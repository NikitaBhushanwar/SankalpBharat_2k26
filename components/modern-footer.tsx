'use client';

import Link from 'next/link';
import { Mail, Phone, MapPin, Linkedin, Instagram } from 'lucide-react';

function XIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className={className}
      fill="currentColor"
    >
      <path d="M18.244 2H21.5l-7.115 8.132L22.75 22h-6.55l-5.13-6.713L5.2 22H1.94l7.61-8.699L1.5 2h6.72l4.637 6.127L18.244 2Zm-1.149 18h1.8L7.238 3.895H5.307L17.095 20Z" />
    </svg>
  );
}

export default function ModernFooter() {
  return (
    <footer id="contact" className="relative z-10 border-t border-cyan-500/20 dark:border-cyan-600/30 mt-20 bg-gradient-to-b from-transparent to-background/85 dark:to-slate-950/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          {/* Brand */}
          <div className="col-span-1">
            <div className="flex items-center gap-3 mb-4">
              <img
                src="/sb_logo.webp"
                className="h-12 w-auto object-contain"
                alt="Sankalp Bharat Logo"
              />
              <img
                src="/sb_name.webp"
                className="h-8 w-auto object-contain"
                alt="Sankalp Bharat"
              />
            </div>
            <p className="text-sm text-foreground/70 dark:text-foreground/75">
              Innovating sustainable technology for India's digital future.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold text-foreground mb-4">Quick Links</h3>
            <ul className="space-y-2 text-sm">
              {[
                { label: 'Home', href: '/' },
                { label: 'Leaderboard', href: '/leaderboard' },
                { label: 'Winners', href: '/winners' },
                { label: 'Admin', href: '/admin/login' },
              ].map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-foreground/70 dark:text-foreground/75 hover:text-primary dark:hover:text-secondary transition-colors duration-200">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Information */}
          <div>
            <h3 className="font-semibold text-foreground mb-4">Information</h3>
            <ul className="space-y-2 text-sm">
              {[
                { label: 'About', href: '/about-event' },
                { label: 'Guidelines', href: '/rules-guidelines' },
                { label: 'Timeline', href: '/#timeline' },
                { label: 'Contact', href: '/contact-us' },
              ].map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-foreground/70 dark:text-foreground/75 hover:text-primary dark:hover:text-secondary transition-colors duration-200">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-semibold text-foreground mb-4">Get in Touch</h3>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start gap-2 text-foreground/75 dark:text-foreground/80">
                <Mail className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                <a href="mailto:sankalpbharat@stvincentngp.edu.in" className="min-w-0 break-all leading-relaxed hover:text-primary dark:hover:text-secondary transition-colors duration-200">
                  sankalpbharat@stvincentngp.edu.in
                </a>
              </li>
              <li className="flex items-start gap-2 text-foreground/75 dark:text-foreground/80">
                <Phone className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                <a
                  href="tel:+917558517946"
                  className="min-w-0 break-words leading-relaxed hover:text-primary dark:hover:text-secondary transition-colors duration-200"
                >
                  Harsh Gupta : +91 7558517946
                </a>
              </li>
              <li className="flex items-start gap-2 text-foreground/75 dark:text-foreground/80">
                <Phone className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                <a
                  href="tel:+917558645260"
                  className="min-w-0 break-words leading-relaxed hover:text-primary dark:hover:text-secondary transition-colors duration-200"
                >
                  Dhanshree Hande : +91 7558645260
                </a>
              </li>
              <li className="flex items-start gap-2 text-foreground/75 dark:text-foreground/80">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                <span className="leading-relaxed">St. Vincent Pallotti College of Engineering and Technology, Nagpur.</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-cyan-500/20 dark:border-cyan-600/30 pt-8">
          {/* Social Links */}
          <div className="flex justify-center gap-4 mb-6">
            {[
              { icon: Linkedin, href: 'https://www.linkedin.com/school/svpcet/posts/?feedView=all', label: 'LinkedIn' },
              { icon: XIcon, href: 'https://x.com/techpallottines', label: 'X' },
              { icon: Instagram, href: 'https://www.instagram.com/zenithforum?igsh=ZmlydWM3eG9kOHZz', label: 'Instagram' },
            ].map(({ icon: Icon, href, label }) => (
              <a
                key={label}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-lg glass-effect flex items-center justify-center text-foreground/60 dark:text-foreground/70 hover:text-primary dark:hover:text-secondary hover:bg-primary/10 transition-all duration-200 card-hover"
              >
                <Icon className="w-5 h-5" />
              </a>
            ))}
          </div>

          {/* Copyright */}
          <div className="text-center text-xs sm:text-sm text-foreground/70 dark:text-foreground/75">
            <p>&copy; 2026 Sankalp Bharat Hackathon. All rights reserved.</p>
            <p className="mt-2">Made with 🤍 by Swadhin & Nikita </p>
            <div className="flex justify-center gap-4 mt-2 text-xs">
              <a href="/privacy-policy" className="hover:text-primary dark:hover:text-secondary transition-colors duration-200">
                Privacy Policy
              </a>
              <span>•</span>
              <a href="/terms-of-service" className="hover:text-primary dark:hover:text-secondary transition-colors duration-200">
                Terms of Service
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
