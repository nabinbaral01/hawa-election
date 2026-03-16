'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useFilterStore, translations } from '@/lib/store';

export default function Navbar() {
  const pathname = usePathname();
  const { lang, toggleLang } = useFilterStore();
  const t = translations[lang];
  const [menuOpen, setMenuOpen] = useState(false);

  const links = [
    { href: '/', label: t.home },
    { href: '/candidates', label: t.candidates },
    { href: '/parties', label: t.parties },
    { href: '/districts', label: t.districts },
  ];

  return (
    <nav className="bg-white border-b border-slate-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14 sm:h-16">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-xl sm:text-2xl">🇳🇵</span>
            <span className="font-bold text-base sm:text-lg text-slate-900 hidden sm:inline">{t.title}</span>
            <span className="font-bold text-base text-slate-900 sm:hidden">Election</span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden sm:flex items-center gap-1">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`nav-link ${pathname === link.href ? 'nav-link-active' : 'text-slate-600'}`}
              >
                {link.label}
              </Link>
            ))}
            <button
              onClick={toggleLang}
              className="ml-2 px-3 py-1.5 rounded-lg text-xs font-bold border border-slate-300 hover:bg-slate-100 transition-colors"
            >
              {lang === 'en' ? 'नेपाली' : 'English'}
            </button>
          </div>

          {/* Mobile hamburger */}
          <div className="flex items-center gap-2 sm:hidden">
            <button
              onClick={toggleLang}
              className="px-2 py-1 rounded-lg text-xs font-bold border border-slate-300 hover:bg-slate-100 transition-colors"
            >
              {lang === 'en' ? 'ने' : 'EN'}
            </button>
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="p-2 rounded-lg hover:bg-slate-100 transition-colors"
              aria-label="Toggle menu"
            >
              <svg className="w-5 h-5 text-slate-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {menuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile dropdown menu */}
      {menuOpen && (
        <div className="sm:hidden border-t border-slate-200 bg-white">
          <div className="px-4 py-2 space-y-1">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMenuOpen(false)}
                className={`block px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  pathname === link.href
                    ? 'bg-red-600 text-white'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      )}
    </nav>
  );
}
