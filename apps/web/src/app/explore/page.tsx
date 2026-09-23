"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Search } from "lucide-react";
import { FeedCard } from "@/components/feed-card";
import { SwipeDeck, readTaste } from "@/components/swipe-deck";
import { categories as fallbackCategories, inspireTiles as fallbackTiles } from "@/lib/mock-data";
import { fetchCategories, fetchDesigns, toTile, type Tile } from "@/lib/catalog";

export default function ExplorePage() {
  return (
    <Suspense fallback={null}>
      <ExplorePageInner />
    </Suspense>
  );
}

function ExplorePageInner() {
  const initialCategory = useSearchParams().get("category") || "All";
  const [categories, setCategories] = useState(fallbackCategories);
  const [tiles, setTiles] = useState<Tile[]>(fallbackTiles);
  const [filter, setFilter] = useState(initialCategory);
  const [search, setSearch] = useState("");
  const [tasteVersion, setTasteVersion] = useState(0);

  useEffect(() => {
    const coreApiUrl = process.env.NEXT_PUBLIC_CORE_API_URL || "/core-api";
    Promise.all([fetchCategories(coreApiUrl), fetchDesigns(coreApiUrl, { limit: 100 })])
      .then(([apiCategories, apiDesigns]) => {
        if (apiCategories.length && apiDesigns.length) {
          setCategories(apiCategories.map((category) => category.name));
          setTiles(apiDesigns.map((design) => toTile(design, apiCategories)));
        }
      })
      .catch(() => {});
  }, []);

  // Re-rank Discover whenever a swipe verdict is recorded.
  useEffect(() => {
    const bump = () => setTasteVersion((v) => v + 1);
    window.addEventListener("dooniq:taste", bump);
    return () => window.removeEventListener("dooniq:taste", bump);
  }, []);

  const visibleTiles = useMemo(() => {
    const filtered = tiles.filter((tile) => {
      const categoryMatches = filter === "All" || tile.category === filter;
      const searchMatches = `${tile.title} ${tile.tags.join(" ")} ${tile.category}`.toLowerCase().includes(search.toLowerCase());
      return categoryMatches && searchMatches;
    });
    // Taste-based re-rank: liked categories and liked tiles bubble up.
    const taste = readTaste();
    if (!taste.likes.length) return filtered;
    return [...filtered].sort((a, b) => {
      const score = (t: Tile) => (taste.categories[t.category] || 0) + (taste.likes.includes(t.id) ? 5 : 0);
      return score(b) - score(a);
    });
  }, [filter, search, tiles, tasteVersion]);

  return (
    <main className="w-full px-4 py-5 text-[#1d1d1f] sm:px-6 lg:px-10 2xl:px-16">
      <div className="flex flex-col gap-4 border-b border-black/[0.08] pb-5 md:flex-row md:items-center md:justify-between">
        <div><h1 className="text-2xl font-black tracking-normal sm:text-3xl">For your next thing.</h1><p className="mt-1 text-sm text-black/50">Save what moves you. Make it yours.</p></div>
        <div className="flex w-full items-center gap-2 rounded-full border border-black/[0.1] bg-white px-4 py-2.5 shadow-sm md:w-[360px]">
          <Search size={17} className="shrink-0 text-black/45" /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search ideas, styles, formats" className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-black/40" />
        </div>
      </div>

      <div className="flex gap-2 overflow-x-auto py-5 [scrollbar-width:none]">
        {["All", ...categories].map((category) => <button key={category} onClick={() => setFilter(category)} className={`shrink-0 rounded-full border px-4 py-2 text-sm font-semibold transition ${filter === category ? "border-cyan bg-cyan text-charcoal" : "border-black/[0.1] bg-white text-black/70 hover:border-black/25"}`}>{category}</button>)}
      </div>

      <SwipeDeck tiles={tiles} />

      <div className="mb-4 mt-8 flex items-center justify-between"><h2 className="text-lg font-bold">Discover</h2><span className="text-xs text-black/45">{visibleTiles.length} designs</span></div>
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6">{visibleTiles.map((tile) => <FeedCard key={tile.id} tile={tile} />)}</div>
      {!visibleTiles.length ? <p className="py-16 text-center text-sm text-black/50">Nothing matched that. Try a different search or category.</p> : null}
    </main>
  );
}
