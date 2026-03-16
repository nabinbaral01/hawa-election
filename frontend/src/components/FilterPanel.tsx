'use client';

import { useEffect, useState } from 'react';
import { useFilterStore, translations } from '@/lib/store';
import { fetchAPI, getExportURL } from '@/lib/api';

interface FilterOptions {
  parties: string[];
  districts: string[];
  genders: string[];
}

export default function FilterPanel() {
  const { party, gender, district, ageGroup, sortBy, sortOrder, lang, setFilter, resetFilters } = useFilterStore();
  const t = translations[lang];
  const [options, setOptions] = useState<FilterOptions>({ parties: [], districts: [], genders: [] });

  useEffect(() => {
    fetchAPI('/stats/filters').then(setOptions).catch(console.error);
  }, []);

  const exportParams: Record<string, string> = {};
  const { search } = useFilterStore.getState();
  if (search) exportParams.search = search;
  if (party) exportParams.party = party;
  if (gender) exportParams.gender = gender;
  if (district) exportParams.district = district;
  if (ageGroup) exportParams.ageGroup = ageGroup;

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm space-y-3">
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <select
          value={party}
          onChange={(e) => setFilter('party', e.target.value)}
          className="rounded-lg border border-slate-300 px-3 py-2 text-sm bg-white focus:ring-2 focus:ring-red-500 focus:border-transparent"
        >
          <option value="">{t.allParties}</option>
          {options.parties.map((p) => (
            <option key={p} value={p}>{p}</option>
          ))}
        </select>

        <select
          value={gender}
          onChange={(e) => setFilter('gender', e.target.value)}
          className="rounded-lg border border-slate-300 px-3 py-2 text-sm bg-white focus:ring-2 focus:ring-red-500 focus:border-transparent"
        >
          <option value="">{t.allGenders}</option>
          <option value="male">{t.male}</option>
          <option value="female">{t.female}</option>
          <option value="other">{t.other}</option>
        </select>

        <select
          value={district}
          onChange={(e) => setFilter('district', e.target.value)}
          className="rounded-lg border border-slate-300 px-3 py-2 text-sm bg-white focus:ring-2 focus:ring-red-500 focus:border-transparent"
        >
          <option value="">{t.allDistricts}</option>
          {options.districts.map((d) => (
            <option key={d} value={d}>{d}</option>
          ))}
        </select>

        <select
          value={ageGroup}
          onChange={(e) => setFilter('ageGroup', e.target.value)}
          className="rounded-lg border border-slate-300 px-3 py-2 text-sm bg-white focus:ring-2 focus:ring-red-500 focus:border-transparent"
        >
          <option value="">{t.allAges}</option>
          <option value="genz">{t.genz}</option>
          <option value="millennial">{t.millennial}</option>
          <option value="genx">{t.genx}</option>
          <option value="boomer">{t.boomer}</option>
        </select>

        <select
          value={`${sortBy}-${sortOrder}`}
          onChange={(e) => {
            const [sb, so] = e.target.value.split('-');
            setFilter('sortBy', sb);
            setFilter('sortOrder', so);
          }}
          className="rounded-lg border border-slate-300 px-3 py-2 text-sm bg-white focus:ring-2 focus:ring-red-500 focus:border-transparent"
        >
          <option value="votes-desc">{t.votes} ↓</option>
          <option value="votes-asc">{t.votes} ↑</option>
          <option value="candidate_name-asc">{t.name} A-Z</option>
          <option value="candidate_name-desc">{t.name} Z-A</option>
          <option value="age-asc">{t.age} ↑</option>
          <option value="age-desc">{t.age} ↓</option>
        </select>

        <div className="flex gap-2">
          <button
            onClick={resetFilters}
            className="flex-1 px-3 py-2 rounded-lg text-sm font-medium border border-slate-300 hover:bg-slate-100 transition-colors"
          >
            {t.resetFilters}
          </button>
          <a
            href={getExportURL(exportParams)}
            className="flex-1 px-3 py-2 rounded-lg text-sm font-medium bg-green-600 text-white hover:bg-green-700 transition-colors text-center"
          >
            CSV ↓
          </a>
        </div>
      </div>
    </div>
  );
}
