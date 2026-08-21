# Landing Page — Design Spec

Positioning shift from the old brief: the old hero ("A Design OS for Individuality") was logo/branding-flavored. The new landing page must read as a multi-vertical design platform (branding, apparel, invitations, and more) on day one, per [01-vision-and-strategy.md](01-vision-and-strategy.md) and [02-audience-niches.md](02-audience-niches.md). Visual direction: Option C, "Adaptive Canvas" ([11-brand-and-visual-identity.md](11-brand-and-visual-identity.md)).

## Goals (in priority order)

1. Get a first-time visitor into the **live AI remix demo** within one click, no login (biggest activation lever).
2. Communicate the full loop — *discover → remix → showcase → get it made/bought* — in under 10 seconds of scrolling.
3. Split intent early: "I want inspiration/AI" vs. "I want to sell/showcase my work" (consumer vs. creator/provider), without forcing a choice before value is shown.
4. Capture early access / waitlist emails, tagged by category interest and by consumer-vs-creator intent.

## Page structure

### 1. Nav

- Logo/wordmark, left.
- Center/right links: Explore, Studio (AI Demo), For Creators, Pricing (future/"Free in beta"), links scroll or route depending on what exists yet.
- Right: "Join Early Access" (primary button), "For Creators & Providers" (secondary/text link) — two distinct CTAs from the top, since consumer and supply-side visitors have different jobs-to-be-done (doc 02).

### 2. Hero

- **Headline (updated, vertical-agnostic):** "Design that knows your story." (replaces logo-specific "Templates are dead. Design your signature." — keep that line as a secondary tagline for the branding vertical page specifically, not the global hero).
- **Subhead:** "Explore thousands of designs — logos, outfits, invitations, spaces — remix any of them with AI in seconds, then get the real thing made by a creator who gets it."
- **Primary CTA:** "Try it free" → opens the no-login mini AI remix demo inline (not a separate page) — pick one category to start the demo with (default: branding/logo, matches existing scaffold) with a lightweight category switcher (Logo / Apparel / Invitation) so the hero itself proves multi-vertical breadth.
- **Secondary CTA:** "Explore the feed" → `/inspire`.
- Visual: large rotating/crossfading showcase of finished outcomes across the 2-3 launch verticals (a logo, an apparel print, an invitation design) rather than a single abstract hero image — directly shows breadth instead of just telling it.
- Background: warmer "paper/editorial" treatment per Option C, not the current neon-heavy gradient — the neon/glass treatment moves to the in-app studio, not the marketing hero.

### 3. Trust/breadth bar (replaces current 4-icon "Identity / AI Remix / Human Craft / Inspire Feed" module row)

Row of 3 category chips reflecting the actual launch verticals (not abstract concepts): **Branding & Logos**, **Apparel & Prints**, **Invitations & Stationery** (swap/extend once verticals are finalized, doc 02) — each links into the Explore feed pre-filtered to that category. This replaces abstract module names with concrete, scannable proof of what's actually here today.

### 4. How it loop works (replaces current "Explore / Remix / Publish" 3-card section)

Expand to 4 steps to include the marketplace half of the loop, which the current version omits entirely:

1. **Explore** — browse real and AI-made designs across categories.
2. **Remix** — turn any pin into something personal with AI in seconds.
3. **Showcase** — publish to your own portfolio, public or just for followers.
4. **Get it made** — request the real thing from a verified creator or provider, digital or physical.

Each step: short label, one-line description, small illustrative thumbnail (reuse the rotating hero imagery per category).

### 5. Live proof / feed preview

Embed a real (or seeded) masonry snippet from the Inspire feed — 8-12 tiles spanning the launch categories — with a "See the full feed" CTA. This replaces telling with showing, and doubles as an SEO/shareable surface.

### 6. For Creators & Providers (dedicated section, not just a nav link)

- Short pitch: "Turn your taste into a storefront." / "Get discovered. Get paid. Keep making."
- 3 bullets: free portfolio + AI tools, reach buyers actively looking for custom work, simple quote-and-order flow (no separate invoicing/marketing needed).
- CTA: "Apply as a Creator/Provider" → provider onboarding waitlist (tag lead by vertical + role: individual creator / small business / agency, per doc 04 roles).

### 7. Social proof (placeholder for pilot, structurally present now)

Testimonial/creator-spotlight cards — can be empty-state/coming-soon copy pre-pilot, but keep the section and component so it's a content update, not a rebuild, once pilot creators exist.

### 8. Final CTA / early access

- Repeat primary CTA with an email capture form (reuse existing `EarlyAccess` component/flow), plus the category-interest and consumer/creator toggle from the nav CTA split, so we capture segmented waitlist data from day one (feeds directly into Phase 4 concierge-onboarding in [09-mvp-roadmap.md](09-mvp-roadmap.md)).

### 9. Footer

- Standard: about, contact, legal/ToS/privacy (placeholder pages fine for pilot), social links.

## Copy tone

Keep the existing brief's tone guidance (premium, confident, curious, slightly playful, human-first, minimal copy) — this doesn't change, only the specific headline/subhead copy above updates for multi-vertical scope.

## Component mapping (what's reused vs. new, relative to current `apps/web`)

| Section | Existing component | Change needed |
|---|---|---|
| Nav | `site-nav.tsx` | Add "For Creators" link + split CTA |
| Hero | `page.tsx` hero block | New headline/subhead copy, category-switchable inline demo, warmer background treatment |
| Trust bar | `page.tsx` modules array | Replace abstract icons with 3 real category chips linking into `/inspire?category=` |
| Loop section | `page.tsx` 3-step section | Extend to 4 steps, add marketplace step |
| Feed preview | reuse `feed-card.tsx` + `/inspire` data | New embedded preview section on landing |
| Creators section | new | New component, reuse card/button primitives from `packages/ui` |
| Social proof | new (placeholder) | New component, empty-state copy for now |
| Early access | `early-access.tsx` | Extend form with category-interest + role toggle fields |

## Responsive/motion notes

- Mobile-first single column; category switcher in hero becomes a horizontal scroll chip row on mobile.
- Motion: scroll-reveal fade/slide for each section (restrained, ~200-300ms), rotating hero imagery crossfades every ~4s and pauses on hover/focus for accessibility.
- Respect `prefers-reduced-motion` (disable crossfade/parallax).

## Analytics events to add (ties to doc 09 Phase 1 acceptance criteria)

`landing_view`, `hero_demo_started`, `hero_demo_completed`, `category_chip_click`, `feed_preview_click`, `creator_cta_click`, `early_access_submitted { role, categoryInterest }`.
