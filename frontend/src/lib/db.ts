// eslint-disable-next-line @typescript-eslint/no-require-imports
const initSqlJs = require('sql.js');
import electionData from '@/data/election_data.json';

interface SqlDb {
  run(sql: string, params?: unknown[]): void;
  prepare(sql: string): { bind(params?: unknown[]): boolean; step(): boolean; getAsObject(): Record<string, unknown>; free(): void; run(params?: unknown[]): void };
  close(): void;
}

interface CandidateRow {
  candidate_id: number;
  district_id: number;
  const_name: string;
  candidate_name: string;
  age: number;
  gender: string;
  party: string;
  votes: number;
}

let cachedDb: SqlDb | null = null;

export async function getDB(): Promise<SqlDb> {
  if (cachedDb) return cachedDb;

  const SQL = await initSqlJs();
  const db: SqlDb = new SQL.Database();

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

  for (const row of electionData as CandidateRow[]) {
    stmt.run([
      row.candidate_id,
      row.district_id,
      row.const_name,
      row.candidate_name,
      row.age,
      row.gender,
      row.party,
      row.votes,
    ]);
  }
  stmt.free();

  db.run(`CREATE INDEX IF NOT EXISTS idx_party ON candidates(party)`);
  db.run(`CREATE INDEX IF NOT EXISTS idx_const_name ON candidates(const_name)`);
  db.run(`CREATE INDEX IF NOT EXISTS idx_gender ON candidates(gender)`);

  console.log(`DB loaded: ${electionData.length} candidates`);
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
