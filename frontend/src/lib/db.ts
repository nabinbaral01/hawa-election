import electionData from '@/data/election_data.json';

export interface Candidate {
  id: number;
  candidate_id: number;
  district_id: number;
  const_name: string;
  candidate_name: string;
  age: number;
  gender: string;
  party: string;
  votes: number;
}

// Add auto-increment id to each row
const candidates: Candidate[] = (electionData as Omit<Candidate, 'id'>[]).map((row, i) => ({
  id: i + 1,
  ...row,
}));

export function getAllCandidates() {
  return candidates;
}

export function getCandidateById(id: number) {
  return candidates.find((c) => c.id === id) || null;
}

export function filterCandidates(opts: {
  search?: string;
  party?: string;
  gender?: string;
  district?: string;
  ageGroup?: string;
  sortBy?: string;
  sortOrder?: string;
  page?: number;
  limit?: number;
}) {
  let result = [...candidates];

  if (opts.search) {
    const s = opts.search.toLowerCase();
    result = result.filter(
      (c) =>
        c.candidate_name.toLowerCase().includes(s) ||
        c.party.toLowerCase().includes(s) ||
        c.const_name.toLowerCase().includes(s)
    );
  }
  if (opts.party) result = result.filter((c) => c.party === opts.party);
  if (opts.gender) result = result.filter((c) => c.gender === opts.gender);
  if (opts.district) {
    const d = opts.district.toLowerCase();
    result = result.filter((c) => c.const_name.toLowerCase().includes(d));
  }
  if (opts.ageGroup) {
    const ranges: Record<string, [number, number]> = {
      genz: [14, 29], millennial: [30, 44], genx: [45, 59], boomer: [60, 200],
    };
    const [min, max] = ranges[opts.ageGroup] || [0, 200];
    result = result.filter((c) => c.age >= min && c.age <= max);
  }

  const sortBy = opts.sortBy || 'votes';
  const asc = opts.sortOrder === 'asc' ? 1 : -1;
  result.sort((a, b) => {
    const av = a[sortBy as keyof Candidate];
    const bv = b[sortBy as keyof Candidate];
    if (typeof av === 'string' && typeof bv === 'string') return asc * av.localeCompare(bv);
    return asc * ((av as number) - (bv as number));
  });

  const total = result.length;
  const page = opts.page || 1;
  const limit = opts.limit || 20;
  const paged = result.slice((page - 1) * limit, page * limit);

  return { data: paged, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } };
}

export function getStats() {
  const total_candidates = candidates.length;
  const partySet = new Set(candidates.map((c) => c.party));
  const constSet = new Set(candidates.map((c) => c.const_name));
  const total_votes = candidates.reduce((a, c) => a + c.votes, 0);
  const avg_age = Math.round((candidates.reduce((a, c) => a + c.age, 0) / total_candidates) * 10) / 10;
  const female_candidates = candidates.filter((c) => c.gender === 'female').length;
  const male_candidates = candidates.filter((c) => c.gender === 'male').length;

  return {
    overview: { total_candidates, total_parties: partySet.size, total_constituencies: constSet.size, total_votes, avg_age, female_candidates, male_candidates },
    topCandidates: [...candidates].sort((a, b) => b.votes - a.votes).slice(0, 10),
    topParties: getPartySummaries().slice(0, 10),
    ageDistribution: getAgeDistribution(),
    genderDistribution: getGenderDistribution(),
  };
}

export function getFilterOptions() {
  const parties = Array.from(new Set(candidates.map((c) => c.party))).sort();
  const districts = Array.from(new Set(candidates.map((c) => c.const_name))).sort();
  const genders = Array.from(new Set(candidates.map((c) => c.gender))).sort();
  return { parties, districts, genders };
}

export function getPartySummaries() {
  const map = new Map<string, Candidate[]>();
  for (const c of candidates) {
    if (!map.has(c.party)) map.set(c.party, []);
    map.get(c.party)!.push(c);
  }
  return [...map.entries()]
    .map(([party, members]) => ({
      party,
      candidate_count: members.length,
      total_votes: members.reduce((a, c) => a + c.votes, 0),
      avg_votes: Math.round(members.reduce((a, c) => a + c.votes, 0) / members.length),
      max_votes: Math.max(...members.map((c) => c.votes)),
      female_candidates: members.filter((c) => c.gender === 'female').length,
      male_candidates: members.filter((c) => c.gender === 'male').length,
      avg_age: Math.round((members.reduce((a, c) => a + c.age, 0) / members.length) * 10) / 10,
    }))
    .sort((a, b) => b.total_votes - a.total_votes);
}

