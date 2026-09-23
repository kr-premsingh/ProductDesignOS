import { designPhoto } from "@/lib/artwork";

export const categories = ["Posters", "UI", "Merch", "Interiors", "Social", "Print"];

const TITLES: Record<string, string[]> = {
  Posters: ["Solar Fade Poster", "Riso Coast Print", "Neon District Poster", "Monochrome Grid Study", "Golden Hour Series"],
  UI: ["Glass Console UI", "Creator Analytics Kit", "Flow Banking App", "Studio Dashboard UI", "Orbit Design System"],
  Merch: ["Chromatic Event Tee", "Heavyweight Logo Hoodie", "Tour Date Longsleeve", "Minimal Mark Cap", "Studio Crewneck"],
  Interiors: ["Modular Studio Wall", "Japandi Reading Nook", "Gallery Wall Set", "Warm Minimal Lounge", "Concrete & Oak Desk"],
  Social: ["Editorial Creator Kit", "Launch Week Carousel", "Reel Cover Pack", "Quote Card System", "Drop Announcement Set"],
  Print: ["Neo Editorial Zine", "Wedding Suite No. 4", "Foil Business Cards", "Exhibition Catalogue", "Letterpress Invite Set"]
};

export const inspireTiles = Array.from({ length: 36 }, (_, index) => {
  const category = categories[index % categories.length];
  const titles = TITLES[category];
  const title = titles[Math.floor(index / categories.length) % titles.length];
  return {
    id: `tile-${index + 1}`,
    title,
    category,
    tags: [category.toLowerCase(), "signature", index % 2 ? "calm" : "vivid"],
    remixPrompt: `${category.toLowerCase()} identity for a personal brand`,
    providerSuggestion: category === "Interiors" ? "interior" : category === "UI" || category === "Social" ? "digital" : "print-shop",
    image: designPhoto(`tile-${index + 1}`, category)
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
  image: designPhoto(`trend-${index + 1}`, index % 2 ? "ui" : "poster", 900, 650)
}));
