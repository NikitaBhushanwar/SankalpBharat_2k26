'use client';

import Link from 'next/link';
import { Mail, Phone, MapPin, Linkedin, Twitter, Instagram } from 'lucide-react';

export default function ModernFooter() {
  return (
    <footer id="contact" className="relative border-t border-gray-200 dark:border-slate-700 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          {/* Brand */}
          <div className="col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-emerald-500 to-blue-500 flex items-center justify-center">
                <span className="text-white font-bold">SB</span>
              </div>
              <span className="font-bold gradient-text">Sankalp Bharat</span>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Innovating sustainable technology for India's digital future.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold text-foreground mb-4">Quick Links</h3>
            <ul className="space-y-2 text-sm">
              {[
                { label: 'Home', href: '/' },
                { label: 'Leaderboard', href: '/comming-soon' },
                { label: 'Winners', href: '/comming-soon' },
                { label: 'Admin', href: '/admin/login' },
              ].map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-gray-600 dark:text-gray-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">
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
                { label: 'About', href: '/#about' },
                { label: 'Guidelines', href: '/#guidelines' },
                { label: 'Timeline', href: '/#timeline' },
                { label: 'Contact', href: '/#contact' },
              ].map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-gray-600 dark:text-gray-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">
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
              <li className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                <Mail className="w-4 h-4" />
                <a href="mailto:cse@stvincentngp.edu.in" className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">
                  cse@stvincentngp.edu.in
                </a>
              </li>
              <li className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                <Phone className="w-4 h-4" />
                <a href="tel:+917122582922" className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">
                  +91 712-2582922
                </a>
              </li>
              <li className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                <MapPin className="w-4 h-4" />
                <span>Nagpur, Maharashtra, India</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-gray-200 dark:border-slate-700 pt-8">
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
                className="w-10 h-10 rounded-lg glass-effect flex items-center justify-center text-gray-600 dark:text-gray-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors card-hover"
              >
                <Icon className="w-5 h-5" />
              </a>
            ))}
          </div>

          {/* Copyright */}
          <div className="text-center text-xs sm:text-sm text-gray-600 dark:text-gray-400">
            <p>&copy; 2026 Sankalp Bharat Hackathon. All rights reserved.</p>
            <div className="flex justify-center gap-4 mt-2 text-xs">
              <a href="/privacy-policy" className="hover:text-foreground transition-colors">
                Privacy Policy
              </a>
              <span>•</span>
              <a href="/terms-of-service" className="hover:text-foreground transition-colors">
                Terms of Service
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
