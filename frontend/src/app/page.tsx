'use client';

import { useEffect, useState } from 'react';
import Navbar from '@/components/Navbar';
import { TopCandidatesChart, PartyPieChart, AgeDistributionChart, GenderChart } from '@/components/Charts';
import { fetchAPI } from '@/lib/api';
import { useFilterStore, translations } from '@/lib/store';
import LoadingSpinner from '@/components/LoadingSpinner';
import Link from 'next/link';

interface Stats {
  overview: {
    total_candidates: number;
    total_parties: number;
    total_constituencies: number;
    total_votes: number;
    avg_age: number;
    female_candidates: number;
    male_candidates: number;
  };
  topCandidates: Array<{ id: number; candidate_name: string; party: string; votes: number; const_name: string }>;
  topParties: Array<{ party: string; total_votes: number; candidate_count: number }>;
  ageDistribution: Array<{ age_group: string; count: number; total_votes: number }>;
  genderDistribution: Array<{ gender: string; count: number; total_votes: number }>;
}

export default function HomePage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const { lang } = useFilterStore();
  const t = translations[lang];

  useEffect(() => {
    fetchAPI('/stats')
      .then(setStats)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <><Navbar /><LoadingSpinner text={t.loading} /></>;
  if (!stats) return <><Navbar /><div className="text-center py-20 text-slate-500">Failed to load data</div></>;

  const o = stats.overview;

  const statCards = [
    { label: t.totalCandidates, value: o.total_candidates.toLocaleString(), color: 'text-red-600' },
    { label: t.totalParties, value: o.total_parties.toLocaleString(), color: 'text-blue-600' },
    { label: t.totalConstituencies, value: o.total_constituencies.toLocaleString(), color: 'text-green-600' },
    { label: t.totalVotes, value: o.total_votes.toLocaleString(), color: 'text-purple-600' },
    { label: t.avgAge, value: o.avg_age.toString(), color: 'text-orange-600' },
    { label: t.femaleCandidates, value: o.female_candidates.toLocaleString(), color: 'text-pink-600' },
  ];

  return (
    <>
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero */}
        <div className="text-center mb-10">
          <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-3">{t.title}</h1>
          <p className="text-slate-500 text-lg max-w-2xl mx-auto">{t.subtitle}</p>
          <div className="flex gap-3 justify-center mt-6">
            <Link href="/candidates" className="px-6 py-2.5 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors">
              {t.candidates}
            </Link>
            <Link href="/parties" className="px-6 py-2.5 border border-slate-300 rounded-lg font-medium hover:bg-slate-50 transition-colors">
              {t.parties}
            </Link>
            <Link href="/districts" className="px-6 py-2.5 border border-slate-300 rounded-lg font-medium hover:bg-slate-50 transition-colors">
              {t.districts}
            </Link>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 mb-10">
          {statCards.map((card) => (
            <div key={card.label} className="stat-card text-center">
              <div className={`text-2xl font-bold ${card.color}`}>{card.value}</div>
              <div className="text-xs text-slate-500 mt-1">{card.label}</div>
            </div>
          ))}
        </div>

        {/* Charts */}
        <div className="grid lg:grid-cols-2 gap-6 mb-10">
          <TopCandidatesChart
            data={stats.topCandidates.map((c) => ({
              name: c.candidate_name.length > 20 ? c.candidate_name.slice(0, 20) + '...' : c.candidate_name,
              value: c.votes,
              fullName: c.candidate_name,
              party: c.party,
            }))}
          />
          <PartyPieChart
            data={stats.topParties.slice(0, 8).map((p) => ({
              name: p.party.length > 25 ? p.party.slice(0, 25) + '...' : p.party,
              value: p.total_votes,
            }))}
            title={t.topParties}
          />
        </div>

        <div className="grid lg:grid-cols-2 gap-6 mb-10">
          <AgeDistributionChart
            data={stats.ageDistribution.map((a) => ({
              name: a.age_group,
              value: a.count,
              count: a.count,
              votes: a.total_votes,
            }))}
          />
          <GenderChart
            data={stats.genderDistribution.map((g) => ({
              name: g.gender.charAt(0).toUpperCase() + g.gender.slice(1),
              value: g.count,
            }))}
          />
        </div>

        {/* Top Candidates Table */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-slate-900">{t.topCandidates}</h3>
            <Link href="/candidates" className="text-sm text-red-600 hover:text-red-700 font-medium">
              {t.viewAll} →
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="text-left py-3 px-2 text-slate-500 font-medium">#</th>
                  <th className="text-left py-3 px-2 text-slate-500 font-medium">{t.name}</th>
                  <th className="text-left py-3 px-2 text-slate-500 font-medium">{t.party}</th>
                  <th className="text-left py-3 px-2 text-slate-500 font-medium">{t.constituency}</th>
                  <th className="text-right py-3 px-2 text-slate-500 font-medium">{t.votes}</th>
                </tr>
              </thead>
              <tbody>
                {stats.topCandidates.map((c, i) => (
                  <tr key={c.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                    <td className="py-3 px-2 text-slate-400">{i + 1}</td>
                    <td className="py-3 px-2">
                      <Link href={`/candidates/${c.id}`} className="font-medium text-slate-900 hover:text-red-600">
                        {c.candidate_name}
                      </Link>
                    </td>
                    <td className="py-3 px-2 text-slate-600">{c.party}</td>
                    <td className="py-3 px-2 text-slate-600">{c.const_name}</td>
                    <td className="py-3 px-2 text-right font-semibold text-red-600">{c.votes.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </>
  );
}
