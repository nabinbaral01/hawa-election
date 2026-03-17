const fs = require('fs');
const path = require('path');
const { parse } = require('csv-parse/sync');

const csvPath = path.join(__dirname, '..', 'public', 'election_data.csv');
const jsonPath = path.join(__dirname, '..', 'src', 'data', 'election_data.json');

const csvContent = fs.readFileSync(csvPath, 'utf-8');
const records = parse(csvContent, {
  columns: true,
  skip_empty_lines: true,
  trim: true,
});

const cleaned = records.map((row) => ({
  candidate_id: parseInt(row.candidate_id, 10) || 0,
  district_id: parseInt(row.district_id, 10) || 0,
  const_name: row.const_name || 'Unknown',
  candidate_name: row.candidate_name || 'Unknown',
  age: parseInt(row.age, 10) || 0,
  gender: row.gender || 'unknown',
  party: row.party || 'Independent',
  votes: parseInt(row.votes, 10) || 0,
}));

fs.mkdirSync(path.dirname(jsonPath), { recursive: true });
fs.writeFileSync(jsonPath, JSON.stringify(cleaned));
console.log(`Converted ${cleaned.length} records to JSON`);
