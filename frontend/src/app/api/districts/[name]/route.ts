export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { getDistrictDetail } from '@/lib/db';

export async function GET(req: NextRequest, { params }: { params: Promise<{ name: string }> }) {
  try {
    const { name } = await params;
    const result = getDistrictDetail(decodeURIComponent(name));
    if (!result) return NextResponse.json({ error: 'District not found' }, { status: 404 });
    return NextResponse.json(result);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
