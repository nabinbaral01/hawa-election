const express = require('express');
const cors = require('cors');
const initSqlJs = require('sql.js');
const { loadCSV } = require('./utils/loadCSV');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Helper to run queries on sql.js db
function queryAll(db, sql, params = []) {
  const stmt = db.prepare(sql);
  if (params.length) stmt.bind(params);
  const results = [];
  while (stmt.step()) {
    results.push(stmt.getAsObject());
  }
  stmt.free();
  return results;
}

function queryOne(db, sql, params = []) {
  const results = queryAll(db, sql, params);
  return results.length > 0 ? results[0] : null;
}

async function start() {
  const SQL = await initSqlJs();
  const db = new SQL.Database();

  loadCSV(db);

  // Make db and helpers available to routes
  app.locals.db = db;
  app.locals.queryAll = queryAll;
  app.locals.queryOne = queryOne;

  // Routes
  app.use('/api/candidates', require('./routes/candidates'));
  app.use('/api/parties', require('./routes/parties'));
  app.use('/api/districts', require('./routes/districts'));
  app.use('/api/stats', require('./routes/stats'));

  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  app.listen(PORT, () => {
    console.log(`Nepal Election API running on http://localhost:${PORT}`);
  });
}

start().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
