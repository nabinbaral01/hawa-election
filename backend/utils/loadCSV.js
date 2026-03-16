const fs = require('fs');
const path = require('path');
const { parse } = require('csv-parse/sync');

function loadCSV(db) {
  const csvPath = path.join(__dirname, '..', '..', 'election_data.csv');
  const csvContent = fs.readFileSync(csvPath, 'utf-8');

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

  db.run(`DELETE FROM candidates`);

  const stmt = db.prepare(`
    INSERT INTO candidates (candidate_id, district_id, const_name, candidate_name, age, gender, party, votes)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);

  for (const row of records) {
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
  db.run(`CREATE INDEX IF NOT EXISTS idx_district_id ON candidates(district_id)`);

  console.log(`Loaded ${records.length} candidates into database`);
}

module.exports = { loadCSV };
