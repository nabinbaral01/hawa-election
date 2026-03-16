'use client';

import { useFilterStore, translations } from '@/lib/store';

export default function SearchBar() {
  const { search, setFilter, lang } = useFilterStore();
  const t = translations[lang];

  return (
    <div className="relative">
      <svg
        className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400"
        fill="none" stroke="currentColor" viewBox="0 0 24 24"
      >
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
      </svg>
      <input
        type="text"
        value={search}
        onChange={(e) => setFilter('search', e.target.value)}
        placeholder={t.search}
        className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-300 bg-white text-sm
                   focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent
                   placeholder-slate-400 transition-all"
      />
      {search && (
        <button
          onClick={() => setFilter('search', '')}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
        >
          ✕
        </button>
      )}
    </div>
  );
}
