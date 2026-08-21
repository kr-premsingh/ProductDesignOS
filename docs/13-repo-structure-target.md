# Target Repo Structure

This is the target layout for the modular-monolith design in [05-architecture.md](05-architecture.md). It's a **design doc for incremental migration**, not a one-shot rewrite — existing code keeps working while modules are introduced one at a time (start with whichever module the next build task needs, e.g., `catalog` when building the new Explore feed).

## Current state (for reference)

```
apps/web/src/{app,components,lib}
services/api/src/{app.ts, db.ts, seed.ts, server.ts, types/}
services/ai/src/index.ts
packages/ui/src/{index.ts, tokens.ts}
```

Flat, fine for the logo-demo MVP; doesn't yet reflect the module boundaries (auth/catalog/ai/commerce/social/trust) the platform needs.

## Target layout

```
apps/
  web/
    src/
      app/                      -- Next.js routes (thin: fetch + compose only)
        (marketing)/             -- landing, about, for-creators, pricing
        explore/                 -- feed
        studio/                  -- AI remix workspace
        p/[username]/            -- public profile/portfolio
        providers/[slug]/        -- storefront
        onboarding/               -- creator/provider onboarding
      features/                  -- feature-oriented UI modules (mirrors backend modules)
        catalog/                 -- feed cards, board UI, design detail
        studio/                  -- AI remix UI, variant picker
        profile/
        marketplace/             -- offering forms, order flow, messaging
        onboarding/
      components/                -- cross-feature shared components (nav, footer, early-access)
      lib/                       -- api client, analytics, auth context

services/
  api/
    src/
      modules/
        auth/                    -- users, roles, capabilities, sessions
        catalog/                 -- designs/pins, boards, categories, tags
        ai/                      -- job orchestration, calls services/ai
        commerce/                -- offerings, orders, quotes, credit ledger
        social/                  -- follows, comments, notifications
        trust/                   -- verification, moderation, reviews
      shared/                    -- cross-module utils (db client, error types, capability middleware)
      server.ts, app.ts           -- composition root (wires modules' routes together)

  ai/
    src/
      providers/                 -- one file per AIProvider adapter (hosted-open-weight, stub, ...)
      orchestrator.ts             -- shared job-dispatch logic
      index.ts

packages/
  ui/
    src/
      tokens.ts                  -- extended per docs/11 (accent-per-category, paper/ink)
      primitives/                -- Button, Card, Chip, Badge, etc. (currently just index.ts — split out)
      index.ts

docs/                             -- this planning set (00-13...), kept as living documentation
infra/                             -- unchanged for now
```

## Migration principles

- **Module = folder + owns its own tables.** A module's code never imports another module's internal files directly — only through a small exported interface (e.g., `commerce` calls `auth.getCapabilities(userId)`, not raw SQL on the users table).
- **`app/` (Next.js routes) stay thin.** Route files fetch data and compose `features/*` components; feature logic (feed ranking display, studio state, order forms) lives in `features/`, not inline in route files — this is what lets the web app's structure mirror the backend module boundaries.
- **No forced big-bang move.** When work touches the feed, introduce `services/api/src/modules/catalog/` and `apps/web/src/features/catalog/` then; don't migrate untouched modules preemptively.
- **`packages/ui`** grows from a single `index.ts`/`tokens.ts` into a small primitives library as soon as more than ~2 features need a shared component — avoids duplicating buttons/cards per feature folder.
- **Extraction-ready:** because modules don't cross-import internals, moving `commerce` or `ai` into a standalone deployable service later (per doc 05's rationale) is a move-the-folder-and-add-an-HTTP-boundary operation, not a redesign.

## Naming/consistency conventions

- Backend module names match the domains in [06-data-model.md](06-data-model.md) exactly (`catalog`, `commerce`, `trust`, ...) so docs, code, and tickets all use the same vocabulary.
- Frontend `features/*` folder names mirror backend module names where there's a 1:1 relationship (`catalog`, `marketplace` ~ `commerce`), diverging only where the UI grouping is genuinely different from the data-owning module (e.g., `studio` is UI for the `ai` module + parts of `catalog`).

## Suggested order of introduction (matches [09-mvp-roadmap.md](09-mvp-roadmap.md))

1. `auth` + `catalog` + `ai` modules, `features/catalog` + `features/studio` UI — Phase 0-1 (feed + remix core loop).
2. `commerce` + `trust` modules, `features/marketplace` + `features/onboarding` UI — Phase 2.
3. `social` module (follows/notifications) — Phase 3.
