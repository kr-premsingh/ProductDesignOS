# Risks & Open Questions

## Key risks

- **IP/copyright exposure** — both AI-generated output (trained on unknown data) and UGC uploads (users posting others' work) create takedown/legal risk. Mitigation: screening pipeline (doc 07), clear ToS, fast takedown process, avoid training/fine-tuning on scraped copyrighted assets.
- **Marketplace cold-start (chicken-and-egg)** — a feed with no providers has nothing to "make real"; a provider with no feed traffic has no leads. Mitigation: concierge-onboard a small curated provider pool per launch vertical before public launch (phase 4), seed feed with curated/licensed or AI content first.
- **Physical fulfillment quality control** — we don't control local providers' production quality/shipping times. Mitigation: start with POD/dropship partners (higher reliability, no inventory risk) for apparel; gate local providers behind verification tiers (doc 04) and review-driven trust scores.
- **Credit economy abuse** — bot/multi-account farming of free credits. Mitigation: rate limits per trust tier, phone/email verification gates before meaningful free-credit grants, anomaly monitoring.
- **Moderation at small-team scale** — UGC + AI output both need review. Mitigation: default new/low-trust content to followers-only visibility until auto/manual review clears it for public feed; keep the review queue small by curating launch content initially rather than opening uploads to everyone on day one.
- **AI cost overrun** — hosted API costs scaling faster than credit-grant assumptions. Mitigation: per-job cost tracking from day one (doc 07), tiered resolution, rate limits, and an explicit self-hosting decision gate.
- **Scope creep across too many verticals at once** — dilutes content density and provider supply per category, weakening the feed in every category rather than being strong in a few. Mitigation: hold the line at 2-3 launch verticals (doc 02) until each has clear traction.

## Open questions to resolve before/at Phase 0

1. Final pick of the 2-3 launch verticals (business decision — doc 02 gives a recommendation but this needs sign-off).
2. Which hosted open-weight AI providers to trial for image/LLM generation, and initial credit-cost-per-job numbers (needs a short bake-off, doc 07).
3. Payment processor and compliance approach for the eventual real-money phase (Stripe Connect is the likely default for marketplace payouts, but tax/compliance handling needs a decision before Phase 2 real-money work begins).
4. How much UGC upload to allow at launch vs. curated-only content (affects moderation workload).
5. Self-hosting budget/infra owner — who stands up and operates rented-GPU inference once volume justifies it.
6. Legal review of AI-output ownership/usage-rights language in the ToS before public (non-pilot) launch.
