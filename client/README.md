# LinkPulse Client

React + Vite + TypeScript dashboard for LinkPulse. See the [repo root README](../README.md) for setup instructions and the overall project context.

## Structure

- `src/api/` — typed `fetch` wrapper for the backend API
- `src/context/AuthContext.tsx` — auth state (JWT + user), persisted to `localStorage`
- `src/components/ProtectedRoute.tsx` — redirects to `/login` when unauthenticated
- `src/pages/` — `LoginPage`, `RegisterPage`, `DashboardPage`

## Scripts

- `npm run dev` — dev server at `http://localhost:5173`
- `npm run build` — type-check (`tsc -b`) then production build
- `npm run lint` — oxlint
