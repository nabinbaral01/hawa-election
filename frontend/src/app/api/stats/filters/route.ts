export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { getDB, queryAll } from '@/lib/db';

export async function GET() {
  try {
    const db = await getDB();
    const parties = queryAll(db, `SELECT DISTINCT party FROM candidates ORDER BY party`).map(r => r.party);
    const districts = queryAll(db, `SELECT DISTINCT const_name FROM candidates ORDER BY const_name`).map(r => r.const_name);
    const genders = queryAll(db, `SELECT DISTINCT gender FROM candidates ORDER BY gender`).map(r => r.gender);
    return NextResponse.json({ parties, districts, genders });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
