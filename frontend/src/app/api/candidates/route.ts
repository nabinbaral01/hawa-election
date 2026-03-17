export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { filterCandidates } from '@/lib/db';

export async function GET(req: NextRequest) {
  try {
    const url = req.nextUrl;
    const result = filterCandidates({
      search: url.searchParams.get('search') || undefined,
      party: url.searchParams.get('party') || undefined,
      gender: url.searchParams.get('gender') || undefined,
      district: url.searchParams.get('district') || undefined,
      ageGroup: url.searchParams.get('ageGroup') || undefined,
      sortBy: url.searchParams.get('sortBy') || undefined,
      sortOrder: url.searchParams.get('sortOrder') || undefined,
      page: parseInt(url.searchParams.get('page') || '1'),
      limit: parseInt(url.searchParams.get('limit') || '20'),
    });
    return NextResponse.json(result);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
