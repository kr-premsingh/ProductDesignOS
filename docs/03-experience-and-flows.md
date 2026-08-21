# Experience & Flows

Every flow below is designed to work across any vertical (logo, apparel, decor, invitations, ...) by parameterizing on **Category** (see doc 06 for the schema). UI copy tone follows the existing brief: premium, confident, human-first (kept from `PROMPT_Claude.md`).

## 1. Landing / marketing site

- Hero + single primary CTA (Join / Try the AI demo) — keep the existing "templates are dead, design your signature" energy, but broaden beyond logos.
- A live, no-login "try it" mini demo (1 free remix) to prove the AI moment in under 15 seconds — biggest lever for activation and top-of-funnel virality.
- Category picker teaser (Logo, Apparel, Invitations, ...) so visitors self-select their intent immediately.
- Social proof: rotating feed preview (seeded UGC + AI), creator/provider spotlights.
- Early-access / waitlist capture (already exists) — keep, but tag captured leads by category interest.

## 2. Explore / Inspire feed

- Masonry/Pinterest-style grid, infinite scroll.
- Filters: category/vertical, style, color, price range (if a purchasable Offering is attached), "AI-generated / UGC / Both".
- Each card ("Design/Pin") shows: image, creator/provider attribution, "Remix with AI" button, "Get this" button (if a provider offers it), save-to-board.
- Ranking v1: recency + engagement (saves/remixes) + manual curation weight; move to a learned ranking model later (see doc 05).

## 3. Design Studio (AI remix workspace)

This is the core "magic moment."

1. Enter from a pin ("Remix with AI") or blank canvas ("Start from scratch").
2. Prompt is pre-filled from the source pin's tags/description; user edits or adds their own brief (style, colors, use-case).
3. Category-specific controls (e.g., logo: word mark vs symbol, industry; apparel: garment type, placement; invitations: event type, wording).
4. Generate 3 variants (matches existing AI rule of "three distinct variants with rationale") — async job, progress state ("Crafting your variants...").
5. Iterate: regenerate, upscale, edit region, change palette — each action costs credits (see doc 08).
6. Save to a board / publish to portfolio (with visibility control) / **"Make it real"** → opens a Request-a-Provider flow pre-filled with the design and category.

## 4. Portfolio / profile (Instagram-like)

- Public / Private / Followers-only visibility per profile and per individual piece.
- Sections: Highlights/collections, Boards, Shop (if the user has any Offerings), About/Story.
- Follow, like, comment (comments moderated / can be disabled per profile).
- "Verified Provider" badge once a user completes provider verification (see doc 04).

## 5. Marketplace / provider storefront

- Storefront = profile + a list of **Offerings** (digital deliverable, physical product, or bookable service).
- Two transaction shapes:
  - **Direct/fixed-price** — buy now (digital file, ready-made physical product).
  - **Custom request/quote** — buyer submits a brief (optionally the AI remix result as reference), provider quotes price + turnaround, buyer accepts, order proceeds.
- Order lifecycle: `requested → quoted → accepted → in_progress → delivered/shipped → completed → reviewed` (+ `disputed/cancelled`).
- Messaging thread attached to each order/request.
- Reviews (rating + text + attached result photo) feed back into provider trust score and feed ranking.

## 6. Creator/provider onboarding

- Pick role(s) → pick categories → (if physical) fulfillment method: POD/dropship integration, or "I ship myself" with declared regions/turnaround.
- Verification tiers (see doc 04) unlock capabilities progressively (e.g., must reach Tier 2 to list physical Offerings above a price threshold).
- Portfolio import (bulk upload) to seed their storefront/profile immediately.

## 7. Cross-cutting

- **Boards/collections** — save any pin/design, public or private, shareable.
- **Notifications** — follows, comments, quote received, order status changes.
- **Search** — text + visual/similar-image search (phase 2), category and style facets.
- **Trust & safety** — report/flag on any pin or profile; AI-output IP/trademark screening before publish (see doc 07); manual review queue for flagged content and new providers.
