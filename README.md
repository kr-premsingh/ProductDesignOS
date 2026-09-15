# ProductDesignOS

ProductDesignOS is an MVP for an individuality-first design operating system: a premium landing experience, curated Inspire feed, AI logo demo with deterministic stubs, public profiles, design trends, and provider onboarding.

> **Planning v2:** The full product vision, architecture, and roadmap (discovery + AI remix + portfolio + marketplace, across multiple verticals) is being redesigned. See [docs/00-overview.md](docs/00-overview.md) before making significant product/architecture changes. The code below is the original MVP scaffold and is treated as reference only.

## Monorepo & Services

- Monorepo with npm workspaces
- `apps/web`: Dooniq product frontend (Next.js, TypeScript, Tailwind CSS). It currently host-routes the ProductDesignOS company site at `productdesignos.com`; it becomes `apps/company` only when the company site needs an independent release cycle.
- `apps/company` (planned): ProductDesignOS company frontend for brand, team, partnerships, and deals.
- `services/core-api`: Rust/Axum product API. Owns catalog, auth, AI jobs, social/boards, and commerce modules; it is the forward path.
- `services/api`: Fastify legacy compatibility API. Keep until its remaining endpoints are migrated to `core-api`, then retire it.
- `services/ai`: legacy TypeScript stub adapter; hosted/self-hosted provider adapters belong behind the Rust `AIProvider` trait going forward.
- `packages/ui`: shared tokens and primitives
- `infra`: Docker Compose and app Dockerfiles

Each deployed backend service has its own Dockerfile and Compose service. The frontend split is intentionally deferred while both domains share the same deployment and data model; this avoids duplicate auth, packages, and deployments during the pilot.

## Run Locally

```bash
npm install
npm run dev:api
npm run dev:web
```

The web app runs on `http://localhost:3000`. The API runs on `http://localhost:4000`.

## Environment

Create `.env.local` in `apps/web` when using a remote API:

```bash
NEXT_PUBLIC_API_URL=http://localhost:4000
NEXT_PUBLIC_ANALYTICS_ENABLED=false
```

Create `.env` in `services/api`:

```bash
PORT=4000
JWT_SECRET=replace-me
AI_PROVIDER=stub
OPENAI_API_KEY=
ANTHROPIC_API_KEY=
```

No keys are required for the MVP. The AI service returns deterministic SVG logo variants when keys are missing.

## Scripts

```bash
npm run dev
npm run build
npm run lint
npm run test
npm run typecheck
```

## API

- `GET /api/inspire?page=&filter=`
- `GET /api/trends`
- `POST /api/ai/logo`
- `GET /api/ai/job/:id`
- `POST /api/auth/signup`
- `POST /api/auth/login`
- `GET /api/profile/:username`
- `POST /api/providers`
- `POST /api/privacy/delete`

## Seed Content

Seed data lives in `services/api/src/seed.ts` and is mirrored in the web fallback data at `apps/web/src/lib/mock-data.ts`.

## Docker

```bash
docker compose -f infra/docker-compose.yml up --build
```

To build, start, and smoke-test the full local stack in one command:

```bash
bash scripts/test-stack.sh
# or, from Git Bash/WSL:
npm run test:docker
```

It checks the Dooniq frontend (`3000`), legacy API (`4000`), and Rust core API (`4100`); Postgres and Redis are Compose dependencies.

## Production Deploy

For a Linux home server, use the production profile in `infra/prod`.

```bash
cd infra/prod
cp .env.example .env
docker compose --env-file .env up -d --build
```

Point your domain DNS `A` record to the home server public IP, forward ports `80` and `443`, then add the GitHub Actions secrets listed in `infra/prod/README.md`.

## Notes

This is a fast MVP scaffold. The next production pass should replace in-memory stores with a database, add email verification, wire real analytics, and add persistent object storage for provider portfolios.
