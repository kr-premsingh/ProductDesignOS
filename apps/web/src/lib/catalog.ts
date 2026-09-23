export type ApiCategory = {
  id: string;
  slug: string;
  name: string;
  accent_color: string | null;
  allowed_fulfillment_types: string[];
};

export type ApiDesign = {
  id: string;
  owner_id: string | null;
  category_id: string | null;
  source_type: string;
  title: string | null;
  asset_url: string;
  prompt: string | null;
  visibility: string;
  tags: string[];
  created_at: string;
};

export type Tile = {
  id: string;
  title: string;
  category: string;
  tags: string[];
  remixPrompt?: string;
  providerSuggestion?: string;
  image: string;
};

/** Deterministic pseudo-random credit price from an id. */
export function creditsFor(id: string) {
  let hash = 0;
  for (let i = 0; i < id.length; i++) hash = (hash * 31 + id.charCodeAt(i)) >>> 0;
  return 49 + (hash % 150);
}

export async function fetchCategories(baseUrl: string): Promise<ApiCategory[]> {
  const res = await fetch(`${baseUrl}/categories`, { cache: "no-store" });
  if (!res.ok) throw new Error(`categories request failed: ${res.status}`);
  return res.json();
}

export async function fetchDesigns(
  baseUrl: string,
  opts: { category?: string; limit?: number } = {}
): Promise<ApiDesign[]> {
  const params = new URLSearchParams();
  if (opts.category) params.set("category", opts.category);
  if (opts.limit) params.set("limit", String(opts.limit));
  const query = params.toString();
  const res = await fetch(`${baseUrl}/designs${query ? `?${query}` : ""}`, { cache: "no-store" });
  if (!res.ok) throw new Error(`designs request failed: ${res.status}`);
  return res.json();
}

export function toTile(design: ApiDesign, categories: ApiCategory[]): Tile {
  const category = categories.find((c) => c.id === design.category_id);
  return {
    id: design.id,
    title: design.title || "Untitled design",
    category: category?.name || "General",
    tags: design.tags,
    remixPrompt: design.prompt || undefined,
    providerSuggestion: category?.allowed_fulfillment_types.includes("physical") ? "print-shop" : "digital",
    image: design.asset_url
  };
}
