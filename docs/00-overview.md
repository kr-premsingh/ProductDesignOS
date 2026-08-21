# ProductDesignOS — Planning Docs (v2)

This `docs/` set is the working plan for the platform, written before any new code. It supersedes the scope in the root `PROMPT_Claude.md` / `PROMPT_Codex.md` (kept as historical reference; the current `apps/web` + `services/*` code is a throwaway MVP scaffold, not a constraint).

**One-line vision:** A platform where anyone can discover design inspiration (UGC + AI), remix it into something personal with integrated AI, showcase it like a portfolio, and — when they want the real thing — get it made or sold by a real creator/provider (digital or physical).

Read in this order:

1. [01-vision-and-strategy.md](01-vision-and-strategy.md) — why, wedge, competitive framing, flywheel
2. [02-audience-niches.md](02-audience-niches.md) — who we serve, which verticals first
3. [03-experience-and-flows.md](03-experience-and-flows.md) — every screen/flow end to end
4. [04-roles-and-marketplace.md](04-roles-and-marketplace.md) — extensible roles + marketplace model
5. [05-architecture.md](05-architecture.md) — system design, service boundaries
6. [06-data-model.md](06-data-model.md) — entities and relationships
7. [07-ai-strategy.md](07-ai-strategy.md) — open-weight/hybrid AI, cost control, adapter pattern
8. [08-credits-and-monetization.md](08-credits-and-monetization.md) — credits now, currency later
9. [09-mvp-roadmap.md](09-mvp-roadmap.md) — phased plan for a 2-5 person team, ~2-3 months
10. [10-risks-and-open-questions.md](10-risks-and-open-questions.md) — what could break this, what's still undecided
11. [11-brand-and-visual-identity.md](11-brand-and-visual-identity.md) — visual direction options, recommended pick
12. [12-landing-page-design.md](12-landing-page-design.md) — landing page section-by-section spec
13. [13-repo-structure-target.md](13-repo-structure-target.md) — target modular-monolith folder layout & migration plan

## Ground rules from the brainstorm

- No single fixed niche — support many verticals, but **launch with 2-3** that are high-demand and operationally feasible (see doc 02).
- Supply side (creators/providers) must be **role-based and extensible**, not hardcoded account types (see doc 04).
- **No real money in MVP** — a credits system that is designed so it can be swapped for real currency later without a data-model rewrite (see doc 08).
- AI: **hybrid** — hosted APIs on open-weight models first, self-host on rented GPUs once volume justifies it (see doc 07).
- Team: small (2-5 people), 2-3 month runway to pilot.
