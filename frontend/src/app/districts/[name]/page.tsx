'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Navbar from '@/components/Navbar';
import { VoteBarChart, PartyPieChart, GenderChart } from '@/components/Charts';
import LoadingSpinner from '@/components/LoadingSpinner';
import { fetchAPI } from '@/lib/api';
import { useFilterStore, translations } from '@/lib/store';
import Link from 'next/link';

interface DistrictDetail {
  summary: {
    const_name: string;
    district_id: number;
    total_candidates: number;
    total_votes: number;
    winner: { id: number; candidate_name: string; party: string; votes: number };
  };
  candidates: Array<{ id: number; candidate_name: string; age: number; gender: string; party: string; votes: number; const_name: string }>;
  partyDistribution: Array<{ party: string; total_votes: number; candidate_count: number }>;
  genderDistribution: Array<{ gender: string; count: number }>;
}

export default function DistrictDetailPage() {
  const params = useParams();
  const [data, setData] = useState<DistrictDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const { lang } = useFilterStore();
  const t = translations[lang];

  useEffect(() => {
    const name = decodeURIComponent(params.name as string);
    fetchAPI(`/districts/${encodeURIComponent(name)}`)
      .then(setData)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [params.name]);

  if (loading) return <><Navbar /><LoadingSpinner text={t.loading} /></>;
  if (!data) return <><Navbar /><div className="text-center py-20 text-slate-500">Constituency not found</div></>;

  const s = data.summary;

  return (
    <>
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Link href="/districts" className="text-sm text-red-600 hover:text-red-700 mb-4 inline-block">
          ← Back to {t.districts}
        </Link>

        <h1 className="text-2xl font-bold text-slate-900 mb-2">{s.const_name}</h1>

        {/* Winner Banner */}
        <div className="bg-gradient-to-r from-red-50 to-orange-50 border border-red-200 rounded-xl p-5 mb-6">
          <div className="flex items-center gap-3">
            <span className="badge badge-green text-sm px-3 py-1">{t.winner}</span>
            <Link href={`/candidates/${s.winner.id}`} className="font-bold text-lg text-slate-900 hover:text-red-600">
              {s.winner.candidate_name}
            </Link>
            <span className="text-slate-500">({s.winner.party})</span>
            <span className="ml-auto text-2xl font-bold text-red-600">{s.winner.votes.toLocaleString()} {t.votes}</span>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="stat-card text-center">
            <div className="text-2xl font-bold text-blue-600">{s.total_candidates}</div>
            <div className="text-xs text-slate-500 mt-1">{t.totalCandidates}</div>
          </div>
          <div className="stat-card text-center">
            <div className="text-2xl font-bold text-red-600">{s.total_votes.toLocaleString()}</div>
            <div className="text-xs text-slate-500 mt-1">{t.totalVotes}</div>
          </div>
          <div className="stat-card text-center">
            <div className="text-2xl font-bold text-green-600">{data.partyDistribution.length}</div>
            <div className="text-xs text-slate-500 mt-1">{t.totalParties}</div>
          </div>
        </div>

        {/* Charts */}
        <div className="grid lg:grid-cols-2 gap-6 mb-8">
          <VoteBarChart
            data={data.candidates.slice(0, 10).map((c) => ({
              name: c.candidate_name.length > 18 ? c.candidate_name.slice(0, 18) + '...' : c.candidate_name,
              value: c.votes,
            }))}
            title={t.topCandidates}
          />
          <PartyPieChart
            data={data.partyDistribution.slice(0, 10).map((p) => ({
              name: p.party.length > 25 ? p.party.slice(0, 25) + '...' : p.party,
              value: p.total_votes,
            }))}
            title={t.partyDistribution}
          />
        </div>

        <div className="mb-8">
          <GenderChart
            data={data.genderDistribution.map((g) => ({
              name: g.gender.charAt(0).toUpperCase() + g.gender.slice(1),
              value: g.count,
            }))}
          />
        </div>

        {/* All Candidates Table */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
          <h3 className="font-semibold text-slate-900 mb-4">All {t.candidates} ({data.candidates.length})</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="text-left py-3 px-2 text-slate-500 font-medium">#</th>
                  <th className="text-left py-3 px-2 text-slate-500 font-medium">{t.name}</th>
                  <th className="text-left py-3 px-2 text-slate-500 font-medium">{t.party}</th>
                  <th className="text-left py-3 px-2 text-slate-500 font-medium">{t.age}</th>
                  <th className="text-left py-3 px-2 text-slate-500 font-medium">{t.gender}</th>
                  <th className="text-right py-3 px-2 text-slate-500 font-medium">{t.votes}</th>
                </tr>
              </thead>
              <tbody>
                {data.candidates.map((c, i) => (
                  <tr key={c.id} className={`border-b border-slate-100 hover:bg-slate-50 transition-colors ${i === 0 ? 'bg-green-50' : ''}`}>
                    <td className="py-3 px-2 text-slate-400">{i + 1}</td>
                    <td className="py-3 px-2">
                      <Link href={`/candidates/${c.id}`} className="font-medium text-slate-900 hover:text-red-600">
                        {c.candidate_name}
                        {i === 0 && <span className="ml-2 badge badge-green">Winner</span>}
                      </Link>
                    </td>
                    <td className="py-3 px-2">
                      <Link href={`/parties/${encodeURIComponent(c.party)}`} className="text-slate-600 hover:text-red-600">
                        {c.party}
                      </Link>
                    </td>
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
