import { NextRequest, NextResponse } from 'next/server';
import { getDB, queryAll, queryOne } from '@/lib/db';

export async function GET(req: NextRequest) {
  try {
    const db = await getDB();
    const url = req.nextUrl;
    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = parseInt(url.searchParams.get('limit') || '20');
    const search = url.searchParams.get('search') || '';
    const party = url.searchParams.get('party') || '';
    const gender = url.searchParams.get('gender') || '';
    const district = url.searchParams.get('district') || '';
    const ageGroup = url.searchParams.get('ageGroup') || '';
    const sortBy = url.searchParams.get('sortBy') || 'votes';
    const sortOrder = url.searchParams.get('sortOrder') || 'desc';

    const offset = (page - 1) * limit;
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

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
    const allowedSorts = ['votes', 'age', 'candidate_name', 'party', 'const_name'];
    const safeSortBy = allowedSorts.includes(sortBy) ? sortBy : 'votes';
    const safeSortOrder = sortOrder === 'asc' ? 'ASC' : 'DESC';

    const countRow = queryOne(db, `SELECT COUNT(*) as total FROM candidates ${whereClause}`, params);
    const total = (countRow?.total as number) || 0;

    const rows = queryAll(db,
      `SELECT * FROM candidates ${whereClause} ORDER BY ${safeSortBy} ${safeSortOrder} LIMIT ? OFFSET ?`,
      [...params, limit, offset]
    );

    return NextResponse.json({
      data: rows,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
