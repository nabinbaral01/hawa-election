import { NextResponse } from 'next/server';
import { getDB, queryAll, queryOne } from '@/lib/db';

export async function GET() {
  try {
    const db = await getDB();

    const overview = queryOne(db, `
      SELECT
        COUNT(*) as total_candidates,
        COUNT(DISTINCT party) as total_parties,
        COUNT(DISTINCT const_name) as total_constituencies,
        SUM(votes) as total_votes,
        ROUND(AVG(age), 1) as avg_age,
        SUM(CASE WHEN gender = 'female' THEN 1 ELSE 0 END) as female_candidates,
        SUM(CASE WHEN gender = 'male' THEN 1 ELSE 0 END) as male_candidates
      FROM candidates
    `);

    const topCandidates = queryAll(db,
      `SELECT * FROM candidates ORDER BY votes DESC LIMIT 10`);

    const topParties = queryAll(db, `
      SELECT party, SUM(votes) as total_votes, COUNT(*) as candidate_count
      FROM candidates GROUP BY party ORDER BY total_votes DESC LIMIT 10
    `);

    const ageDistribution = queryAll(db, `
      SELECT
        CASE
          WHEN age BETWEEN 14 AND 29 THEN 'Gen Z (14-29)'
          WHEN age BETWEEN 30 AND 44 THEN 'Millennial (30-44)'
          WHEN age BETWEEN 45 AND 59 THEN 'Gen X (45-59)'
          ELSE 'Boomer (60+)'
        END as age_group,
        COUNT(*) as count,
        SUM(votes) as total_votes
      FROM candidates
      GROUP BY age_group
      ORDER BY age_group
    `);

    const genderDistribution = queryAll(db, `
      SELECT gender, COUNT(*) as count, SUM(votes) as total_votes
      FROM candidates GROUP BY gender
    `);

    return NextResponse.json({ overview, topCandidates, topParties, ageDistribution, genderDistribution });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
