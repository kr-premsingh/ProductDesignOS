# Credits & Monetization

## MVP stance: credits first, provider payouts later

Every "spend" (AI generation, remix, high-res export, mockup generation, and optionally marketplace actions later) draws from a **credit balance**, recorded as an append-only ledger (`CreditLedgerEntry`, doc 06) so the system already looks and behaves like a payments ledger. We can run the earliest pilot with free/admin/referral credits, then introduce purchasable credits before provider payouts are ready.

## Acquiring credits (pilot)

- Signup bonus (fixed starter grant).
- Referral bonus (both sides get credits).
- Engagement quests (complete profile, first remix, first save, first follow) — cheap growth lever, no cash cost.
- Optional: admin/manual grants for pilot cohorts, partners, feedback participants.

## Spending credits (pilot)

- AI generation and remix actions (per doc 07's cost table).
- High-res exports and print-ready downloads.
- Product mockups (T-shirt, hoodie, cap, mug, gift, poster/wall art).
- Optional: allow credits to cover marketplace orders in a later closed pilot as **platform-funded promo credit** (clearly distinguished in the ledger with reason `promo_grant`) so we can test the transaction flow end-to-end without provider payouts yet.

## Creator/provider side in the pilot

- Free creator profile/portfolio and remixable design uploads.
- Physical providers are onboarded only after we see enough product-intent signals by category/product/geography.
- When provider pilots begin, providers still go through the full `Order` state machine (doc 04) so operational kinks (quoting, messaging, fulfillment tracking) are validated before broad rollout.

## The ledger → currency bridge (build this now, flip it later)

- `CreditLedgerEntry.reason` and a planned `creditToCurrencyRate` config value let us introduce **purchasable credits** (Stripe Checkout → credits) without changing how credits are spent.
- `Order` gets an optional `paymentIntentId` field from day one (nullable, unused in pilot) so adding Stripe Connect (for provider payouts) later doesn't require an `Order` schema migration.
- Take-rate/commission is modeled as a `platformFeeBps` on `Offering`/`Order`, defaulted to `0` in pilot, so turning on commission is a config flip, not new code.

## Future monetization mechanics (post-pilot, in likely rollout order)

1. **Paid credit packs** — generations, remixes, high-res exports, print-ready downloads, product mockups.
2. **Brand/agency plans** — seats, shared credit pools, brand kits, asset libraries, bulk exports, client boards.
3. **Creator subscriptions** — portfolio/storefront features, analytics, bulk AI credit bundles, remix licensing controls.
4. **Commission/take-rate** on marketplace transactions — turn on once provider fulfillment and trust are proven.
5. **Promoted listings / boosted designs** — ad-like placement in the feed, once feed traffic is meaningful.
6. **Lead-gen fee** for providers who prefer paying per qualified request rather than commission.

## Validation gates before turning on real monetization

- Activation rate (of signups, % who complete a remix).
- Remix→save, remix→export, and remix→mockup conversion.
- Product-intent signals by product type (T-shirt, hoodie, cap, mug, wall poster, gift, etc.).
- Provider fulfillment completion rate and review scores once provider pilots begin.
- Repeat usage (WAU/MAU, week-2 retention).
- Explicit would-pay signal (pricing survey, waitlist-for-paid-features, or a "reserve at future price" soft-commit flow) before building full billing.
