'use client';

import Link from 'next/link';

interface Candidate {
  id: number;
  candidate_name: string;
  age: number;
  gender: string;
  party: string;
  votes: number;
  const_name: string;
}

export default function CandidateCard({ candidate }: { candidate: Candidate }) {
  const genderColor = candidate.gender === 'female' ? 'badge-purple' : candidate.gender === 'male' ? 'badge-blue' : 'badge-orange';

  return (
    <Link href={`/candidates/${candidate.id}`} className="block">
      <div className="bg-white rounded-xl border border-slate-200 p-4 hover:shadow-lg hover:border-red-200 transition-all cursor-pointer group">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-slate-900 group-hover:text-red-600 transition-colors truncate">
              {candidate.candidate_name}
            </h3>
            <p className="text-sm text-slate-500 truncate">{candidate.party}</p>
          </div>
          <div className="ml-2 text-right">
            <div className="text-lg font-bold text-red-600">{candidate.votes.toLocaleString()}</div>
            <div className="text-xs text-slate-400">votes</div>
          </div>
        </div>
        <div className="flex flex-wrap gap-1.5">
          <span className="badge badge-red">{candidate.const_name}</span>
          <span className={`badge ${genderColor}`}>{candidate.gender}</span>
          <span className="badge badge-green">Age {candidate.age}</span>
        </div>
      </div>
    </Link>
  );
}
