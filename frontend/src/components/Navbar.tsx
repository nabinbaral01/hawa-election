'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useFilterStore, translations } from '@/lib/store';

export default function Navbar() {
  const pathname = usePathname();
  const { lang, toggleLang } = useFilterStore();
  const t = translations[lang];

  const links = [
    { href: '/', label: t.home },
    { href: '/candidates', label: t.candidates },
    { href: '/parties', label: t.parties },
    { href: '/districts', label: t.districts },
  ];

  return (
    <nav className="bg-white border-b border-slate-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-2xl">🇳🇵</span>
            <span className="font-bold text-lg text-slate-900 hidden sm:inline">{t.title}</span>
            <span className="font-bold text-lg text-slate-900 sm:hidden">Election</span>
          </Link>

          <div className="flex items-center gap-1">
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
        </div>
      </div>
    </nav>
  );
}
