# MVP Roadmap (2-5 person team, ~2-3 months to pilot)

Assumed team shape: 1 full-stack/tech lead, 1-2 product/frontend engineers, 1 backend/infra engineer, 1 part-time design/content (can be founder-covered). Adjust phase lengths if team is smaller/larger.

## Phase 0 — Foundations (Weeks 1-2)

- Finalize brand/positioning and pick the launch category/format clusters (doc 02): digital creatives, personalized product mockups, brand assets, and spaces/wall art.
- Stand up Postgres + object storage (replace in-memory MVP stores); keep Docker Compose for pilot but move stateful data off a single home server.
- Data model v1 (doc 06): `User`, `UserRole`, `Organization`, `Category`, `DesignFormat`, `Design`, `Board`, `Mockup`, `ProductIntent`, `CreditLedgerEntry`.
- Auth + role/capability framework (doc 04).
- `AIProvider` adapter interface wired to one hosted open-weight image provider + one LLM provider (doc 07).

## Phase 1 — Core loop (Weeks 3-5)

- Explore/Inspire feed seeded with AI designs, curated trend packs, creator uploads, and early user-published remixes across chosen category/format clusters.
- Design Studio: prompt-from-pin, 3-variant generation, credit debit, save/publish.
- Format controls: ad/banner/thumbnail/poster/social size selection, plus physical-product mockup targets for T-shirt/hoodie/cap/mug/gift/wall poster.
- Boards/save, follow, public/private/followers-only visibility.
- Basic profile/portfolio pages.
- Analytics: page views, remix starts/completions, save rate, export clicks, mockup clicks, and product-intent clicks.

## Phase 2 — Exports, Mockups, And Demand Capture (Weeks 6-8)

- High-res export and print-ready download gates backed by credits.
- Product mockup generation for physical surfaces (T-shirt, hoodie, cap, mug, gift, wall poster).
- ProductIntent capture: "I want this made" with product type and optional geography.
- Creator onboarding: role selection, category/format selection, portfolio import, remix permission controls.
- Provider waitlist/onboarding interest, segmented by product type and location; no broad physical fulfillment yet.

## Phase 2b — Marketplace v1 (provider pilot only)

- Provider onboarding for the highest-demand product categories from ProductIntent data.
- `Offering` creation (digital, physical, service) with category-specific attribute forms.
- Custom quote request flow + messaging thread.
- Order state machine (doc 04) with credit-based or manual pilot payment handling; Stripe Connect fields stubbed but inactive until real payouts are approved.

## Phase 3 — Trust & growth loop (Weeks 9-10)

- Reviews on completed orders once provider pilots begin, feeding provider trust score and feed ranking.
- Notifications (follows, comments, quotes, order status).
- Referral credit flow, engagement quests.
- Moderation queue + report/flag action; AI-output IP/trademark screening (doc 07).
- Founder-facing analytics dashboard (activation, remix conversion, order completion, retention — the metrics from doc 08's validation gates).

## Phase 4 — Closed pilot launch (Weeks 11-12)

- Invite-only waitlist cohort across the launch clusters; concierge-onboard creators first and only onboard physical providers where product-intent data shows demand.
- Monitor cost-per-generation vs. credit cost assumptions (doc 07/08) and core funnel metrics.
- Weekly feedback loop → fast-follow fixes.

## Post-pilot (not in the 2-3 month window, but the design should not block these)

- Turn on paid credit packs first; later add Stripe Connect provider payouts and flip `platformFeeBps` on.
- Expand to more design formats via `Category` + `DesignFormat` config.
- Revisit self-hosting AI once usage data shows a clear cost crossover (doc 07).
- Visual/similarity search, learned feed ranking.

## Sequencing rationale

Provider marketplace work intentionally comes *after* the AI remix/export/mockup loop is validated. The first business signal is not "can we onboard providers into an empty market?", but "which designs and products do users repeatedly remix, export, and ask to make real?"
