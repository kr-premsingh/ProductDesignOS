# Landing Page — Design Spec

Positioning shift from the old brief: the old hero ("A Design OS for Individuality") was logo/branding-flavored. The new landing page must read as a remix-first platform for common digital and physical-product design: ads, banners, thumbnails, posters, wall art, brand assets, apparel graphics, gifts, and product mockups. Visual direction: Option C, "Adaptive Canvas" ([11-brand-and-visual-identity.md](11-brand-and-visual-identity.md)).

## Goals (in priority order)

1. Get a first-time visitor into the **live AI remix demo** within one click, no login (biggest activation lever).
2. Communicate the full loop — *discover → remix → export/mock up → showcase → later get it made* — in under 10 seconds of scrolling.
3. Split intent early: "I want inspiration/AI" vs. "I want to sell/showcase my work" (consumer vs. creator/provider), without forcing a choice before value is shown.
4. Capture early access / waitlist emails, tagged by category interest and by consumer-vs-creator intent.

## Page structure

### 1. Nav

- Logo/wordmark, left.
- Center/right links: Explore, Studio (AI Demo), For Creators, Pricing (future/"Free in beta"), links scroll or route depending on what exists yet.
- Right: "Join Early Access" (primary button), "For Creators & Providers" (secondary/text link) — two distinct CTAs from the top, since consumer and supply-side visitors have different jobs-to-be-done (doc 02).

### 2. Hero

- **Headline (updated):** "Turn inspiration into designs you can use."
- **Subhead:** "Explore remixable ideas for ads, banners, thumbnails, posters, wall art, brand assets, apparel, gifts, and product mockups — then personalize them with AI in seconds."
- **Primary CTA:** "Try it free" → opens the no-login mini AI remix demo inline (not a separate page) with a lightweight format switcher (Ad / Thumbnail / Poster / T-shirt / Logo).
- **Secondary CTA:** "Explore the feed" → `/inspire`.
- Visual: large rotating/crossfading showcase of finished outcomes across digital creatives and physical-product mockups (ad, thumbnail, poster, T-shirt/hoodie/cap/gift, wall print, logo/brand asset) rather than a single abstract hero image.
- Background: warmer "paper/editorial" treatment per Option C, not the current neon-heavy gradient — the neon/glass treatment moves to the in-app studio, not the marketing hero.

### 3. Trust/breadth bar (replaces current 4-icon "Identity / AI Remix / Human Craft / Inspire Feed" module row)

Row of category chips reflecting the actual launch clusters: **Ads & Banners**, **Thumbnails**, **Posters & Wall Art**, **T-shirts & Hoodies**, **Gifts**, **Brand Assets** — each links into the Explore feed pre-filtered to that category/format.

### 4. How the loop works (replaces current "Explore / Remix / Publish" 3-card section)

Expand to 4 steps to include the export/mockup half of the loop, which the current version omits entirely:

1. **Explore** — browse real and AI-made designs across categories.
2. **Remix** — turn any pin into something personal with AI in seconds.
3. **Showcase** — publish to your own portfolio, public or just for followers.
4. **Export or mock it up** — download a useful asset, preview it on a product, or save demand for future fulfillment.

Each step: short label, one-line description, small illustrative thumbnail (reuse the rotating hero imagery per category).

### 5. Live proof / feed preview

Embed a real (or seeded) masonry snippet from the Inspire feed — 8-12 tiles spanning the launch categories — with a "See the full feed" CTA. This replaces telling with showing, and doubles as an SEO/shareable surface.

### 6. For Creators & Providers (dedicated section, not just a nav link)

- Short pitch: "Turn your taste into remixable inspiration." / "Get discovered. Get paid. Keep making."
- 3 bullets: free portfolio + AI tools, publish remixable or portfolio-only work, reach buyers and brands actively looking for custom design; provider fulfillment comes later where demand is proven.
- CTA: "Apply as a Creator/Provider" → creator/provider onboarding waitlist (tag lead by category/format interest + role: individual creator / small business / agency, per doc 04 roles).

### 7. Social proof (placeholder for pilot, structurally present now)

Testimonial/creator-spotlight cards — can be empty-state/coming-soon copy pre-pilot, but keep the section and component so it's a content update, not a rebuild, once pilot creators exist.

### 8. Final CTA / early access

- Repeat primary CTA with an email capture form (reuse existing `EarlyAccess` component/flow), plus the category-interest and consumer/creator toggle from the nav CTA split, so we capture segmented waitlist data from day one (feeds directly into Phase 4 concierge-onboarding in [09-mvp-roadmap.md](09-mvp-roadmap.md)).

### 9. Footer

- Standard: about, contact, legal/ToS/privacy (placeholder pages fine for pilot), social links.

## Copy tone

Keep the existing brief's tone guidance (premium, confident, curious, slightly playful, human-first, minimal copy) — this doesn't change, only the specific headline/subhead copy above updates for the broader multi-format scope.

## Component mapping (what's reused vs. new, relative to current `apps/web`)

| Section | Existing component | Change needed |
|---|---|---|
| Nav | `site-nav.tsx` | Add "For Creators" link + split CTA |
| Hero | `page.tsx` hero block | New headline/subhead copy, format-switchable inline demo, warmer background treatment |
| Trust bar | `page.tsx` modules array | Replace abstract icons with concrete category/format chips linking into `/inspire?category=` |
| Loop section | `page.tsx` 3-step section | Extend to 4 steps, add export/mockup step |
| Feed preview | reuse `feed-card.tsx` + `/inspire` data | New embedded preview section on landing |
| Creators section | new | New component, reuse card/button primitives from `packages/ui` |
| Social proof | new (placeholder) | New component, empty-state copy for now |
| Early access | `early-access.tsx` | Extend form with category-interest + role toggle fields |

## Responsive/motion notes

- Mobile-first single column; category switcher in hero becomes a horizontal scroll chip row on mobile.
- Motion: scroll-reveal fade/slide for each section (restrained, ~200-300ms), rotating hero imagery crossfades every ~4s and pauses on hover/focus for accessibility.
- Respect `prefers-reduced-motion` (disable crossfade/parallax).

## Analytics events to add (ties to doc 09 Phase 1 acceptance criteria)

`landing_view`, `hero_demo_started`, `hero_demo_completed`, `category_chip_click`, `format_switcher_click`, `feed_preview_click`, `creator_cta_click`, `early_access_submitted { role, categoryInterest, formatInterest }`.
