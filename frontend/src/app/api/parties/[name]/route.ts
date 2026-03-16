import { NextRequest, NextResponse } from 'next/server';
import { getDB, queryAll, queryOne } from '@/lib/db';

export async function GET(req: NextRequest, { params }: { params: Promise<{ name: string }> }) {
  try {
    const db = await getDB();
    const { name } = await params;
    const partyName = decodeURIComponent(name);

    const summary = queryOne(db, `
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
      WHERE party = ?
    `, [partyName]);

    if (!summary || !summary.party) return NextResponse.json({ error: 'Party not found' }, { status: 404 });

    const candidates = queryAll(db,
      `SELECT * FROM candidates WHERE party = ? ORDER BY votes DESC`, [partyName]);

    const districtVotes = queryAll(db, `
      SELECT const_name, SUM(votes) as total_votes, COUNT(*) as candidate_count
      FROM candidates WHERE party = ?
      GROUP BY const_name ORDER BY total_votes DESC
    `, [partyName]);

    const ageDistribution = queryAll(db, `
      SELECT
        CASE
          WHEN age BETWEEN 14 AND 29 THEN 'Gen Z (14-29)'
          WHEN age BETWEEN 30 AND 44 THEN 'Millennial (30-44)'
          WHEN age BETWEEN 45 AND 59 THEN 'Gen X (45-59)'
          ELSE 'Boomer (60+)'
        END as age_group,
        COUNT(*) as count
      FROM candidates WHERE party = ?
      GROUP BY age_group
    `, [partyName]);

    return NextResponse.json({ summary, candidates, districtVotes, ageDistribution });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
