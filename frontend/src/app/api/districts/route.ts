export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { getDB, queryAll } from '@/lib/db';

export async function GET() {
  try {
    const db = await getDB();
    const districts = queryAll(db, `
      SELECT
        const_name,
        district_id,
        COUNT(*) as candidate_count,
        SUM(votes) as total_votes,
        MAX(votes) as highest_votes
      FROM candidates
      GROUP BY const_name
      ORDER BY const_name
    `);
    return NextResponse.json({ data: districts });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
