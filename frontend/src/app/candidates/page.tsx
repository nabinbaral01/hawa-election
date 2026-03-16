'use client';

import { useEffect, useState } from 'react';
import Navbar from '@/components/Navbar';
import SearchBar from '@/components/SearchBar';
import FilterPanel from '@/components/FilterPanel';
import CandidateCard from '@/components/CandidateCard';
import Pagination from '@/components/Pagination';
import LoadingSpinner from '@/components/LoadingSpinner';
import { fetchAPI } from '@/lib/api';
import { useFilterStore, translations } from '@/lib/store';

interface Candidate {
  id: number;
  candidate_name: string;
  age: number;
  gender: string;
  party: string;
  votes: number;
  const_name: string;
}

interface CandidateResponse {
  data: Candidate[];
  pagination: { page: number; limit: number; total: number; totalPages: number };
}

export default function CandidatesPage() {
  const [result, setResult] = useState<CandidateResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const { search, party, gender, district, ageGroup, sortBy, sortOrder, page, lang, setFilter } = useFilterStore();
  const t = translations[lang];

  useEffect(() => {
    setLoading(true);
    fetchAPI('/candidates', {
      search, party, gender, district, ageGroup, sortBy, sortOrder,
      page: String(page), limit: '20',
    })
      .then(setResult)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [search, party, gender, district, ageGroup, sortBy, sortOrder, page]);

  return (
    <>
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-2xl font-bold text-slate-900 mb-6">{t.candidates}</h1>

        <div className="space-y-4 mb-6">
          <SearchBar />
          <FilterPanel />
        </div>

        {loading ? (
          <LoadingSpinner text={t.loading} />
        ) : !result || result.data.length === 0 ? (
          <div className="text-center py-16 text-slate-500">{t.noResults}</div>
        ) : (
          <>
            <p className="text-sm text-slate-500 mb-4">
              {result.pagination.total.toLocaleString()} {t.candidates.toLowerCase()} found
            </p>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {result.data.map((c) => (
                <CandidateCard key={c.id} candidate={c} />
              ))}
            </div>
            <Pagination
              page={result.pagination.page}
              totalPages={result.pagination.totalPages}
              onPageChange={(p) => setFilter('page', p)}
            />
          </>
        )}
      </main>
    </>
  );
}
