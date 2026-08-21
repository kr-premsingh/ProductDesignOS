# Tech Stack Decision

Confirms and elaborates the direction: **TypeScript on the frontend, Rust on the backend, WebAssembly (compiled from Rust) for heavy client-side compute, and Docker-first for every service.** This updates [05-architecture.md](05-architecture.md) and [13-repo-structure-target.md](13-repo-structure-target.md) with concrete technology choices; it doesn't change the module boundaries or data model already agreed there.

## Frontend

- **Next.js + TypeScript** (unchanged) — `apps/web`.
- **`packages/ui`** — shared tokens/components (unchanged).
- **WASM modules** (new) — compiled from Rust via `wasm-bindgen`/`wasm-pack`, published as a small package (e.g. `packages/vision-wasm`) and imported into `apps/web` like any other npm package. Used only where client-side compute is genuinely heavy — everything else stays plain TS/React for iteration speed.

### Concrete WASM use cases (why WASM, not just JS)

| Use case | Where it's used | Why WASM |
|---|---|---|
| Palette extraction / background-removal preview | Design Studio, before upload | Instant feedback, avoids an API round-trip and AI credit spend for a cheap operation |
| Vector logo render/recolor engine | Design Studio (branding vertical) | Live recolor/edit of SVG paths needs to feel instant while iterating on 3 variants |
| Print-ready export (SVG→CMYK-safe PNG/PDF, apparel mockup compositing) | "Make it real" export step | Canvas-heavy compositing done locally, keeps the API stateless and cheap |
| Moodboard/collage auto-layout (bin-packing) | Boards/portfolio export | Layout math is CPU-bound and has no reason to hit a server |
| Client-side perceptual hash / near-duplicate check | Upload flow | Cheap pre-filter before server-side moderation (doc 07) runs |
| (Stretch, post-pilot) tiny distilled model run fully in-browser via `candle` → wasm | Instant tagging | Only once proven valuable — not MVP |

Rule of thumb: reach for WASM only when profiling shows a real client-side CPU bottleneck or when sharing Rust types/logic (via `serde`) between server and browser removes real duplication — not by default for every feature.

## Backend

**Rust**, replacing the Node/Fastify MVP scaffold module by module (the existing `services/api` is treated as a disposable reference implementation, per the earlier "full rethink" decision — it keeps running until each module has a Rust replacement, not ripped out in one shot).

| Component | Tech | Why |
|---|---|---|
| Core API (`auth`, `catalog`, `commerce`, `social`, `trust` modules) | Rust + **Axum** (tokio, tower) | Modern idiomatic async framework; tower middleware ecosystem gives us auth/rate-limit/tracing layers for free |
| DB access | **SeaORM** (async, migrations via `sea-orm-cli`) | More productive than raw `sqlx` for CRUD-heavy catalog/commerce modules; async-first |
| Auth | `jsonwebtoken` + `argon2` crates | Same JWT-based approach as today, just in Rust |
| AI orchestration service | Rust + Axum, `reqwest` client to hosted open-weight APIs | Thin orchestration only — v1 AI strategy is hosted inference (doc 07), so no Python ML stack needed yet |
| Async job queue | Redis + `apalis` crate (or Postgres-based `pgmq` later) | Matches the async AI-job pattern in doc 05 |
| Self-hosted AI (future, once volume justifies it) | `candle` (Rust-native ML) where model support allows; a Python/Triton sidecar as fallback, isolated behind the same `AIProvider` HTTP contract | Stays in the Rust ecosystem where possible without blocking on model support |
| API contract | `utoipa` (OpenAPI generation from Rust types) | Generates a schema the TS frontend can codegen a typed client from — keeps FE/BE in sync without hand-written types |
| Realtime (order/job status, notifications) | Axum WebSockets | Avoids standing up a separate realtime service |
| Testing | `cargo test`, `insta` (snapshot tests), `testcontainers-rs` (real Postgres/Redis in CI) | |
| Object storage client | `aws-sdk-s3` (S3-compatible: R2/S3) | Matches doc 05 infra plan |

### Why Rust for the backend, trade-offs acknowledged

- **Pros:** performance/memory safety, one language spanning backend + WASM (share `serde` types between server and browser), lower long-run infra cost per request, a stronger type system for a system that's increasingly commerce/payments-adjacent (credits ledger, orders).
- **Cons:** slower initial dev velocity than TS for a team not yet fluent in Rust, smaller hiring pool, longer compile times.
- **Mitigations:** `cargo-chef` for Docker layer caching (dependencies rebuild only when `Cargo.toml` changes, not on every source edit); port one module at a time starting with the most stable/highest-value one (`catalog`) instead of a full rewrite; keep the Node scaffold serving traffic for not-yet-ported modules so product work isn't blocked on the migration.

## Migration plan (extends, doesn't replace, [09-mvp-roadmap.md](09-mvp-roadmap.md))

- Product increments that don't require new backend modules keep shipping against the existing Node `services/api` (e.g. the landing page work already shipped).
- A new **`services/core-api`** Rust/Axum workspace is introduced now, alongside the Node API, starting with a health-check and growing one module at a time (see doc 13 for module boundaries). Each ported module's Node routes are deleted once the Rust equivalent is live behind the same contract.
- `services/ai` follows the same pattern: new AI orchestration logic goes into Rust; the existing TS stub adapter stays as a reference until parity is reached.

## Docker-first

- Every service ships its own `Dockerfile` — nothing is expected to run bare-metal for local dev.
- `infra/docker-compose.yml` is the single source of truth for the full dev stack: `web`, `api` (Node, current), `core-api` (Rust, new), `postgres`, `redis`.
- One-click scripts (`scripts/dev-up.ps1` / `scripts/dev-up.sh`) build and start the entire stack; `scripts/dev-down.ps1` / `scripts/dev-down.sh` tear it down. Postgres runs the SQL migrations in `services/api/db/migrations` automatically on first boot via Postgres's `docker-entrypoint-initdb.d` mechanism.
- `infra/prod` remains the production Compose profile; it gains `core-api` and `redis` as those become real once the Rust migration has usable modules.
