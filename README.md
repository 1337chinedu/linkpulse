# LinkPulse

A URL shortener with real analytics — built as a project-based learning exercise covering the full stack, from frontend to observability. Every layer of the system is implemented deliberately, not just "made to work," so this repo doubles as a reference for how a small production system fits together.

**Status: 🚧 Under active development — built one layer at a time.**

## What it does

- Shorten a long URL into a `linkpulse.app/xyz123` link
- Redirect visitors instantly (cached, so redirects don't hit the DB every time)
- See analytics per link: clicks over time, referrers, device/browser, rough geo
- Per-user accounts, API keys, and rate-limited public API

## Why this project

This is a learning project, built layer by layer to deliberately practice the pieces of a real backend/full-stack system:

| Layer | What's implemented | Status |
|---|---|---|
| Frontend foundation | React + Vite dashboard | ⬜ Not started |
| API & backend logic | Node.js + Express REST API | 🚧 In progress |
| Database & storage | PostgreSQL (Neon), schema + migrations | 🚧 In progress |
| Auth & permissions | JWT auth, per-user API keys, Postgres Row-Level Security | ⬜ Not started |
| Hosting & deployment | Vercel (frontend), Render/Fly.io (backend) | ⬜ Not started |
| Cloud & compute | Managed free-tier compute (Render/Fly.io) | ⬜ Not started |
| CI/CD & version control | GitHub Actions: lint, test, deploy on merge | ⬜ Not started |
| Security & rate limiting | Helmet, input validation, per-key rate limits | ⬜ Not started |
| Caching & CDN | Redis (Upstash) for hot redirects, edge caching | ⬜ Not started |
| Load balancing & scaling | Stateless API design, discussed + tested | ⬜ Not started |
| Error tracking & logs | Sentry + structured logging (pino) | ⬜ Not started |
| Availability & recovery | Health checks, DB backups, graceful shutdown | ⬜ Not started |

## Architecture (target)

```
                     ┌─────────────┐
   Browser  ───────▶ │  Vercel CDN │  (React dashboard)
                     └──────┬──────┘
                            │ REST API
                            ▼
                     ┌─────────────┐        ┌───────────┐
   short link  ─────▶│  Express API│───────▶│   Redis   │ (hot link cache,
   redirect          │  (Render)   │◀───────│ (Upstash) │  rate limiting)
                     └──────┬──────┘        └───────────┘
                            │
                            ▼
                     ┌─────────────┐
                     │  PostgreSQL │ (Neon)
                     └─────────────┘
```

## Tech stack

- **Frontend**: React, Vite, TypeScript (planned)
- **Backend**: Node.js, Express, pino (logging), helmet (security headers)
- **Database**: PostgreSQL (Neon free tier)
- **Cache**: Redis (Upstash free tier)
- **Auth**: JWT + bcrypt
- **Deployment**: Vercel (frontend), Render or Fly.io (backend)
- **CI/CD**: GitHub Actions
- **Monitoring**: Sentry

## Local development

### Prerequisites
- Node.js 20+
- npm
- Docker (for local Postgres)

### Database
Start a local Postgres in Docker (also creates a separate `linkpulse_test` database used by the test suite):
```bash
docker compose up -d
```
This maps Postgres to host port `5433` (not `5432`) to avoid clashing with any Postgres already installed on your machine.

### Backend
```bash
cd server
cp .env.example .env
npm install
npm run migrate:up   # creates the schema in the dev database
npm run dev
```
The API will be running at `http://localhost:4000`. Check it's alive:
```bash
curl http://localhost:4000/health
```

Running `npm test` automatically applies migrations to `linkpulse_test` first (via `.env.test`), so tests always run against a fresh schema.

### Production database (Neon)
1. Create a free project at [neon.tech](https://neon.tech).
2. Copy the connection string from the Neon dashboard (it looks like `postgresql://<user>:<password>@<host>/<db>?sslmode=require`).
3. Set it as `DATABASE_URL` wherever the server runs in production (e.g. Render/Fly.io environment variables) — do **not** put it in a committed `.env` file.
4. Run `npm run migrate:up` once against that `DATABASE_URL` to create the schema (Neon requires SSL, which is the default — don't set `PGSSL=false`).

### Frontend
_Coming soon — not scaffolded yet._

## Project structure

```
linkpulse/
├── server/            # Express API
│   ├── src/
│   │   ├── routes/    # Route handlers
│   │   ├── lib/       # Shared utilities (logger, db, redis clients)
│   │   ├── app.js     # Express app (importable, used by tests)
│   │   └── index.js   # Process entrypoint
│   ├── migrations/    # node-pg-migrate SQL migrations
│   ├── test/          # node --test suite
│   └── package.json
├── client/            # React dashboard (coming soon)
├── docker/            # Local Postgres init scripts
├── docker-compose.yml # Local Postgres (dev + test databases)
└── .github/
    └── workflows/     # CI/CD pipelines
```

## License

MIT — see [LICENSE](LICENSE).
