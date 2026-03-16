export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { getDB, queryAll } from '@/lib/db';

export async function GET(req: NextRequest) {
  try {
    const db = await getDB();
    const url = req.nextUrl;
    const search = url.searchParams.get('search') || '';
    const party = url.searchParams.get('party') || '';
    const gender = url.searchParams.get('gender') || '';
    const district = url.searchParams.get('district') || '';
    const ageGroup = url.searchParams.get('ageGroup') || '';

    const conditions: string[] = [];
    const params: (string | number)[] = [];

    if (search) {
      conditions.push(`(candidate_name LIKE ? OR party LIKE ? OR const_name LIKE ?)`);
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }
    if (party) { conditions.push(`party = ?`); params.push(party); }
    if (gender) { conditions.push(`gender = ?`); params.push(gender); }
    if (district) { conditions.push(`const_name LIKE ?`); params.push(`%${district}%`); }
    if (ageGroup) {
      const ranges: Record<string, [number, number]> = { genz: [14, 29], millennial: [30, 44], genx: [45, 59], boomer: [60, 100] };
      const [min, max] = ranges[ageGroup] || [0, 200];
      conditions.push(`age >= ? AND age <= ?`);
      params.push(min, max);
    }

    const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
    const rows = queryAll(db,
      `SELECT candidate_id, const_name, candidate_name, age, gender, party, votes FROM candidates ${where} ORDER BY votes DESC`,
      params
    );

    let csv = 'candidate_id,constituency,candidate_name,age,gender,party,votes\n';
    for (const r of rows) {
      csv += `${r.candidate_id},"${r.const_name}","${r.candidate_name}",${r.age},${r.gender},"${r.party}",${r.votes}\n`;
    }

    return new NextResponse(csv, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': 'attachment; filename=election_data_filtered.csv',
      },
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
