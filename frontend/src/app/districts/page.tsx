'use client';

import { useEffect, useState } from 'react';
import Navbar from '@/components/Navbar';
import LoadingSpinner from '@/components/LoadingSpinner';
import { fetchAPI } from '@/lib/api';
import { useFilterStore, translations } from '@/lib/store';
import Link from 'next/link';

interface District {
  const_name: string;
  district_id: number;
  candidate_count: number;
  total_votes: number;
  highest_votes: number;
}

export default function DistrictsPage() {
  const [districts, setDistricts] = useState<District[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [sortKey, setSortKey] = useState<'total_votes' | 'candidate_count' | 'const_name'>('const_name');
  const { lang } = useFilterStore();
  const t = translations[lang];

  useEffect(() => {
    fetchAPI('/districts')
      .then((data) => setDistricts(data.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const filtered = districts
    .filter((d) => d.const_name.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => {
      if (sortKey === 'const_name') return a.const_name.localeCompare(b.const_name);
      return (b[sortKey] as number) - (a[sortKey] as number);
    });

  return (
    <>
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-2xl font-bold text-slate-900 mb-6">{t.districts}</h1>

        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search constituencies..."
              className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-300 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-red-500 placeholder-slate-400"
            />
          </div>
          <select
            value={sortKey}
            onChange={(e) => setSortKey(e.target.value as typeof sortKey)}
            className="rounded-xl border border-slate-300 px-4 py-3 text-sm bg-white focus:ring-2 focus:ring-red-500"
          >
            <option value="const_name">{t.name} A-Z</option>
            <option value="total_votes">{t.totalVotes}</option>
            <option value="candidate_count">{t.candidateCount}</option>
          </select>
        </div>

        {loading ? (
          <LoadingSpinner text={t.loading} />
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filtered.map((d) => (
              <Link key={d.const_name} href={`/districts/${encodeURIComponent(d.const_name)}`} className="block">
                <div className="bg-white rounded-xl border border-slate-200 p-4 hover:shadow-lg hover:border-red-200 transition-all cursor-pointer">
                  <h3 className="font-semibold text-slate-900 mb-2">{d.const_name}</h3>
                  <div className="grid grid-cols-3 gap-2 text-sm">
                    <div>
                      <div className="text-slate-500">{t.candidates}</div>
                      <div className="font-bold text-blue-600">{d.candidate_count}</div>
                    </div>
                    <div>
                      <div className="text-slate-500">{t.totalVotes}</div>
                      <div className="font-bold text-red-600">{d.total_votes.toLocaleString()}</div>
                    </div>
                    <div>
                      <div className="text-slate-500">{t.highestVotes}</div>
                      <div className="font-bold text-green-600">{d.highest_votes.toLocaleString()}</div>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
    </>
  );
}
