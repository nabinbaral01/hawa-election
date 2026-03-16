// eslint-disable-next-line @typescript-eslint/no-require-imports
const initSqlJs = require('sql.js');
import fs from 'fs';
import path from 'path';
import { parse } from 'csv-parse/sync';

interface SqlDb {
  run(sql: string, params?: unknown[]): void;
  prepare(sql: string): { bind(params?: unknown[]): boolean; step(): boolean; getAsObject(): Record<string, unknown>; free(): void; run(params?: unknown[]): void };
  close(): void;
}

let cachedDb: SqlDb | null = null;

async function loadCSVContent(): Promise<string> {
  // 1. Try filesystem (works locally)
  const possiblePaths = [
    path.join(process.cwd(), 'src', 'data', 'election_data.csv'),
    path.join(process.cwd(), 'public', 'election_data.csv'),
    path.join(process.cwd(), 'election_data.csv'),
  ];

  for (const p of possiblePaths) {
    try {
      const content = fs.readFileSync(p, 'utf-8');
      console.log('CSV loaded from fs:', p);
      return content;
    } catch {
      continue;
    }
  }

  // 2. Fallback: fetch from public URL (works on Vercel)
  const baseUrl = process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}`
    : process.env.NEXT_PUBLIC_VERCEL_URL
      ? `https://${process.env.NEXT_PUBLIC_VERCEL_URL}`
      : 'http://localhost:3000';

  console.log('Trying fetch from:', `${baseUrl}/election_data.csv`);
  const res = await fetch(`${baseUrl}/election_data.csv`);
  if (res.ok) {
    console.log('CSV loaded via fetch');
    return await res.text();
  }

  throw new Error('election_data.csv not found via fs or fetch');
}

export async function getDB(): Promise<SqlDb> {
  if (cachedDb) return cachedDb;

  const SQL = await initSqlJs();
  const db: SqlDb = new SQL.Database();

  const csvContent = await loadCSVContent();

  const records = parse(csvContent, {
    columns: true,
    skip_empty_lines: true,
    trim: true,
  });

  db.run(`
    CREATE TABLE IF NOT EXISTS candidates (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      candidate_id INTEGER,
      district_id INTEGER,
      const_name TEXT,
      candidate_name TEXT,
      age INTEGER,
      gender TEXT,
      party TEXT,
      votes INTEGER
    )
  `);

  const stmt = db.prepare(`
    INSERT INTO candidates (candidate_id, district_id, const_name, candidate_name, age, gender, party, votes)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);

  for (const row of records as Record<string, string>[]) {
    const age = parseInt(row.age, 10);
    const votes = parseInt(row.votes, 10);
    stmt.run([
      parseInt(row.candidate_id, 10) || 0,
      parseInt(row.district_id, 10) || 0,
      row.const_name || 'Unknown',
      row.candidate_name || 'Unknown',
      isNaN(age) ? 0 : age,
      row.gender || 'unknown',
      row.party || 'Independent',
      isNaN(votes) ? 0 : votes,
    ]);
  }
  stmt.free();

  db.run(`CREATE INDEX IF NOT EXISTS idx_party ON candidates(party)`);
  db.run(`CREATE INDEX IF NOT EXISTS idx_const_name ON candidates(const_name)`);
  db.run(`CREATE INDEX IF NOT EXISTS idx_gender ON candidates(gender)`);

  console.log(`DB loaded: ${records.length} candidates`);
  cachedDb = db;
  return db;
}

export function queryAll(database: SqlDb, sql: string, params: (string | number)[] = []) {
  const stmt = database.prepare(sql);
  if (params.length) stmt.bind(params);
  const results: Record<string, unknown>[] = [];
  while (stmt.step()) {
    results.push(stmt.getAsObject());
  }
  stmt.free();
  return results;
}

export function queryOne(database: SqlDb, sql: string, params: (string | number)[] = []) {
  const results = queryAll(database, sql, params);
  return results.length > 0 ? results[0] : null;
}
