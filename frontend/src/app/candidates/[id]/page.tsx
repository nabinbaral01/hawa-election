'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Navbar from '@/components/Navbar';
import { VoteBarChart } from '@/components/Charts';
import LoadingSpinner from '@/components/LoadingSpinner';
import { fetchAPI } from '@/lib/api';
import { useFilterStore, translations } from '@/lib/store';
import Link from 'next/link';

interface Candidate {
  id: number;
  candidate_id: number;
  candidate_name: string;
  age: number;
  gender: string;
  party: string;
  votes: number;
  const_name: string;
  district_id: number;
}

export default function CandidateDetailPage() {
  const params = useParams();
  const [candidate, setCandidate] = useState<Candidate | null>(null);
  const [competitors, setCompetitors] = useState<Candidate[]>([]);
  const [loading, setLoading] = useState(true);
  const { lang } = useFilterStore();
  const t = translations[lang];

  useEffect(() => {
    fetchAPI(`/candidates/${params.id}`)
      .then((data) => {
        setCandidate(data.candidate);
        setCompetitors(data.competitors);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [params.id]);

  if (loading) return <><Navbar /><LoadingSpinner text={t.loading} /></>;
  if (!candidate) return <><Navbar /><div className="text-center py-20 text-slate-500">Candidate not found</div></>;

  const allInConstituency = [candidate, ...competitors].sort((a, b) => b.votes - a.votes);
  const rank = allInConstituency.findIndex((c) => c.id === candidate.id) + 1;
  const isWinner = rank === 1;

  const chartData = allInConstituency.slice(0, 10).map((c) => ({
    name: c.candidate_name.length > 18 ? c.candidate_name.slice(0, 18) + '...' : c.candidate_name,
    value: c.votes,
  }));

  return (
    <>
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Link href="/candidates" className="text-sm text-red-600 hover:text-red-700 mb-4 inline-block">
          ← Back to {t.candidates}
        </Link>

        <div className="grid lg:grid-cols-3 gap-4 sm:gap-6">
          {/* Profile Card */}
          <div className="bg-white rounded-xl border border-slate-200 p-4 sm:p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-11 h-11 sm:w-14 sm:h-14 rounded-full bg-red-100 flex items-center justify-center text-xl sm:text-2xl font-bold text-red-600">
                {candidate.candidate_name.charAt(0)}
              </div>
              <div className="min-w-0">
                <h1 className="text-base sm:text-xl font-bold text-slate-900 truncate">{candidate.candidate_name}</h1>
                {isWinner && <span className="badge badge-green">Winner</span>}
              </div>
            </div>

            <div className="space-y-3 text-sm">
              <div className="flex justify-between py-2 border-b border-slate-100">
                <span className="text-slate-500">{t.party}</span>
                <Link href={`/parties/${encodeURIComponent(candidate.party)}`} className="font-medium text-red-600 hover:text-red-700">
                  {candidate.party}
                </Link>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-100">
                <span className="text-slate-500">{t.constituency}</span>
                <Link href={`/districts/${encodeURIComponent(candidate.const_name)}`} className="font-medium text-red-600 hover:text-red-700">
                  {candidate.const_name}
                </Link>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-100">
                <span className="text-slate-500">{t.age}</span>
                <span className="font-medium">{candidate.age}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-100">
                <span className="text-slate-500">{t.gender}</span>
                <span className={`badge ${candidate.gender === 'female' ? 'badge-purple' : 'badge-blue'}`}>
                  {candidate.gender}
                </span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-100">
                <span className="text-slate-500">{t.votes}</span>
                <span className="font-bold text-lg text-red-600">{candidate.votes.toLocaleString()}</span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-slate-500">Rank in {candidate.const_name}</span>
                <span className="font-medium">#{rank} of {allInConstituency.length}</span>
              </div>
            </div>
          </div>

          {/* Vote Comparison Chart */}
          <div className="lg:col-span-2">
            <VoteBarChart data={chartData} title={`Vote Comparison in ${candidate.const_name}`} />
          </div>
        </div>

        {/* Competitors Table */}
        <div className="bg-white rounded-xl border border-slate-200 p-3 sm:p-5 shadow-sm mt-6">
          <h3 className="font-semibold text-slate-900 mb-4 text-sm sm:text-base">{t.competitors} in {candidate.const_name}</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-xs sm:text-sm">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="text-left py-3 px-2 text-slate-500 font-medium">#</th>
                  <th className="text-left py-3 px-2 text-slate-500 font-medium">{t.name}</th>
                  <th className="text-left py-3 px-2 text-slate-500 font-medium hidden sm:table-cell">{t.party}</th>
                  <th className="text-left py-3 px-2 text-slate-500 font-medium hidden md:table-cell">{t.age}</th>
                  <th className="text-left py-3 px-2 text-slate-500 font-medium hidden md:table-cell">{t.gender}</th>
                  <th className="text-right py-3 px-2 text-slate-500 font-medium">{t.votes}</th>
                </tr>
              </thead>
              <tbody>
                {allInConstituency.map((c, i) => (
                  <tr
                    key={c.id}
                    className={`border-b border-slate-100 hover:bg-slate-50 transition-colors ${c.id === candidate.id ? 'bg-red-50' : ''}`}
                  >
                    <td className="py-2.5 sm:py-3 px-2 text-slate-400">{i + 1}</td>
                    <td className="py-2.5 sm:py-3 px-2">
                      <Link href={`/candidates/${c.id}`} className="font-medium text-slate-900 hover:text-red-600">
                        {c.candidate_name}
                        {c.id === candidate.id && <span className="ml-1 text-xs text-red-500">(current)</span>}
                      </Link>
                      <div className="text-xs text-slate-400 sm:hidden mt-0.5">{c.party}</div>
                    </td>
                    <td className="py-2.5 sm:py-3 px-2 text-slate-600 hidden sm:table-cell">{c.party}</td>
                    <td className="py-2.5 sm:py-3 px-2 text-slate-600 hidden md:table-cell">{c.age}</td>
                    <td className="py-2.5 sm:py-3 px-2 hidden md:table-cell">{c.gender}</td>
                    <td className="py-2.5 sm:py-3 px-2 text-right font-semibold text-red-600">{c.votes.toLocaleString()}</td>
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
