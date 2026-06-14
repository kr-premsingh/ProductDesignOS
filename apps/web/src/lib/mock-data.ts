export const categories = ["UI", "Interiors", "Merch", "Print", "Social"];

export const inspireTiles = Array.from({ length: 30 }, (_, index) => {
  const category = categories[index % categories.length];
  return {
    id: `tile-${index + 1}`,
    title: [
      "Neon Minimal Poster",
      "Glass Console UI",
      "Modular Studio Wall",
      "Chromatic Event Tee",
      "Editorial Creator Kit"
    ][index % 5],
    category,
    tags: [category.toLowerCase(), "signature", index % 2 ? "calm" : "vivid"],
    remixPrompt: `${category.toLowerCase()} identity for a personal brand`,
    providerSuggestion: category === "Interiors" ? "interior" : category === "UI" || category === "Social" ? "digital" : "print-shop",
    image: `https://picsum.photos/seed/productdesignos-${index + 1}/900/1200`
  };
});

export const trends = [
  ["Generative Maximalism", "Algorithmic textures, layered palettes, and expressive systems that feel alive."],
  ["Quiet Utility", "Dense product interfaces with calm hierarchy and restraint."],
  ["Glass Systems", "Translucent surfaces used as functional depth, not decoration."],
  ["Neo Editorial", "Magazine-like rhythm applied to creator portfolios and social brands."],
  ["Material You", "Adaptive color and motion patterns that personalize everyday tools."],
  ["Fluent Depth", "Layered surfaces, shadows, and accessible motion for work apps."],
  ["Atomic Design", "Reusable interface atoms composed into expressive product systems."],
  ["Ant Operations", "Scannable enterprise workflows with strong data hierarchy."],
  ["Spatial Commerce", "Rooms and products designed as explorable digital scenes."],
  ["Personal Brand OS", "Creator identity kits that span posts, portfolios, merch, and rooms."],
  ["Print Revival", "Risograph, custom type, and tactile assets entering digital systems."],
  ["AI Co-Creation", "Interfaces that explain options and invite iteration instead of one-shot magic."]
].map(([title, summary], index) => ({
  id: `trend-${index + 1}`,
  title,
  summary,
  keywords: ["system", "identity", "remix"],
  image: `https://picsum.photos/seed/trend-${index + 1}/900/650`
}));
