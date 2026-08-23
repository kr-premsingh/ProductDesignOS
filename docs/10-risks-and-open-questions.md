# Risks & Open Questions

## Key risks

- **IP/copyright exposure** — both AI-generated output (trained on unknown data) and UGC uploads (users posting others' work) create takedown/legal risk. Mitigation: screening pipeline (doc 07), clear ToS, fast takedown process, avoid training/fine-tuning on scraped copyrighted assets.
- **Inspiration feed cold-start** — without strong feed content, the remix loop feels empty. Mitigation: seed the feed with AI designs, curated trend packs, creator uploads, and early user-published remixes; treat each feed card as an actionable Design, not a static pin.
- **Marketplace cold-start (chicken-and-egg)** — a feed with no providers has no fulfillment path; a provider with no demand has no reason to join. Mitigation: start physical goods as mockups + ProductIntent capture, then onboard providers only where demand is visible.
- **Physical fulfillment quality control** — we don't control local providers' production quality/shipping times. Mitigation: delay broad physical fulfillment, start with POD/dropship or a very small provider pilot, gate providers behind verification tiers (doc 04), and use review-driven trust scores.
- **Credit economy abuse** — bot/multi-account farming of free credits. Mitigation: rate limits per trust tier, phone/email verification gates before meaningful free-credit grants, anomaly monitoring.
- **Moderation at small-team scale** — UGC + AI output both need review. Mitigation: default new/low-trust content to followers-only visibility until auto/manual review clears it for public feed; keep the review queue small by curating launch content initially rather than opening uploads to everyone on day one.
- **AI cost overrun** — hosted API costs scaling faster than credit-grant assumptions. Mitigation: per-job cost tracking from day one (doc 07), tiered resolution, rate limits, and an explicit self-hosting decision gate.
- **Scope creep across too many formats at once** — dilutes content quality and makes the studio feel generic. Mitigation: support broad clusters, but ship a curated set of high-demand formats first: ads, banners, thumbnails, posters, wall art, T-shirt/hoodie/cap/gift mockups, and logos/brand assets.

## Open questions to resolve before/at Phase 0

1. Final pick of the launch formats inside each cluster (e.g., YouTube thumbnail, Instagram ad, LinkedIn banner, A4 poster, T-shirt front print, hoodie back print, mug wrap, wall poster).
2. Which hosted open-weight AI providers to trial for image/LLM generation, and initial credit-cost-per-job numbers (needs a short bake-off, doc 07).
3. Payment processor and compliance approach for the eventual real-money phase (Stripe Connect is the likely default for marketplace payouts, but tax/compliance handling needs a decision before Phase 2 real-money work begins).
4. Which physical product mockups to support before provider onboarding, and what export specs each needs.
5. How much UGC upload to allow at launch vs. curated-only content (affects moderation workload).
6. Self-hosting budget/infra owner — who stands up and operates rented-GPU inference once volume justifies it.
7. Legal review of AI-output ownership/usage-rights language in the ToS before public (non-pilot) launch.
