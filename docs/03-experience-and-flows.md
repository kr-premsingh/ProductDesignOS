# Experience & Flows

Every flow below is designed to work across common design formats (ads, banners, thumbnails, posters, brand assets, wall art, apparel/product mockups, gifts, ...) by parameterizing on **Category** and **Format** (see doc 06 for the schema). UI copy tone follows the existing brief: premium, confident, human-first (kept from `PROMPT_Claude.md`).

## 1. Landing / marketing site

- Hero + single primary CTA (Join / Try the AI demo) — position the platform as remixable inspiration for digital and physical-product design, not a logo-only tool.
- A live, no-login "try it" mini demo (1 free remix) to prove the AI moment in under 15 seconds — biggest lever for activation and top-of-funnel virality.
- Category/format picker teaser (Ad, Banner, Thumbnail, Poster, T-shirt, Hoodie, Gift, Wall Art, Logo, ...) so visitors self-select their intent immediately.
- Social proof: rotating feed preview (seeded UGC + AI), creator/provider spotlights.
- Early-access / waitlist capture (already exists) — keep, but tag captured leads by category interest.

## 2. Explore / Inspire feed

- Masonry/Pinterest-style grid, infinite scroll.
- Unlike Pinterest, each card is an actionable **Design**, not just a static image: it carries a remix prompt, category, format, editable fields, style tags, export settings, and future provider intent.
- Feed sources v1: seeded AI designs, curated trend packs, creator uploads, and user-published remixes.
- Filters: intent cluster, category, format, style, color, usage type (personal/brand), "AI-generated / UGC / Both", and later "provider available".
- Each card shows: image/mockup, creator attribution, category/format chip, "Remix" button, "Save" button, "Export/Mockup" if eligible, and later "Make this real" when a provider path exists.
- Ranking v1: recency + engagement (saves/remixes) + manual curation weight; move to a learned ranking model later (see doc 05).
- Feed shelves v1: "For your brand", "For your room", "For your channel", "For your next drop", "For gifting", "Trending formats", and "Remixable now".

## 3. Design Studio (AI remix workspace)

This is the core "magic moment."

1. Enter from a pin ("Remix with AI") or blank canvas ("Start from scratch").
2. Prompt is pre-filled from the source pin's tags/description; user edits or adds their own brief (style, colors, use-case).
3. Category/format-specific controls (e.g., ad: product, offer, platform size; thumbnail: title and subject; apparel: garment type and placement; poster: size and room style; logo: wordmark/symbol/industry).
4. Generate 3 variants (matches existing AI rule of "three distinct variants with rationale") — async job, progress state ("Crafting your variants...").
5. Iterate: regenerate, upscale, edit region, change palette — each action costs credits (see doc 08).
6. Save to a board / publish to portfolio (with visibility control) / export high-res / generate product mockup / capture **physical intent** ("I want this on a hoodie/cap/mug/poster") for future provider matching.

## 4. Portfolio / profile (Instagram-like)

- Public / Private / Followers-only visibility per profile and per individual piece.
- Sections: Highlights/collections, Boards, Shop (if the user has any Offerings), About/Story.
- Follow, like, comment (comments moderated / can be disabled per profile).
- "Verified Provider" badge once a user completes provider verification (see doc 04).

## 5. Marketplace / provider storefront (later)

- Storefront = profile + a list of **Offerings** (digital deliverable, physical product, or bookable service).
- Two transaction shapes:
  - **Direct/fixed-price** — buy now (digital file, ready-made physical product).
  - **Custom request/quote** — buyer submits a brief (optionally the AI remix result as reference), provider quotes price + turnaround, buyer accepts, order proceeds.
- Order lifecycle: `requested → quoted → accepted → in_progress → delivered/shipped → completed → reviewed` (+ `disputed/cancelled`).
- Messaging thread attached to each order/request.
- Reviews (rating + text + attached result photo) feed back into provider trust score and feed ranking.

In the MVP, physical goods stop at mockup + saved intent. Provider storefronts and fulfillment come after enough demand exists by product type and geography.

## 6. Creator/provider onboarding

- Pick role(s) → pick categories/formats → upload work → choose whether designs are remixable, requestable, or portfolio-only.
- Later, if physical: fulfillment method: POD/dropship integration, or "I ship myself" with declared regions/turnaround.
- Verification tiers (see doc 04) unlock capabilities progressively (e.g., must reach Tier 2 to list physical Offerings above a price threshold).
- Portfolio import (bulk upload) to seed their storefront/profile immediately.

## 7. Cross-cutting

- **Boards/collections** — save any pin/design, public or private, shareable.
- **Notifications** — follows, comments, quote received, order status changes.
- **Search** — text + visual/similar-image search (phase 2), category and style facets.
- **Trust & safety** — report/flag on any pin or profile; AI-output IP/trademark screening before publish (see doc 07); manual review queue for flagged content and new providers.
