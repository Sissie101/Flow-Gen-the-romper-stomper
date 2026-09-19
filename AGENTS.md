# FlowGen — Base44 Dev Environment

## What this app is
FlowGen is a livestream view-bot anomaly detection and solo creator marketing tool. Vite + React frontend served by an Express backend (`server.ts`) in middleware mode — a single process on port 3000 handles both API routes and the SPA.

## Running the app
```bash
docker compose -f docker-compose.base44.yml up -d --build
```
- Node 22 slim image, source bind-mounted at `/app`.
- `npm install` runs at container startup, then `npm run dev` (`tsx server.ts`).
- Vite runs in middleware mode inside Express — no separate dev server port.
- Live reload / HMR is enabled (DISABLE_HMR is NOT set).

## Health check
`GET /api/health` returns `{ status: "ok", geminiConfigured: bool }`.

## Secrets
- **GEMINI_API_KEY** (optional): Powers Gemini AI stream analysis and marketing copy. Without it, the app falls back to deterministic heuristic templates. Configure via the Secrets dashboard.
- Firebase config is hardcoded in `firebase-applet-config.json` — no secret needed.
- Shopify secrets in `.env.example` are optional and not required for the app to function.

## Key files
- `server.ts` — Express server with `/api/gemini/analyze-stream` and `/api/gemini/solo-marketing` endpoints + Vite middleware.
- `src/firebase.ts` — Firebase Auth + Firestore integration.
- `src/App.tsx` — Main React app entry.
- `vite.config.ts` — Vite config (HMR toggled by DISABLE_HMR env var).
