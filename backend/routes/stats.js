const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
  try {
    const { db, queryAll, queryOne } = req.app.locals;

    const overview = queryOne(db, `
      SELECT
        COUNT(*) as total_candidates,
        COUNT(DISTINCT party) as total_parties,
        COUNT(DISTINCT const_name) as total_constituencies,
        SUM(votes) as total_votes,
        ROUND(AVG(age), 1) as avg_age,
        SUM(CASE WHEN gender = 'female' THEN 1 ELSE 0 END) as female_candidates,
        SUM(CASE WHEN gender = 'male' THEN 1 ELSE 0 END) as male_candidates
      FROM candidates
    `);

    const topCandidates = queryAll(db,
      `SELECT * FROM candidates ORDER BY votes DESC LIMIT 10`);

    const topParties = queryAll(db, `
      SELECT party, SUM(votes) as total_votes, COUNT(*) as candidate_count
      FROM candidates GROUP BY party ORDER BY total_votes DESC LIMIT 10
    `);

    const ageDistribution = queryAll(db, `
      SELECT
        CASE
          WHEN age BETWEEN 14 AND 29 THEN 'Gen Z (14-29)'
          WHEN age BETWEEN 30 AND 44 THEN 'Millennial (30-44)'
          WHEN age BETWEEN 45 AND 59 THEN 'Gen X (45-59)'
          ELSE 'Boomer (60+)'
        END as age_group,
        COUNT(*) as count,
        SUM(votes) as total_votes
      FROM candidates
      GROUP BY age_group
      ORDER BY age_group
    `);

    const genderDistribution = queryAll(db, `
      SELECT gender, COUNT(*) as count, SUM(votes) as total_votes
      FROM candidates GROUP BY gender
    `);

    res.json({ overview, topCandidates, topParties, ageDistribution, genderDistribution });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/filters', (req, res) => {
  try {
    const { db, queryAll } = req.app.locals;
    const parties = queryAll(db, `SELECT DISTINCT party FROM candidates ORDER BY party`).map(r => r.party);
    const districts = queryAll(db, `SELECT DISTINCT const_name FROM candidates ORDER BY const_name`).map(r => r.const_name);
    const genders = queryAll(db, `SELECT DISTINCT gender FROM candidates ORDER BY gender`).map(r => r.gender);
    res.json({ parties, districts, genders });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/export', (req, res) => {
  try {
    const { db, queryAll } = req.app.locals;
    const { search, party, gender, district, ageGroup } = req.query;
    const conditions = [];
    const params = [];

    if (search) {
      conditions.push(`(candidate_name LIKE ? OR party LIKE ? OR const_name LIKE ?)`);
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }
    if (party) { conditions.push(`party = ?`); params.push(party); }
    if (gender) { conditions.push(`gender = ?`); params.push(gender); }
    if (district) { conditions.push(`const_name LIKE ?`); params.push(`%${district}%`); }
    if (ageGroup) {
      const ranges = { genz: [14, 29], millennial: [30, 44], genx: [45, 59], boomer: [60, 100] };
      const [min, max] = ranges[ageGroup] || [0, 200];
      conditions.push(`age >= ? AND age <= ?`);
      params.push(min, max);
    }

    const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
    const rows = queryAll(db,
      `SELECT candidate_id, const_name, candidate_name, age, gender, party, votes FROM candidates ${where} ORDER BY votes DESC`,
      params
    );

    let csv = 'candidate_id,constituency,candidate_name,age,gender,party,votes\n';
    for (const r of rows) {
      csv += `${r.candidate_id},"${r.const_name}","${r.candidate_name}",${r.age},${r.gender},"${r.party}",${r.votes}\n`;
    }

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=election_data_filtered.csv');
    res.send(csv);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
