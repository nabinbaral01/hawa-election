export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { getPartyDetail } from '@/lib/db';

export async function GET(req: NextRequest, { params }: { params: Promise<{ name: string }> }) {
  try {
    const { name } = await params;
    const result = getPartyDetail(decodeURIComponent(name));
    if (!result) return NextResponse.json({ error: 'Party not found' }, { status: 404 });
    return NextResponse.json(result);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
