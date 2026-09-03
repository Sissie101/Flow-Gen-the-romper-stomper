# Base44 Dev Environment

## Overview
FlowGen Viewbot & Hype Detector — a Vite + React + TypeScript frontend with an Express backend (`server.ts`) that serves both the API and the Vite dev middleware on a single port (3000).

## Running the app
```bash
docker compose -f docker-compose.base44.yml up -d
```
- App is served on host port 3000.
- The container runs `npm install && npx tsx server.ts` — `tsx` runs the Express server which boots Vite in middleware mode.
- Source is bind-mounted at `/app`; edits hot-reload via Vite (HMR is disabled by `DISABLE_HMR=true` to prevent flicker during agent edits, but Vite still recompiles modules on request).
- After changes to `vite.config.ts` or `server.ts`, restart the container: `docker compose -f docker-compose.base44.yml restart app`.

## Key details
- **vite.config.ts** has `server.host: true` and `allowedHosts: true` — required so the preview's external hostname isn't blocked by Vite.
- **Firebase** config is hardcoded in `firebase-applet-config.json` (public client-side config, not a secret).
- **GEMINI_API_KEY** is optional — the server has built-in heuristic/template fallbacks when it's absent. If provided via the Secrets panel, the AI endpoints use real Gemini calls.
- No external secrets are required to boot.

## Verification
- `curl -sf http://localhost:3000/` returns the Vite-served HTML shell.
- `curl -sf http://localhost:3000/api/health` returns `{"status":"ok",...}`.
- `curl -sf -H "Host: 3000-${BASE44_PUBLIC_HOST_SUFFIX}" http://localhost:3000/src/main.tsx` returns transformed source (confirms live dev server, not prebuilt).
