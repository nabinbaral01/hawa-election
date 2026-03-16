const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
  try {
    const { db, queryAll } = req.app.locals;
    const districts = queryAll(db, `
      SELECT
        const_name,
        district_id,
        COUNT(*) as candidate_count,
        SUM(votes) as total_votes,
        MAX(votes) as highest_votes
      FROM candidates
      GROUP BY const_name
      ORDER BY const_name
    `);
    res.json({ data: districts });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/:name', (req, res) => {
  try {
    const { db, queryAll } = req.app.locals;
    const districtName = decodeURIComponent(req.params.name);

    const candidates = queryAll(db,
      `SELECT * FROM candidates WHERE const_name = ? ORDER BY votes DESC`, [districtName]);

    if (candidates.length === 0) return res.status(404).json({ error: 'District not found' });

    const partyDistribution = queryAll(db, `
      SELECT party, SUM(votes) as total_votes, COUNT(*) as candidate_count
      FROM candidates WHERE const_name = ?
      GROUP BY party ORDER BY total_votes DESC
    `, [districtName]);

    const genderDistribution = queryAll(db, `
      SELECT gender, COUNT(*) as count
      FROM candidates WHERE const_name = ?
      GROUP BY gender
    `, [districtName]);

    const summary = {
      const_name: districtName,
      district_id: candidates[0].district_id,
      total_candidates: candidates.length,
      total_votes: candidates.reduce((a, c) => a + c.votes, 0),
      winner: candidates[0],
    };

    res.json({ summary, candidates, partyDistribution, genderDistribution });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
