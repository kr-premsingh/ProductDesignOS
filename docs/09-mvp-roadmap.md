# MVP Roadmap (2-5 person team, ~2-3 months to pilot)

Assumed team shape: 1 full-stack/tech lead, 1-2 product/frontend engineers, 1 backend/infra engineer, 1 part-time design/content (can be founder-covered). Adjust phase lengths if team is smaller/larger.

## Phase 0 — Foundations (Weeks 1-2)

- Finalize brand/positioning and pick the 2-3 launch verticals (doc 02) — business decision, not just engineering.
- Stand up Postgres + object storage (replace in-memory MVP stores); keep Docker Compose for pilot but move stateful data off a single home server.
- Data model v1 (doc 06): `User`, `UserRole`, `Organization`, `Category`, `Design`, `Board`, `CreditLedgerEntry`.
- Auth + role/capability framework (doc 04).
- `AIProvider` adapter interface wired to one hosted open-weight image provider + one LLM provider (doc 07).

## Phase 1 — Core loop (Weeks 3-5)

- Explore/Inspire feed seeded with UGC + AI content across chosen verticals, with category/style filters.
- Design Studio: prompt-from-pin, 3-variant generation, credit debit, save/publish.
- Boards/save, follow, public/private/followers-only visibility.
- Basic profile/portfolio pages.
- Analytics: page views, remix starts/completions, save rate (already flagged as an acceptance criterion in the old brief — keep it).

## Phase 2 — Marketplace v1 (Weeks 6-8)

- Provider onboarding: role selection, category selection, verification tier 1-2, portfolio import.
- `Offering` creation (digital, physical, service) with category-specific attribute forms.
- Custom quote request flow + messaging thread.
- Order state machine (doc 04) with credit-based "payment" (or promo-credit for physical goods pilot), no live external payments yet; Stripe Connect fields stubbed but inactive.

## Phase 3 — Trust & growth loop (Weeks 9-10)

- Reviews on completed orders, feeding provider trust score and feed ranking.
- Notifications (follows, comments, quotes, order status).
- Referral credit flow, engagement quests.
- Moderation queue + report/flag action; AI-output IP/trademark screening (doc 07).
- Founder-facing analytics dashboard (activation, remix conversion, order completion, retention — the metrics from doc 08's validation gates).

## Phase 4 — Closed pilot launch (Weeks 11-12)

- Invite-only waitlist cohort across the launch verticals; concierge-onboard the first providers to solve cold-start (don't rely on organic supply yet).
- Monitor cost-per-generation vs. credit cost assumptions (doc 07/08) and core funnel metrics.
- Weekly feedback loop → fast-follow fixes.

## Post-pilot (not in the 2-3 month window, but the design should not block these)

- Turn on real payments: Stripe Checkout (credit purchase) + Stripe Connect (provider payouts), flip `platformFeeBps` on.
- Expand to next verticals (home decor, tattoo, packaging) via `Category` config.
- Revisit self-hosting AI once usage data shows a clear cost crossover (doc 07).
- Visual/similarity search, learned feed ranking.

## Sequencing rationale

Marketplace (phase 2) intentionally comes *after* the AI remix core loop (phase 1) is validated — the flywheel (doc 01) needs the "make it real" moment to have real inspiration content behind it, otherwise providers launch into an empty feed (cold-start risk, doc 10).
