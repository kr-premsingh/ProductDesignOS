# Credits & Monetization

## MVP stance: credits, not currency — but designed to become currency

No real money moves in the pilot. Every "spend" (AI generation, and optionally marketplace actions) draws from a **credit balance**, recorded as an append-only ledger (`CreditLedgerEntry`, doc 06) so the system already looks and behaves like a payments ledger. The only thing that changes when we flip on real money is (a) how credits are acquired (purchase vs. free grants) and (b) adding a payout/payment adapter — no schema or flow rewrite.

## Acquiring credits (pilot)

- Signup bonus (fixed starter grant).
- Referral bonus (both sides get credits).
- Engagement quests (complete profile, first remix, first save, first follow) — cheap growth lever, no cash cost.
- Optional: admin/manual grants for pilot cohorts, partners, feedback participants.

## Spending credits (pilot)

- AI generation actions (per doc 07's cost table).
- Optional: allow credits to cover marketplace orders during pilot as **platform-funded promo credit** (clearly distinguished in the ledger with reason `promo_grant`) so we can test the marketplace transaction flow end-to-end without real payment rails yet — but keep this ledger-tagged separately from "earned" credits so it's easy to strip out later.

## Provider/creator side in the pilot

- Free storefront/portfolio and marketplace listing — no platform fee collected yet (fee = 0%, but the field exists and is logged so switching it on later is a config change, not a rebuild).
- Providers still go through the full `Order` state machine (doc 04) so operational kinks (quoting, messaging, fulfillment tracking) are validated before money is involved.

## The ledger → currency bridge (build this now, flip it later)

- `CreditLedgerEntry.reason` and a planned `creditToCurrencyRate` config value let us introduce **purchasable credits** (Stripe Checkout → credits) without changing how credits are spent.
- `Order` gets an optional `paymentIntentId` field from day one (nullable, unused in pilot) so adding Stripe Connect (for provider payouts) later doesn't require an `Order` schema migration.
- Take-rate/commission is modeled as a `platformFeeBps` on `Offering`/`Order`, defaulted to `0` in pilot, so turning on commission is a config flip, not new code.

## Future monetization mechanics (post-pilot, in likely rollout order)

1. **Commission/take-rate** on marketplace transactions (like Etsy) — most aligned with the marketplace model, turn on once order volume and trust are proven.
2. **Creator/provider subscriptions** — storefront features, analytics, bulk AI credit bundles, reduced take-rate at higher tiers.
3. **Consumer subscription** — unlimited/faster AI generations, higher-res exports, priority queue.
4. **Promoted listings / boosted pins** — ad-like placement in the feed, once feed traffic is meaningful.
5. **Lead-gen fee** (Houzz-style) for providers who prefer paying per qualified quote request rather than commission.
6. **Agency/enterprise plans** — seats, shared credit pools, (later) white-label.

## Validation gates before turning on real monetization

- Activation rate (of signups, % who complete a remix).
- Remix→save and remix→"make it real" request conversion.
- Provider fulfillment completion rate and review scores.
- Repeat usage (WAU/MAU, week-2 retention).
- Explicit would-pay signal (pricing survey, waitlist-for-paid-features, or a "reserve at future price" soft-commit flow) before building full billing.
