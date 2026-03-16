'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Navbar from '@/components/Navbar';
import { VoteBarChart, PartyPieChart, AgeDistributionChart } from '@/components/Charts';
import LoadingSpinner from '@/components/LoadingSpinner';
import { fetchAPI } from '@/lib/api';
import { useFilterStore, translations } from '@/lib/store';
import Link from 'next/link';

interface PartyDetail {
  summary: {
    party: string;
    candidate_count: number;
    total_votes: number;
    avg_votes: number;
    max_votes: number;
    female_candidates: number;
    male_candidates: number;
    avg_age: number;
  };
  candidates: Array<{ id: number; candidate_name: string; age: number; gender: string; votes: number; const_name: string }>;
  districtVotes: Array<{ const_name: string; total_votes: number; candidate_count: number }>;
  ageDistribution: Array<{ age_group: string; count: number }>;
}

export default function PartyDetailPage() {
  const params = useParams();
  const [data, setData] = useState<PartyDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const { lang } = useFilterStore();
  const t = translations[lang];

  useEffect(() => {
    const name = decodeURIComponent(params.name as string);
    fetchAPI(`/parties/${encodeURIComponent(name)}`)
      .then(setData)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [params.name]);

  if (loading) return <><Navbar /><LoadingSpinner text={t.loading} /></>;
  if (!data) return <><Navbar /><div className="text-center py-20 text-slate-500">Party not found</div></>;

  const s = data.summary;

  return (
    <>
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Link href="/parties" className="text-sm text-red-600 hover:text-red-700 mb-4 inline-block">
          ← Back to {t.parties}
        </Link>

        <h1 className="text-2xl font-bold text-slate-900 mb-6">{s.party}</h1>

        {/* Summary Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-4 mb-8">
          {[
            { label: t.totalVotes, value: s.total_votes.toLocaleString(), color: 'text-red-600' },
            { label: t.candidateCount, value: s.candidate_count, color: 'text-blue-600' },
            { label: t.avgVotes, value: s.avg_votes.toLocaleString(), color: 'text-green-600' },
            { label: t.highestVotes, value: s.max_votes.toLocaleString(), color: 'text-purple-600' },
            { label: t.maleCandidates, value: s.male_candidates, color: 'text-blue-600' },
            { label: t.femaleCandidates, value: s.female_candidates, color: 'text-pink-600' },
            { label: t.avgAge, value: s.avg_age, color: 'text-orange-600' },
          ].map((card) => (
            <div key={card.label} className="stat-card text-center">
              <div className={`text-xl font-bold ${card.color}`}>{card.value}</div>
              <div className="text-xs text-slate-500 mt-1">{card.label}</div>
            </div>
          ))}
        </div>

        {/* Charts */}
        <div className="grid lg:grid-cols-2 gap-6 mb-8">
          <VoteBarChart
            data={data.candidates.slice(0, 10).map((c) => ({
              name: c.candidate_name.length > 18 ? c.candidate_name.slice(0, 18) + '...' : c.candidate_name,
              value: c.votes,
            }))}
            title={`${t.topCandidates}`}
          />
          <PartyPieChart
            data={data.districtVotes.slice(0, 10).map((d) => ({
              name: d.const_name,
              value: d.total_votes,
            }))}
            title={`${t.voteDistribution} by ${t.constituency}`}
          />
        </div>

        {data.ageDistribution.length > 0 && (
          <div className="mb-8">
            <AgeDistributionChart
              data={data.ageDistribution.map((a) => ({
                name: a.age_group,
                value: a.count,
                count: a.count,
                votes: 0,
              }))}
            />
          </div>
        )}

        {/* Candidates Table */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
          <h3 className="font-semibold text-slate-900 mb-4">All {t.candidates} ({data.candidates.length})</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="text-left py-3 px-2 text-slate-500 font-medium">#</th>
                  <th className="text-left py-3 px-2 text-slate-500 font-medium">{t.name}</th>
                  <th className="text-left py-3 px-2 text-slate-500 font-medium">{t.constituency}</th>
                  <th className="text-left py-3 px-2 text-slate-500 font-medium">{t.age}</th>
                  <th className="text-left py-3 px-2 text-slate-500 font-medium">{t.gender}</th>
                  <th className="text-right py-3 px-2 text-slate-500 font-medium">{t.votes}</th>
                </tr>
              </thead>
              <tbody>
                {data.candidates.map((c, i) => (
                  <tr key={c.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                    <td className="py-3 px-2 text-slate-400">{i + 1}</td>
                    <td className="py-3 px-2">
                      <Link href={`/candidates/${c.id}`} className="font-medium text-slate-900 hover:text-red-600">
                        {c.candidate_name}
                      </Link>
                    </td>
                    <td className="py-3 px-2 text-slate-600">{c.const_name}</td>
                    <td className="py-3 px-2 text-slate-600">{c.age}</td>
                    <td className="py-3 px-2">{c.gender}</td>
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
