const inspireSeed: Array<[string, string, string[], string, string]> = [
  ["Neon Minimal Poster", "Merch", ["neon", "minimal", "poster"], "neon minimal poster for indie band", "print-shop"],
  ["Glass Console UI", "UI", ["glass", "dashboard", "systems"], "glass console for creator analytics", "digital"],
  ["Modular Studio Wall", "Interiors", ["modular", "studio", "calm"], "modular wall for a tiny studio", "interior"],
  ["Chromatic Event Tee", "Merch", ["tee", "chromatic", "launch"], "chromatic shirt for product launch", "merch"],
  ["Editorial Creator Kit", "Social", ["editorial", "creator", "grid"], "editorial kit for visual creator", "digital"],
  ["Atomic Landing Blocks", "UI", ["atomic", "landing", "clean"], "atomic landing page blocks", "digital"],
  ["Soft Signal Packaging", "Print", ["packaging", "soft", "signal"], "soft packaging for wellness drink", "print-shop"],
  ["Brutal Grid Identity", "UI", ["brutal", "grid", "identity"], "brutal grid identity for studio", "digital"],
  ["Aurora Cafe Corner", "Interiors", ["aurora", "cafe", "warm"], "aurora corner for boutique cafe", "interior"],
  ["Mono Merch Drop", "Merch", ["mono", "drop", "street"], "mono merch drop for street label", "merch"],
  ["Creator Story Cards", "Social", ["story", "cards", "creator"], "story cards for design influencer", "digital"],
  ["Fluent Finance Panel", "UI", ["fluent", "finance", "panel"], "fluent panel for money app", "digital"],
  ["Risograph Launch Poster", "Print", ["riso", "poster", "launch"], "riso poster for launch event", "print-shop"],
  ["Quiet Luxury Room", "Interiors", ["quiet", "luxury", "room"], "quiet luxury room for solo founder", "interior"],
  ["Kinetic Logo Sheet", "Print", ["kinetic", "logo", "system"], "kinetic logo sheet for agency", "print-shop"],
  ["Material AI Console", "UI", ["material", "ai", "console"], "material console for AI assistant", "digital"],
  ["Holographic Packaging", "Print", ["holographic", "box", "premium"], "holographic box for skincare", "print-shop"],
  ["Micro Loft Palette", "Interiors", ["micro", "loft", "palette"], "micro loft with vivid accents", "interior"],
  ["Creator Media Wall", "Social", ["media", "wall", "showcase"], "media wall for personal brand", "digital"],
  ["Geometric Tote System", "Merch", ["geometric", "tote", "system"], "geometric tote for design school", "merch"],
  ["Ant Design Ops Board", "UI", ["ant", "ops", "board"], "ops board for design marketplace", "digital"],
  ["Custom Type Poster", "Print", ["type", "custom", "poster"], "custom type poster for exhibit", "print-shop"],
  ["Future Desk Setup", "Interiors", ["desk", "future", "focus"], "future desk for remote creator", "interior"],
  ["Premium Reel Covers", "Social", ["reels", "premium", "covers"], "premium reel covers for educator", "digital"],
  ["Liquid Chrome Hoodie", "Merch", ["chrome", "hoodie", "liquid"], "liquid chrome hoodie for launch", "merch"],
  ["Civic Service UI", "UI", ["civic", "service", "clear"], "civic service UI with warmth", "digital"],
  ["Color Field Menu", "Print", ["menu", "color", "field"], "color field menu for cafe", "print-shop"],
  ["Gallery Apartment", "Interiors", ["gallery", "apartment", "art"], "gallery apartment for collector", "interior"],
  ["Personal OS Cards", "Social", ["personal", "os", "cards"], "personal OS social cards", "digital"],
  ["Minimal Badge Pack", "Merch", ["badge", "minimal", "pack"], "minimal badge pack for community", "merch"]
];

export const inspireTiles = inspireSeed.map(([title, category, tags, remixPrompt, providerSuggestion], index) => ({
  id: `tile-${index + 1}`,
  title,
  category,
  tags,
  remixPrompt,
  providerSuggestion,
  image: `https://picsum.photos/seed/productdesignos-${index + 1}/900/1200`
}));

const trendSeed: Array<[string, string, string[]]> = [
  ["Generative Maximalism", "Algorithmic textures, layered palettes, and expressive systems that feel alive.", ["generative", "layered", "saturated"]],
  ["Quiet Utility", "Dense product interfaces with calm hierarchy and restraint.", ["utility", "calm", "structured"]],
  ["Glass Systems", "Translucent surfaces used as functional depth, not decoration.", ["glass", "depth", "signal"]],
  ["Neo Editorial", "Magazine-like rhythm applied to creator portfolios and social brands.", ["editorial", "type", "contrast"]],
  ["Material You", "Adaptive color and motion patterns that personalize everyday tools.", ["adaptive", "material", "motion"]],
  ["Fluent Depth", "Layered surfaces, shadows, and accessible motion for work apps.", ["fluent", "depth", "work"]],
  ["Atomic Design", "Reusable interface atoms composed into expressive product systems.", ["atomic", "components", "system"]],
  ["Ant Operations", "Scannable enterprise workflows with strong data hierarchy.", ["enterprise", "tables", "forms"]],
  ["Spatial Commerce", "Rooms and products designed as explorable digital scenes.", ["spatial", "commerce", "immersive"]],
  ["Personal Brand OS", "Creator identity kits that span posts, portfolios, merch, and rooms.", ["creator", "identity", "kit"]],
  ["Print Revival", "Risograph, custom type, and tactile assets entering digital systems.", ["print", "riso", "tactile"]],
  ["AI Co-Creation", "Interfaces that explain options and invite iteration instead of one-shot magic.", ["ai", "remix", "rationale"]]
];

export const trends = trendSeed.map(([title, summary, keywords], index) => ({
  id: `trend-${index + 1}`,
  title,
  summary,
  keywords
}));

export const profiles = [
  {
    id: "user-1",
    username: "nova",
    email: "nova@example.com",
    role: "student",
    bio: "Design student building vivid systems for tiny brands.",
    avatar: "https://picsum.photos/seed/nova-avatar/240/240",
    profileData: {
      tagline: "Identity systems with pulse.",
      hero: "https://picsum.photos/seed/nova-hero/1600/800",
      gallery: inspireTiles.slice(0, 6)
    }
  }
];
