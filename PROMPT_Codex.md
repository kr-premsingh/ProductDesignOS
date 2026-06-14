# ProductDesignOS Engineering Brief

Build the ProductDesignOS website MVP and backend services with a modern, premium, futuristic UI, minimal text, and addictive exploration.

## MVP Scope

- Landing page with early access capture
- Inspire feed with 30 seeded tiles and filters
- AI logo demo returning three variants through a stub-capable adapter
- Public profile pages
- Design trends hub
- Provider onboarding flow
- Auth, profile, content, provider, and AI job API endpoints
- Docker, CI, README, and tests

## Architecture

- `apps/web`: Next.js + TypeScript + Tailwind CSS
- `services/api`: Node.js + TypeScript + Fastify
- `services/ai`: adapter pattern for AI providers
- `packages/ui`: shared tokens and primitives
- `infra`: Docker Compose and deployment assets

## Acceptance Criteria

- Landing page is responsive and opens early access capture
- Inspire feed shows seeded tiles with pagination/filtering
- AI demo produces three SVG logo variants without live API keys
- Public profile route renders seeded profile data
- Provider onboarding submits a provider record
- Basic analytics hooks exist for page views and demo submissions
