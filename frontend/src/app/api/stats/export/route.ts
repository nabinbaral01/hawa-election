export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { exportCSV } from '@/lib/db';

export async function GET(req: NextRequest) {
  try {
    const url = req.nextUrl;
    const csv = exportCSV({
      search: url.searchParams.get('search') || undefined,
      party: url.searchParams.get('party') || undefined,
      gender: url.searchParams.get('gender') || undefined,
      district: url.searchParams.get('district') || undefined,
      ageGroup: url.searchParams.get('ageGroup') || undefined,
    });

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
