const initSqlJs = require('sql.js');
const path = require('path');

let db = null;

async function getDb() {
  if (db) return db;
  const SQL = await initSqlJs();
  db = new SQL.Database();
  return db;
}

module.exports = { getDb };
