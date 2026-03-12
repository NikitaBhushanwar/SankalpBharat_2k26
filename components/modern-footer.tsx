'use client';

import Link from 'next/link';
import { Mail, Phone, MapPin, Linkedin, Twitter, Instagram } from 'lucide-react';

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
              <li className="flex items-center gap-2 text-foreground/75 dark:text-foreground/80">
                <Mail className="w-4 h-4 text-primary" />
                <a href="mailto:sankalpbharat@stvincentngp.edu.in" className="hover:text-primary dark:hover:text-secondary transition-colors duration-200 break-all">
                  sankalpbharat@stvincentngp.edu.in
                </a>
              </li>
              <li className="flex items-center gap-2 text-foreground/75 dark:text-foreground/80">
                <Phone className="w-4 h-4 text-primary" />
                <a href="tel:+917122582922" className="hover:text-primary dark:hover:text-secondary transition-colors duration-200">
                  +91 712-2582922
                </a>
              </li>
              <li className="flex items-center gap-2 text-foreground/75 dark:text-foreground/80">
                <MapPin className="w-4 h-4 text-primary" />
                <span>Nagpur, Maharashtra, India</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-cyan-500/20 dark:border-cyan-600/30 pt-8">
          {/* Social Links */}
          <div className="flex justify-center gap-4 mb-6">
            {[
              { icon: Linkedin, href: 'https://www.linkedin.com', label: 'LinkedIn' },
              { icon: Twitter, href: 'https://x.com', label: 'Twitter' },
              { icon: Instagram, href: 'https://www.instagram.com', label: 'Instagram' },
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
