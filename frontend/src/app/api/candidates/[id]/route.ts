export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { getCandidateById, getAllCandidates } from '@/lib/db';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const candidate = getCandidateById(parseInt(id));
    if (!candidate) return NextResponse.json({ error: 'Candidate not found' }, { status: 404 });

    const competitors = getAllCandidates()
      .filter((c) => c.const_name === candidate.const_name && c.id !== candidate.id)
      .sort((a, b) => b.votes - a.votes);

    return NextResponse.json({ candidate, competitors });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
