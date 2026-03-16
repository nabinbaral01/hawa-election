# Nepal Election Explorer

A fully functional web application to explore Nepal's election data with 3,400+ candidates across 165 constituencies.

## Quick Start

### 1. Install Dependencies
```bash
cd backend && npm install
cd ../frontend && npm install
```

### 2. Start Backend (Terminal 1)
```bash
cd backend
node server.js
```
Backend runs on **http://localhost:5000**

### 3. Start Frontend (Terminal 2)
```bash
cd frontend
npx next dev
```
Frontend runs on **http://localhost:3000**

## Features

### Frontend
- **Home Dashboard** — Overview stats, top candidates chart, party distribution pie chart, age/gender breakdowns
- **Candidates** — Searchable, filterable list with cards; click for detailed profile with vote comparison chart
- **Parties** — All parties with stats; click for detailed view with candidate list and constituency breakdown
- **Constituencies** — All 165 constituencies; click for winner, party distribution pie chart, candidate table
- **Search & Filters** — Search by name/party/district, filter by gender, age group, party, constituency
- **Sorting** — Sort by votes, name, or age (ascending/descending)
- **Pagination** — Navigate large result sets
- **CSV Download** — Export filtered data as CSV
- **Multilingual** — Toggle between English and Nepali (नेपाली)
- **Responsive** — Works on mobile and desktop

### Backend API Endpoints
| Endpoint | Description |
|---|---|
| `GET /api/stats` | Overall election statistics |
| `GET /api/stats/filters` | Available filter options |
| `GET /api/stats/export` | CSV download with filters |
| `GET /api/candidates?page=1&limit=20&search=&party=&gender=&ageGroup=&sortBy=votes&sortOrder=desc` | Paginated candidates |
| `GET /api/candidates/:id` | Candidate detail + competitors |
| `GET /api/parties` | All parties with summary |
| `GET /api/parties/:name` | Party detail |
| `GET /api/districts` | All constituencies |
| `GET /api/districts/:name` | Constituency detail |

### Charts (Recharts)
- Bar charts: Top candidates by votes, vote comparison per constituency
- Pie charts: Party distribution, gender distribution
- Age group distribution chart

## Tech Stack
- **Frontend:** Next.js 14 (App Router) + React + Tailwind CSS
- **Backend:** Node.js + Express.js
- **Database:** SQLite (sql.js — in-memory, loads CSV on startup)
- **Charts:** Recharts
- **State Management:** Zustand

## Data
- `election_data.csv` — 3,406 candidates, 165 constituencies, 66 parties
- Columns: candidate_id, district_id, const_name, candidate_name, age, gender, party, votes
