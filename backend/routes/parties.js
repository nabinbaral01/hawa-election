const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
  try {
    const { db, queryAll } = req.app.locals;
    const parties = queryAll(db, `
      SELECT
        party,
        COUNT(*) as candidate_count,
        SUM(votes) as total_votes,
        ROUND(AVG(votes), 0) as avg_votes,
        MAX(votes) as max_votes,
        SUM(CASE WHEN gender = 'female' THEN 1 ELSE 0 END) as female_candidates,
        SUM(CASE WHEN gender = 'male' THEN 1 ELSE 0 END) as male_candidates,
        ROUND(AVG(age), 1) as avg_age
      FROM candidates
      GROUP BY party
      ORDER BY total_votes DESC
    `);
    res.json({ data: parties });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/:name', (req, res) => {
  try {
    const { db, queryAll, queryOne } = req.app.locals;
    const partyName = decodeURIComponent(req.params.name);

    const summary = queryOne(db, `
      SELECT
        party,
        COUNT(*) as candidate_count,
        SUM(votes) as total_votes,
        ROUND(AVG(votes), 0) as avg_votes,
        MAX(votes) as max_votes,
        SUM(CASE WHEN gender = 'female' THEN 1 ELSE 0 END) as female_candidates,
        SUM(CASE WHEN gender = 'male' THEN 1 ELSE 0 END) as male_candidates,
        ROUND(AVG(age), 1) as avg_age
      FROM candidates
      WHERE party = ?
    `, [partyName]);

    if (!summary || !summary.party) return res.status(404).json({ error: 'Party not found' });

    const candidates = queryAll(db,
      `SELECT * FROM candidates WHERE party = ? ORDER BY votes DESC`, [partyName]);

    const districtVotes = queryAll(db, `
      SELECT const_name, SUM(votes) as total_votes, COUNT(*) as candidate_count
      FROM candidates WHERE party = ?
      GROUP BY const_name ORDER BY total_votes DESC
    `, [partyName]);

    const ageDistribution = queryAll(db, `
      SELECT
        CASE
          WHEN age BETWEEN 14 AND 29 THEN 'Gen Z (14-29)'
          WHEN age BETWEEN 30 AND 44 THEN 'Millennial (30-44)'
          WHEN age BETWEEN 45 AND 59 THEN 'Gen X (45-59)'
          ELSE 'Boomer (60+)'
        END as age_group,
        COUNT(*) as count
      FROM candidates WHERE party = ?
      GROUP BY age_group
    `, [partyName]);

    res.json({ summary, candidates, districtVotes, ageDistribution });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
