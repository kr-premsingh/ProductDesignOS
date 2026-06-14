# ProductDesignOS

ProductDesignOS is an MVP for an individuality-first design operating system: a premium landing experience, curated Inspire feed, AI logo demo with deterministic stubs, public profiles, design trends, and provider onboarding.

## Stack

- Monorepo with npm workspaces
- `apps/web`: Next.js, TypeScript, Tailwind CSS
- `services/api`: Fastify API, JWT auth, in-memory MVP stores
- `services/ai`: adapter layer with deterministic logo stubs
- `packages/ui`: shared tokens and primitives
- `infra`: Docker Compose and app Dockerfiles

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
