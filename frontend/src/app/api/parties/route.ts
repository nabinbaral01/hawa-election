export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { getDB, queryAll } from '@/lib/db';

export async function GET() {
  try {
    const db = await getDB();
    const parties = queryAll(db, `
      SELECT
        party,
        COUNT(*) as candidate_count,
        SUM(votes) as total_votes,
        ROUND(AVG(votes), 0) as avg_votes,
        MAX(votes) as max_votes,
        SUM(CASE WHEN gender = 'female' THEN 1 ELSE 0 END) as female_candidates,
        SUM(CASE WHEN gender = 'male' THEN 1 ELSE 0 END) as male_candidates,
        ROUND(AVG(age), 1) as avg_age
      FROM candidates
      GROUP BY party
      ORDER BY total_votes DESC
    `);
    return NextResponse.json({ data: parties });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
