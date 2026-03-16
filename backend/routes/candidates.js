const express = require('express');
const router = express.Router();

// Get all candidates with filtering, sorting, pagination
router.get('/', (req, res) => {
  try {
    const { db, queryAll, queryOne } = req.app.locals;
    const {
      page = 1,
      limit = 20,
      search = '',
      party = '',
      gender = '',
      district = '',
      ageGroup = '',
      sortBy = 'votes',
      sortOrder = 'desc',
    } = req.query;

    const offset = (parseInt(page) - 1) * parseInt(limit);
    const conditions = [];
    const params = [];

    if (search) {
      conditions.push(`(candidate_name LIKE ? OR party LIKE ? OR const_name LIKE ?)`);
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }
    if (party) {
      conditions.push(`party = ?`);
      params.push(party);
    }
    if (gender) {
      conditions.push(`gender = ?`);
      params.push(gender);
    }
    if (district) {
      conditions.push(`const_name LIKE ?`);
      params.push(`%${district}%`);
    }
    if (ageGroup) {
      const ranges = { genz: [14, 29], millennial: [30, 44], genx: [45, 59], boomer: [60, 100] };
      const [minAge, maxAge] = ranges[ageGroup] || [0, 200];
      conditions.push(`age >= ? AND age <= ?`);
      params.push(minAge, maxAge);
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
    const allowedSorts = ['votes', 'age', 'candidate_name', 'party', 'const_name'];
    const safeSortBy = allowedSorts.includes(sortBy) ? sortBy : 'votes';
    const safeSortOrder = sortOrder === 'asc' ? 'ASC' : 'DESC';

    const countRow = queryOne(db, `SELECT COUNT(*) as total FROM candidates ${whereClause}`, params);
    const total = countRow ? countRow.total : 0;

    const rows = queryAll(db,
      `SELECT * FROM candidates ${whereClause} ORDER BY ${safeSortBy} ${safeSortOrder} LIMIT ? OFFSET ?`,
      [...params, parseInt(limit), offset]
    );

    res.json({
      data: rows,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get single candidate by id
router.get('/:id', (req, res) => {
  try {
    const { db, queryAll, queryOne } = req.app.locals;
    const candidate = queryOne(db, `SELECT * FROM candidates WHERE id = ?`, [parseInt(req.params.id)]);
    if (!candidate) return res.status(404).json({ error: 'Candidate not found' });

    const competitors = queryAll(db,
      `SELECT * FROM candidates WHERE const_name = ? AND id != ? ORDER BY votes DESC`,
      [candidate.const_name, candidate.id]
    );

    res.json({ candidate, competitors });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
