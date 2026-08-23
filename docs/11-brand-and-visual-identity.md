# Brand & Visual Identity — Options

The old brief (`PROMPT_Claude.md`) locked in a single aesthetic (charcoal + neon cyan/magenta, tech/SaaS-coded) for a logo-demo MVP. Now that scope spans common digital and physical-product design formats (ads, banners, thumbnails, posters, wall art, brand assets, apparel graphics, gifts, and mockups), it's worth deciding deliberately whether that aesthetic still fits, since it currently reads as "AI dev tool" more than "design platform for your taste."

Current tokens for reference (`packages/ui/src/tokens.ts`): charcoal `#0B0F14`, glass `#F7F8FA`, cyan `#00E5FF`, magenta `#FF4DA6`, lime `#B6F36A`.

## Option A — "Signal" (keep current direction)

Dark, high-contrast, neon-on-charcoal, glass panels, tech-forward. Lowest effort (zero rework of existing tokens/components).

- Pros: nothing to redo, feels premium/futuristic, matches the existing AI-logo-demo positioning.
- Cons: reads as a dev/AI tool, not a broad design platform for creators, individuals, and brands; neon-on-black can feel cold for warmer formats like wall art, gifts, and decor.
- Best if: we stay logo/branding-led and treat other formats as secondary for a while.

## Option B — "Studio Light" (editorial, warm, human-first)

Warm neutral paper/linen background tones, high-quality photography-led, serif/sans pairing (editorial magazine feel), a single confident accent color (e.g., deep terracotta or ink-blue) instead of dual neon. Feels like a design magazine crossed with a marketplace (closer to Houzz/Kinfolk than a SaaS dashboard).

- Pros: feels human and craft-led, scales naturally across digital creatives, product mockups, wall art, gifts, decor, and brand assets, broader mainstream appeal.
- Cons: full token/component rework; loses the current "futuristic AI" signal that differentiates from Pinterest.
- Best if: broad consumer appeal and "taste/story" positioning matters more than "AI-powered" positioning.

## Option C — "Adaptive Canvas" (recommended)

A **neutral, premium dark-mode base** (kept close to current charcoal/glass system for the app/studio, where "AI-powered" *should* still show through) combined with a **per-category accent color** instead of a single fixed neon duo — so Ads, Thumbnails, Posters, Brand Assets, Apparel Graphics, Gifts, and Wall Art each get a distinct, on-brand accent drawn from one curated palette family, applied consistently via `Category.accentColor` (ties directly into the `Category` entity in [06-data-model.md](06-data-model.md)). The landing page itself uses a slightly warmer, more editorial hero (large photography/design imagery, less "terminal glow") than the in-app studio, so first impressions feel like a design platform, and the product itself still feels technical/premium once inside.

- Pros: solves the "feels like an AI logo tool" problem without a full rebuild — keep dark charcoal base + glass panels (reuse ~70% of existing tokens/components), add a small accent-per-category system, restyle only the landing hero to be warmer/editorial.
- Cons: slightly more design system work than Option A (need an accent-color scale + per-category mapping); requires care so it doesn't look inconsistent.
- Best if (this is our situation): broad multi-format design platform from the start, small team, want to reuse existing `packages/ui` work rather than start over.

## Recommendation: Option C

### Token updates (additive, non-breaking to existing components)

```ts
// packages/ui/src/tokens.ts (additive)
export const tokens = {
  color: {
    // existing base kept as the app/studio "signal" layer
    charcoal: "#0B0F14",
    obsidian: "#111827",
    glass: "#F7F8FA",
    line: "rgba(247,248,250,0.14)",
    gray: "#9AA3B2",

    // NEW: landing/editorial warm-neutral layer
    paper: "#F5F1EA",
    ink: "#14110D",

    // NEW: category accent palette (assign 1 per Category row)
    accent: {
      ads: "#00E5FF",        // cyan — sharp, high-signal campaign work
      thumbnails: "#FF4DA6", // magenta — bold, creator/video energy
      posters: "#E8B23A",    // warm gold — editorial/display
      apparel: "#B6F36A",    // lime — merch/streetwear energy
      wallArt: "#7FA37A",    // sage — calm, home/decor
      brand: "#8EA7FF",      // blue-violet — business/identity
      gifts: "#F97373"       // coral — personal and celebratory
    }
  }
} as const;
```

### Typography

- Keep Inter for UI/product (already in `globals.css`).
- Add one confident display serif or high-contrast grotesk for landing headlines only (e.g., "Fraunces" or "Instrument Serif") to add the editorial/human warmth Option B wanted, without touching the in-app UI font.

### Imagery

- Landing/marketing: real, high-quality photography and finished design outcomes (ads in context, thumbnails, wall posters, apparel/gift mockups, logos/brand assets in use) — not just AI-generation screenshots.
- In-app/studio: keep the current glass/neon "AI at work" feel.

### Motion

- Landing: subtle parallax/scroll-reveal, restrained (matches "premium, not gimmicky" tone from the original brief).
- Studio: keep the existing "crafting your variants" progress motion language.

This direction is a design decision, not a technical lock-in — it's cheap to swap since everything routes through `packages/ui` tokens.
