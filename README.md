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
| Frontend foundation | React + Vite (landing, about, contact, dashboard, settings) | ✅ Done |
| API & backend logic | Node.js + Express REST API | 🚧 In progress |
| Database & storage | PostgreSQL (Neon), schema + migrations | 🚧 In progress |
| Auth & permissions | JWT auth, per-user API keys, Postgres Row-Level Security | 🚧 In progress |
| Hosting & deployment | Vercel (frontend), Render/Fly.io (backend) | ✅ Done |
| Cloud & compute | Managed free-tier compute (Render/Fly.io) | ✅ Done |
| CI/CD & version control | GitHub Actions: lint, test, deploy on merge | ✅ Done |
| Security & rate limiting | Helmet, input validation, per-key rate limits | ✅ Done |
| Caching & CDN | Redis (Upstash) for hot redirects, edge caching | ⬜ Not started |
| Load balancing & scaling | Stateless API design, discussed + tested | ⬜ Not started |
| Error tracking & logs | Sentry + structured logging (pino) | ✅ Done |
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

- **Frontend**: React, Vite, TypeScript, react-router-dom
- **Backend**: Node.js, Express, pino (logging), helmet (security headers)
- **Database**: PostgreSQL (Neon free tier)
- **Cache**: Redis (Upstash free tier)
- **Auth**: JWT + scrypt (Node's built-in `crypto.scrypt`, no native deps)
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

### Error tracking (Sentry)
1. Create a free project at [sentry.io](https://sentry.io/signup/) (platform: Node.js/Express).
2. Copy the DSN it gives you and set `SENTRY_DSN` in `server/.env` (local) and as an env var wherever the server runs in production.
3. Leave it unset to disable Sentry entirely — `Sentry.init({ dsn: undefined })` is a documented no-op, not an error, so this is safe for local dev and CI.

Sentry is initialized in [src/instrument.js](server/src/instrument.js), loaded via `node --import` before any other module (required for Sentry's auto-instrumentation to work) — see the `dev`/`start` scripts in `package.json`. Only genuine server errors are reported: `Sentry.setupExpressErrorHandler` only captures errors with no status code or status ≥ 500 by default, so expected 4xx responses (validation errors, rate limits, CORS rejections) don't spam the dashboard. Uncaught exceptions and unhandled promise rejections anywhere in the process are also captured automatically — that's a built-in default integration, not something we wired up by hand.

### Deploying the backend (Render)
**Live**: https://linkpulse-api-ptat.onrender.com

The repo includes a [render.yaml](render.yaml) blueprint, so Render reads the service config from git instead of you clicking through dashboard settings by hand.

1. Push to GitHub (already done if you're reading this from the repo).
2. In the [Render dashboard](https://dashboard.render.com), choose **New > Blueprint** and connect this repo.
3. Render reads `render.yaml` and proposes a `linkpulse-api` web service (free plan, rooted at `server/`). Confirm it.
4. When prompted for environment variables, set:
   - `DATABASE_URL` — your Neon connection string (same value as in your local `server/.env`)
   - `JWT_SECRET` — a random secret (same value as local, or generate a fresh one — either works, it just needs to be stable across restarts so existing tokens stay valid)
   - `CORS_ORIGINS` — your deployed frontend's origin (e.g. the Vercel URL below)
   - `SENTRY_DSN` — from the [Error tracking](#error-tracking-sentry) section above (optional — leave blank to skip Sentry)
5. Deploy. Render runs `npm install && npm run migrate:up` as the build step, so the schema is created/updated automatically on every deploy, then starts the service with `npm start`.
6. Once live, check `https://<your-service>.onrender.com/health`.

The free plan spins the service down after 15 minutes of inactivity — the first request after idle will be slow (cold start) while it spins back up. That's a known free-tier tradeoff, not a bug.

**Gotcha we hit**: `NODE_ENV=production` makes `npm install` skip `devDependencies`. Anything the build step actually needs at deploy time (like `node-pg-migrate`, invoked by `migrate:up`) has to live in `dependencies`, even though it feels like a dev-only tool.

### Frontend
```bash
cd client
cp .env.example .env   # VITE_API_URL defaults to http://localhost:4000
npm install
npm run dev
```
The frontend runs at `http://localhost:5173`. It includes:

- **Landing page** (`/`) — hero section, features, and sign-up CTA
- **About page** (`/about`) — project mission, tech stack
- **Contact page** (`/contact`) — contact form (via Formspree)
- **Login & Register** (`/login`, `/register`) — public auth pages
- **Dashboard** (`/dashboard`) — protected; create links, view analytics and copy short URLs
- **Settings** (`/settings`) — protected; manage API keys (create, view, revoke)
- **Navigation bar** — consistent site navigation with auth state awareness

The dashboard expects a running backend (see above) — register an account, create a link, and it shows up in the table with a live click count.

### Deploying the frontend (Vercel)
**Live**: https://linkpulse-mocha.vercel.app

1. In the [Vercel dashboard](https://vercel.com/new), import this GitHub repo.
2. Vercel auto-detects the Vite framework preset. Set **Root Directory** to `client` (this is a monorepo — the frontend isn't at the repo root).
3. Add an environment variable: `VITE_API_URL` = `https://linkpulse-api-ptat.onrender.com` (the live backend).
4. Deploy. [client/vercel.json](client/vercel.json) adds a rewrite so client-side routes like `/dashboard` don't 404 on a direct visit or refresh — Vercel's static hosting otherwise only knows about `/index.html`.
5. Once live, update the backend's `CORS_ORIGINS` env var on Render to include the new `*.vercel.app` URL (see [Security](#security) below), so the deployed frontend can actually call the API.

### CI/CD (GitHub Actions)

Every push to `main` and all PRs trigger automated checks:

**Backend**: `npm test` with a live Postgres test database
- Runs migrations on `linkpulse_test`
- Executes full test suite (36 tests covering auth, rate limits, CORS, links, error handling)
- All tests must pass before merge

**Frontend**: `npm run lint && npm run build`
- Type-checks with TypeScript
- Lints with oxlint
- Builds the production bundle
- Must succeed before merge

**Auto-deploy**: Once merged to `main`:
- Render auto-deploys the backend (via [render.yaml](render.yaml) webhook)
- Vercel auto-deploys the frontend (via GitHub integration)

Both deployments are independent of CI status — they proceed on any push to `main`, so fix CI issues via a follow-up commit if needed.

**Recommended**: Add [branch protection](https://docs.github.com/en/repositories/configuring-branches-and-merges-in-pull-requests/managing-rulesets/about-rulesets) in your GitHub repo settings to require CI to pass and disable force-push to `main`.

## API

All `/api/links*` routes require authentication: either a JWT (`Authorization: Bearer <token>` from register/login) or an API key (`Authorization: Bearer lp_...`). `GET /:code` (the redirect itself) is intentionally public — visitors clicking a short link never need to authenticate.

Links are scoped to the caller: you can only list, view stats for, or manage links you created. Authorization is enforced with `WHERE user_id = ...` in every query — there's no Postgres Row-Level Security yet, so it's application-level only for now (see the roadmap table above).

| Method | Route | Auth | Description |
|---|---|---|---|
| POST | `/api/auth/register` | — | Create a user, returns a JWT |
| POST | `/api/auth/login` | — | Returns a JWT |
| GET | `/api/auth/me` | required | Current user |
| POST | `/api/keys` | required | Create an API key (the raw key is only ever returned once) |
| GET | `/api/keys` | required | List your keys (no raw secrets) |
| DELETE | `/api/keys/:id` | required | Revoke a key |
| POST | `/api/links` | required | Shorten a URL |
| GET | `/api/links` | required | List your links |
| GET | `/api/links/:code` | required | Stats for one of your links |
| GET | `/:code` | — | Redirect to the target URL |

## Security

- **Rate limiting**: `/api/auth/register` and `/api/auth/login` are limited per IP (default 50 requests / 15 min) to blunt brute-force and credential stuffing. `/api/links*` and `/api/keys*` are limited per authenticated user/API key rather than per IP (default 60 requests / min), so a shared office IP or multiple keys don't throttle each other. `GET /:code` redirects are limited per IP but deliberately generous (default 300 / min) since that's the product's main traffic path. All of these are tunable via env vars — see `server/src/middleware/rateLimit.js` for the full list (`AUTH_RATE_LIMIT_MAX`, `API_RATE_LIMIT_MAX`, `REDIRECT_RATE_LIMIT_MAX`, and their `_WINDOW_MS` counterparts).
- **Input validation**: request bodies are capped at 10kb, with explicit length limits on email (254), password (8–128), URL (2048), short codes (3–32), and API key names (100) — both to reject garbage early and to bound the cost of hashing an attacker-supplied password.
- **Authorization**: application-level only for now (`WHERE user_id = ...` in every query) — see the note on Postgres Row-Level Security under Auth & permissions in the roadmap table.
- **CORS**: `/api/*` only accepts browser requests from origins listed in `CORS_ORIGINS` (comma-separated), defaulting to just the Vite dev server (`http://localhost:5173`). Set it in production to your Vercel URL(s). Requests with no `Origin` header (curl, server-to-server, the `GET /:code` redirect itself) are unaffected — CORS only ever gates browser JS calling the API cross-origin.

## Project structure

```
linkpulse/
├── server/            # Express API
│   ├── src/
│   │   ├── routes/    # Route handlers
│   │   ├── middleware/# Auth + rate limiting
│   │   ├── lib/       # Shared utilities (logger, db, auth, stores)
│   │   ├── app.js     # Express app (importable, used by tests)
│   │   └── index.js   # Process entrypoint
│   ├── migrations/    # node-pg-migrate SQL migrations
│   ├── scripts/       # Test/dev tooling (not part of the app itself)
│   ├── test/          # node --test suite
│   └── package.json
├── client/            # React + Vite dashboard
│   └── src/
│       ├── api/       # Typed fetch client
│       ├── context/   # AuthContext (token + user, localStorage-persisted)
│       ├── components/# ProtectedRoute
│       └── pages/     # Login, Register, Dashboard
├── docker/            # Local Postgres init scripts
├── docker-compose.yml # Local Postgres (dev + test databases)
├── render.yaml        # Render deployment blueprint (backend)
└── .github/
    └── workflows/     # CI/CD pipelines
```

## License

MIT — see [LICENSE](LICENSE).
