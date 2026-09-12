"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Wand2, BriefcaseBusiness } from "lucide-react";
import { categories as fallbackCategories, inspireTiles as fallbackTiles } from "@/lib/mock-data";
import { fetchCategories, fetchDesigns, toTile, type Tile } from "@/lib/catalog";

export default function InspirePage() {
  return (
    <Suspense fallback={null}>
      <InspirePageInner />
    </Suspense>
  );
}

function InspirePageInner() {
  const searchParams = useSearchParams();
  const initialCategory = searchParams.get("category");
  const [categoryNames, setCategoryNames] = useState<string[]>(fallbackCategories);
  const [tiles, setTiles] = useState<Tile[]>(fallbackTiles);
  const [filter, setFilter] = useState(initialCategory || "All");

  useEffect(() => {
    let active = true;
    // relative /core-api hits the Next.js rewrite -> core-api (works same-origin in prod);
    // NEXT_PUBLIC_CORE_API_URL overrides it for split-host setups (e.g. Vercel + Render)
    const coreApiUrl = process.env.NEXT_PUBLIC_CORE_API_URL || "/core-api";
    (async () => {
      try {
        const [apiCategories, apiDesigns] = await Promise.all([
          fetchCategories(coreApiUrl),
          fetchDesigns(coreApiUrl, { limit: 100 })
        ]);
        if (!active || !apiCategories.length || !apiDesigns.length) return;
        setCategoryNames(apiCategories.map((c) => c.name));
        setTiles(apiDesigns.map((d) => toTile(d, apiCategories)));
      } catch {
        // core-api unavailable, keep seeded mock data
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  const filteredTiles = useMemo(
    () => (filter === "All" ? tiles : tiles.filter((tile) => tile.category === filter)),
    [filter, tiles]
  );

  return (
    <main className="mx-auto max-w-7xl px-4 py-10">
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm font-semibold uppercase text-cyan">Inspire</p>
          <h1 className="mt-2 text-4xl font-black">Curated sparks for remixing.</h1>
        </div>
        <div className="flex flex-wrap gap-2">
          {["All", ...categoryNames].map((category) => (
            <button
              key={category}
              onClick={() => setFilter(category)}
              className={`rounded-full border px-4 py-2 text-sm transition ${filter === category ? "border-cyan bg-cyan text-charcoal" : "border-white/15 text-muted hover:text-glass"}`}
            >
              {category}
            </button>
          ))}
        </div>
      </div>
      <div className="tile-grid">
        {filteredTiles.map((tile) => (
          // @ts-ignore server->client tile
          <div key={tile.id}>
            {/* use client FeedCard component */}
            {/* eslint-disable-next-line react/jsx-no-bind */}
            {/* import dynamically to avoid server-only errors */}
            {/* render fallback while loading client bundle */}
            <ClientFeedCard tile={tile} />
          </div>
        ))}
      </div>
    </main>
  );
}

function ClientFeedCard(props: any) {
  // lazy-load the FeedCard to keep this page server-friendly
  const FeedCard = require('@/components/feed-card').FeedCard as any;
  return <FeedCard tile={props.tile} />;
}
