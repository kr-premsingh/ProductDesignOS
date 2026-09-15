"use client";

import { useEffect, useMemo, useState } from "react";
import { Search, Sparkles, WandSparkles } from "lucide-react";
import Link from "next/link";
import { FeedCard } from "@/components/feed-card";
import { categories as fallbackCategories, inspireTiles as fallbackTiles } from "@/lib/mock-data";
import { fetchCategories, fetchDesigns, toTile, type Tile } from "@/lib/catalog";

export default function DooniqHome() {
  const [categories, setCategories] = useState(fallbackCategories);
  const [tiles, setTiles] = useState<Tile[]>(fallbackTiles);
  const [filter, setFilter] = useState("All");
  const [search, setSearch] = useState("");

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

  const visibleTiles = useMemo(() => tiles.filter((tile) => {
    const categoryMatches = filter === "All" || tile.category === filter;
    const searchMatches = `${tile.title} ${tile.tags.join(" ")} ${tile.category}`.toLowerCase().includes(search.toLowerCase());
    return categoryMatches && searchMatches;
  }), [filter, search, tiles]);

  return (
    <main className="mx-auto max-w-[1440px] px-3 py-5 sm:px-5 lg:px-8">
      <div className="flex flex-col gap-4 border-b border-white/10 pb-5 md:flex-row md:items-center md:justify-between">
        <div><h1 className="text-2xl font-black tracking-normal sm:text-3xl">For your next thing.</h1><p className="mt-1 text-sm text-muted">Save what moves you. Make it yours.</p></div>
        <div className="flex w-full items-center gap-2 rounded-full border border-white/10 bg-white/6 px-4 py-2.5 md:w-[360px]">
          <Search size={17} className="shrink-0 text-muted" /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search ideas, styles, formats" className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-muted" />
        </div>
      </div>

      <div className="flex gap-2 overflow-x-auto py-5 [scrollbar-width:none]">
        {["All", ...categories].map((category) => <button key={category} onClick={() => setFilter(category)} className={`shrink-0 rounded-full border px-4 py-2 text-sm font-semibold transition ${filter === category ? "border-cyan bg-cyan text-charcoal" : "border-white/12 bg-white/5 text-white/75 hover:border-white/30"}`}>{category}</button>)}
      </div>

      <div className="mb-6 grid gap-3 md:grid-cols-[1.35fr_1fr]">
        <Link href="/studio" className="group relative min-h-40 overflow-hidden rounded-panel border border-cyan/25 bg-[linear-gradient(118deg,#0e2730,#17202c_54%,#2b1830)] p-6 transition hover:border-cyan/65">
          <div className="absolute right-[-2rem] top-[-3rem] h-40 w-40 rounded-full border border-cyan/30" />
          <WandSparkles className="relative text-cyan" size={24} /><p className="relative mt-7 text-xl font-black">Create from a feeling.</p><p className="relative mt-1 text-sm text-white/70">Open Studio and turn a rough idea into three distinct directions.</p>
        </Link>
        <Link href="/marketplace" className="group flex min-h-40 flex-col justify-between rounded-panel border border-white/10 bg-white/6 p-6 transition hover:border-magenta/60"><Sparkles className="text-magenta" size={23} /><div><p className="text-xl font-black">Make it real.</p><p className="mt-1 text-sm text-muted">Work with creators and providers ready to build it.</p></div></Link>
      </div>

      <div className="mb-4 flex items-center justify-between"><h2 className="text-lg font-bold">Discover</h2><span className="text-xs text-muted">{visibleTiles.length} designs</span></div>
      <div className="tile-grid">{visibleTiles.map((tile) => <FeedCard key={tile.id} tile={tile} />)}</div>
      {!visibleTiles.length ? <p className="py-16 text-center text-sm text-muted">Nothing matched that. Try a different search or category.</p> : null}
    </main>
  );
}

