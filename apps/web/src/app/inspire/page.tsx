"use client";

import { useMemo, useState } from "react";
import { Wand2, BriefcaseBusiness } from "lucide-react";
import { categories, inspireTiles } from "@/lib/mock-data";

export default function InspirePage() {
  const [filter, setFilter] = useState("All");
  const tiles = useMemo(() => filter === "All" ? inspireTiles : inspireTiles.filter((tile) => tile.category === filter), [filter]);

  return (
    <main className="mx-auto max-w-7xl px-4 py-10">
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm font-semibold uppercase text-cyan">Inspire</p>
          <h1 className="mt-2 text-4xl font-black">Curated sparks for remixing.</h1>
        </div>
        <div className="flex flex-wrap gap-2">
          {["All", ...categories].map((category) => (
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
        {tiles.map((tile) => (
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
