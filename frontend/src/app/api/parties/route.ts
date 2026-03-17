export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { getPartySummaries } from '@/lib/db';

export async function GET() {
  try {
    return NextResponse.json({ data: getPartySummaries() });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
