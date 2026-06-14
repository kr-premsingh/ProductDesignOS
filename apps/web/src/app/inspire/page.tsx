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
          <article key={tile.id} className="group mb-4 break-inside-avoid overflow-hidden rounded-card border border-white/10 bg-white/6">
            <img src={tile.image} alt="" className="aspect-[4/5] w-full object-cover transition duration-300 group-hover:scale-[1.03]" />
            <div className="p-4">
              <div className="flex items-center justify-between gap-3">
                <h2 className="font-semibold">{tile.title}</h2>
                <span className="rounded-full bg-white/10 px-2 py-1 text-xs text-muted">{tile.category}</span>
              </div>
              <p className="mt-2 text-sm text-muted">{tile.remixPrompt}</p>
              <div className="mt-4 flex gap-2">
                <button className="inline-flex items-center gap-2 rounded-full bg-glass px-3 py-2 text-xs font-semibold text-charcoal">
                  <Wand2 size={14} /> Remix
                </button>
                <button className="inline-flex items-center gap-2 rounded-full border border-white/15 px-3 py-2 text-xs text-muted">
                  <BriefcaseBusiness size={14} /> Hire
                </button>
              </div>
            </div>
          </article>
        ))}
      </div>
    </main>
  );
}
