export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { getDB, queryAll } from '@/lib/db';

export async function GET(req: NextRequest, { params }: { params: Promise<{ name: string }> }) {
  try {
    const db = await getDB();
    const { name } = await params;
    const districtName = decodeURIComponent(name);

    const candidates = queryAll(db,
      `SELECT * FROM candidates WHERE const_name = ? ORDER BY votes DESC`, [districtName]);

    if (candidates.length === 0) return NextResponse.json({ error: 'District not found' }, { status: 404 });

    const partyDistribution = queryAll(db, `
      SELECT party, SUM(votes) as total_votes, COUNT(*) as candidate_count
      FROM candidates WHERE const_name = ?
      GROUP BY party ORDER BY total_votes DESC
    `, [districtName]);

    const genderDistribution = queryAll(db, `
      SELECT gender, COUNT(*) as count
      FROM candidates WHERE const_name = ?
      GROUP BY gender
    `, [districtName]);

    const winner = candidates[0];
    const summary = {
      const_name: districtName,
      district_id: winner.district_id,
      total_candidates: candidates.length,
      total_votes: candidates.reduce((a: number, c: Record<string, unknown>) => a + (c.votes as number), 0),
      winner,
    };

    return NextResponse.json({ summary, candidates, partyDistribution, genderDistribution });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
