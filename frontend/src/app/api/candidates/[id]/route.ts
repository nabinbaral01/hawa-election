export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { getDB, queryAll, queryOne } from '@/lib/db';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const db = await getDB();
    const { id } = await params;
    const candidate = queryOne(db, `SELECT * FROM candidates WHERE id = ?`, [parseInt(id)]);
    if (!candidate) return NextResponse.json({ error: 'Candidate not found' }, { status: 404 });

    const competitors = queryAll(db,
      `SELECT * FROM candidates WHERE const_name = ? AND id != ? ORDER BY votes DESC`,
      [candidate.const_name as string, candidate.id as number]
    );

    return NextResponse.json({ candidate, competitors });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
