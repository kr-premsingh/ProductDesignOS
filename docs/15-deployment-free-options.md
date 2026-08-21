# Deployment — Free Options

Two paths, not mutually exclusive. Recommendation: use the managed free-cloud path (below) for a public pilot URL that doesn't depend on your laptop's uptime; keep the home server for local dev/staging (it's already what `scripts/dev-up.ps1` and `infra/docker-compose.yml` are for).

## Why not just the home Ubuntu server for the public pilot

`infra/prod` (Caddy + Docker Compose + the `deploy-home-server.yml` GitHub Action) is already built for exactly this and works — but it requires the machine to be powered on and reachable 24/7 (port-forwarded 80/443, or a tunnel). Since the laptop "keeps getting off," that's a single point of failure for anyone visiting the site. If you still want to use it later (it's free — no hosting bill):

- Fix sleep/shutdown: `sudo systemctl disable sleep.target suspend.target hibernate.target hybrid-sleep.target` and disable any BIOS/laptop-lid sleep behavior; set the power profile to "performance"/"never sleep" while on AC.
- Make the stack self-heal: Docker Compose already restarts containers (`restart: unless-stopped` in `infra/prod/docker-compose.yml`); add a `systemd` unit or a cron `@reboot` entry that runs `docker compose -f infra/prod/docker-compose.yml up -d` so the stack comes back automatically after any reboot/power loss.
- Avoid router port-forwarding entirely with a **Cloudflare Tunnel** (free) — exposes the home server to the internet over an outbound-only connection, works behind CGNAT/dynamic IP, and gives you a stable hostname without opening ports.

This reduces outages but doesn't eliminate the fundamental risk of a single home machine with unreliable power — worth knowing before pointing real users at it.

## Recommended: free managed cloud (no dependency on your hardware)

| Service | Host | Why |
|---|---|---|
| `apps/web` (Next.js) | **Vercel** (Hobby, free) | Built for Next.js, git-connected auto-deploy, generous free tier, no card required |
| `services/core-api` (Rust) | **Render** (free Web Service) | Deploys straight from `services/core-api/Dockerfile`, free instance type, no card required for free tier |
| `services/api` (Node, legacy) | **Render** (free Web Service) | Same account, second free service, until it's fully retired per the Rust migration plan (doc 13/14) |
| Postgres | **Neon** (free tier) | Serverless Postgres, free indefinitely (not a 30/90-day trial like some competitors), generous storage for a pilot |
| Redis | *(skip for now)* | Nothing in the code actually uses Redis yet (no async job queue wired up) — add **Upstash** (free tier) only once the AI job queue (doc 07) is built |

Caveat: Render's free instances spin down after ~15 minutes idle and cold-start (~30-60s) on the next request. Fine for an early pilot; upgrade to a paid instance ($7/mo) once real traffic makes cold starts annoying.

### Setup steps

1. **Neon**: create a free project → copy the connection string (`postgres://...neon.tech/...?sslmode=require`). Run the 3 migration files against it once, in order, via the Neon SQL editor or `psql`:
   - `services/api/db/migrations/001_init.sql`
   - `services/api/db/migrations/002_catalog.sql`
   - `services/api/db/migrations/003_auth.sql`
2. **Render**: New → Blueprint → connect this GitHub repo → it reads [infra/render.yaml](../infra/render.yaml) and creates `productdesignos-core-api` and `productdesignos-api` as free Docker web services. After first deploy, set the secrets it asks for (`DATABASE_URL` = the Neon string, `JWT_SECRET` = any random string, same value on both services so tokens are portable).
3. **Vercel**: New Project → import this repo → set **Root Directory** to `apps/web` (monorepo) → add env vars:
   - `NEXT_PUBLIC_API_URL` = your Render `productdesignos-api` URL
   - `NEXT_PUBLIC_CORE_API_URL` = your Render `productdesignos-core-api` URL
   - `CORE_API_URL` = same core-api URL (used server-side for the landing page/SSR fetch)
4. Push to `main` — Render and Vercel both auto-deploy on push once connected; no CI changes needed beyond what already exists.

### What changed in the repo to support this

- `services/api/src/db.ts` now accepts a single `DATABASE_URL` (Neon/Supabase-style connection string) as well as the existing discrete `POSTGRES_*` vars — no behavior change for the local Docker Compose setup.
- New [infra/render.yaml](../infra/render.yaml) Blueprint (Docker-based, matches the existing Dockerfiles — no new build config needed).