export function getPartyDetail(partyName: string) {
  const members = candidates.filter((c) => c.party === partyName);
  if (members.length === 0) return null;

  const summary = {
    party: partyName,
    candidate_count: members.length,
    total_votes: members.reduce((a, c) => a + c.votes, 0),
    avg_votes: Math.round(members.reduce((a, c) => a + c.votes, 0) / members.length),
    max_votes: Math.max(...members.map((c) => c.votes)),
    female_candidates: members.filter((c) => c.gender === 'female').length,
    male_candidates: members.filter((c) => c.gender === 'male').length,
    avg_age: Math.round((members.reduce((a, c) => a + c.age, 0) / members.length) * 10) / 10,
  };

  const districtMap = new Map<string, { total_votes: number; candidate_count: number }>();
  for (const c of members) {
    const d = districtMap.get(c.const_name) || { total_votes: 0, candidate_count: 0 };
    d.total_votes += c.votes;
    d.candidate_count++;
    districtMap.set(c.const_name, d);
  }
  const districtVotes = [...districtMap.entries()]
    .map(([const_name, d]) => ({ const_name, ...d }))
    .sort((a, b) => b.total_votes - a.total_votes);

  const ageDistribution = getAgeDistributionFor(members);

  return {
    summary,
    candidates: [...members].sort((a, b) => b.votes - a.votes),
    districtVotes,
    ageDistribution,
  };
}

export function getDistrictSummaries() {
  const map = new Map<string, Candidate[]>();
  for (const c of candidates) {
    if (!map.has(c.const_name)) map.set(c.const_name, []);
    map.get(c.const_name)!.push(c);
  }
  return [...map.entries()]
    .map(([const_name, members]) => ({
      const_name,
      district_id: members[0].district_id,
      candidate_count: members.length,
      total_votes: members.reduce((a, c) => a + c.votes, 0),
      highest_votes: Math.max(...members.map((c) => c.votes)),
    }))
    .sort((a, b) => a.const_name.localeCompare(b.const_name));
}

export function getDistrictDetail(districtName: string) {
  const members = candidates.filter((c) => c.const_name === districtName);
  if (members.length === 0) return null;

  const sorted = [...members].sort((a, b) => b.votes - a.votes);
  const winner = sorted[0];

  const partyMap = new Map<string, { total_votes: number; candidate_count: number }>();
  for (const c of members) {
    const p = partyMap.get(c.party) || { total_votes: 0, candidate_count: 0 };
    p.total_votes += c.votes;
    p.candidate_count++;
    partyMap.set(c.party, p);
  }

  const genderMap = new Map<string, number>();
  for (const c of members) {
    genderMap.set(c.gender, (genderMap.get(c.gender) || 0) + 1);
  }

  return {
    summary: {
      const_name: districtName,
      district_id: members[0].district_id,
      total_candidates: members.length,
      total_votes: members.reduce((a, c) => a + c.votes, 0),
      winner,
    },
    candidates: sorted,
    partyDistribution: [...partyMap.entries()]
      .map(([party, d]) => ({ party, ...d }))
      .sort((a, b) => b.total_votes - a.total_votes),
    genderDistribution: [...genderMap.entries()]
      .map(([gender, count]) => ({ gender, count })),
  };
}

function getAgeDistribution() {
  return getAgeDistributionFor(candidates);
}

function getAgeDistributionFor(list: Candidate[]) {
  const groups = [
    { label: 'Gen Z (14-29)', min: 14, max: 29 },
    { label: 'Millennial (30-44)', min: 30, max: 44 },
    { label: 'Gen X (45-59)', min: 45, max: 59 },
    { label: 'Boomer (60+)', min: 60, max: 200 },
  ];
  return groups.map((g) => {
    const members = list.filter((c) => c.age >= g.min && c.age <= g.max);
    return {
      age_group: g.label,
      count: members.length,
      total_votes: members.reduce((a, c) => a + c.votes, 0),
    };
  });
}

function getGenderDistribution() {
  const map = new Map<string, { count: number; total_votes: number }>();
  for (const c of candidates) {
    const g = map.get(c.gender) || { count: 0, total_votes: 0 };
    g.count++;
    g.total_votes += c.votes;
    map.set(c.gender, g);
  }
  return [...map.entries()].map(([gender, d]) => ({ gender, ...d }));
}

export function exportCSV(opts: { search?: string; party?: string; gender?: string; district?: string; ageGroup?: string }) {
  let result = [...candidates];
  if (opts.search) {
    const s = opts.search.toLowerCase();
    result = result.filter((c) => c.candidate_name.toLowerCase().includes(s) || c.party.toLowerCase().includes(s) || c.const_name.toLowerCase().includes(s));
  }
  if (opts.party) result = result.filter((c) => c.party === opts.party);
  if (opts.gender) result = result.filter((c) => c.gender === opts.gender);
  if (opts.district) result = result.filter((c) => c.const_name.toLowerCase().includes(opts.district!.toLowerCase()));
  if (opts.ageGroup) {
    const ranges: Record<string, [number, number]> = { genz: [14, 29], millennial: [30, 44], genx: [45, 59], boomer: [60, 200] };
    const [min, max] = ranges[opts.ageGroup] || [0, 200];
    result = result.filter((c) => c.age >= min && c.age <= max);
  }
  result.sort((a, b) => b.votes - a.votes);

  let csv = 'candidate_id,constituency,candidate_name,age,gender,party,votes\n';
  for (const r of result) {
    csv += `${r.candidate_id},"${r.const_name}","${r.candidate_name}",${r.age},${r.gender},"${r.party}",${r.votes}\n`;
  }
  return csv;
}
