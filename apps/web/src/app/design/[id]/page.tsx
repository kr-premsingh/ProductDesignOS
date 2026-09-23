"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  Bookmark,
  BriefcaseBusiness,
  Check,
  ChevronRight,
  Download,
  Heart,
  RotateCcw,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  Truck,
  Wand2,
  Zap
} from "lucide-react";
import { FeedCard } from "@/components/feed-card";
import { categories as fallbackCategories, inspireTiles as fallbackTiles } from "@/lib/mock-data";
import { creditsFor, fetchCategories, fetchDesigns, toTile, type Tile } from "@/lib/catalog";
import { photoForId } from "@/lib/artwork";
import { useAuth } from "@/lib/auth";

function fallbackImage(seed: string, w = 1200, h = 1500) {
  return photoForId(seed, w, h);
}

export default function DesignPage() {
  return (
    <Suspense fallback={null}>
      <DesignPageInner />
    </Suspense>
  );
}

function DesignPageInner() {
  const params = useParams();
  const id = String(params?.id || "");
  const { user } = useAuth();

  const [tiles, setTiles] = useState<Tile[]>(fallbackTiles);
  const [tile, setTile] = useState<Tile | undefined>(() => fallbackTiles.find((t) => t.id === id));
  const [activeImage, setActiveImage] = useState(0);
  const [liked, setLiked] = useState(false);
  const [saved, setSaved] = useState(false);
  const [added, setAdded] = useState(false);

  useEffect(() => {
    const coreApiUrl = process.env.NEXT_PUBLIC_CORE_API_URL || "/core-api";
    Promise.all([fetchCategories(coreApiUrl), fetchDesigns(coreApiUrl, { limit: 100 })])
      .then(([apiCategories, apiDesigns]) => {
        if (!apiDesigns.length) return;
        const apiTiles = apiDesigns.map((design) => toTile(design, apiCategories));
        setTiles(apiTiles);
        const match = apiTiles.find((t) => t.id === id);
        if (match) setTile(match);
      })
      .catch(() => {});
  }, [id]);

  useEffect(() => {
    try {
      setLiked(JSON.parse(localStorage.getItem("liked") || "[]").includes(id));
      setSaved(JSON.parse(localStorage.getItem("saved") || "[]").includes(id));
    } catch {}
  }, [id]);

  const credits = tile ? creditsFor(tile.id) : 0;

  const gallery = useMemo(() => {
    if (!tile) return [];
    return [tile.image, fallbackImage(`${tile.id}-alt-1`), fallbackImage(`${tile.id}-alt-2`), fallbackImage(`${tile.id}-alt-3`)];
  }, [tile]);

  const similar = useMemo(() => {
    if (!tile) return [];
    const sameCategory = tiles.filter((t) => t.id !== tile.id && t.category === tile.category);
    const rest = tiles.filter((t) => t.id !== tile.id && t.category !== tile.category);
    return [...sameCategory, ...rest].slice(0, 10);
  }, [tile, tiles]);

  if (!tile) {
    return (
      <main className="mx-auto max-w-4xl px-4 py-24 text-center text-[#1d1d1f]">
        <h1 className="text-2xl font-black">Design not found</h1>
        <p className="mt-2 text-sm text-black/50">It may have been removed, or the link is off.</p>
        <Link href="/explore" className="mt-6 inline-flex items-center gap-2 rounded-full bg-[#1d1d1f] px-6 py-3 text-sm font-bold text-white">Back to Explore</Link>
      </main>
    );
  }

  const remixHref = user
    ? `/studio?source=${encodeURIComponent(tile.id)}&prompt=${encodeURIComponent(tile.remixPrompt || "")}`
    : "/studio";

  function toggleLocal(key: "liked" | "saved", value: boolean) {
    try {
      const set = new Set(JSON.parse(localStorage.getItem(key) || "[]"));
      if (value) set.add(id); else set.delete(id);
      localStorage.setItem(key, JSON.stringify(Array.from(set)));
    } catch {}
  }

  return (
    <main className="mx-auto max-w-7xl px-3 py-5 text-[#1d1d1f] sm:px-5 sm:py-8 lg:px-8">
      {/* Breadcrumb */}
      <nav className="mb-5 flex items-center gap-1.5 text-xs text-black/45 sm:text-sm">
        <Link href="/" className="hover:text-black">Home</Link>
        <ChevronRight size={13} />
        <Link href="/explore" className="hover:text-black">Explore</Link>
        <ChevronRight size={13} />
        <Link href={`/explore?category=${encodeURIComponent(tile.category)}`} className="hover:text-black">{tile.category}</Link>
        <ChevronRight size={13} />
        <span className="truncate font-semibold text-black/70">{tile.title}</span>
      </nav>

      <div className="grid gap-8 lg:grid-cols-[1.15fr_1fr] lg:gap-12">
        {/* Gallery — sticky on desktop */}
        <div className="lg:sticky lg:top-24 lg:self-start">
          <div className="overflow-hidden rounded-[28px] bg-white shadow-[0_1px_2px_rgba(0,0,0,0.05),0_16px_44px_rgba(0,0,0,0.08)]">
            <div className="relative">
              <img
                src={gallery[activeImage]}
                alt={tile.title}
                className="aspect-[4/5] w-full object-cover"
                onError={(event) => {
                  const img = event.currentTarget;
                  if (img.dataset.fallback) return;
                  img.dataset.fallback = "1";
                  img.src = fallbackImage(tile.id);
                }}
              />
              <span className="absolute left-4 top-4 inline-flex items-center gap-1.5 rounded-full bg-[#1d1d1f]/85 px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider text-white backdrop-blur">
                <Sparkles size={11} className="text-cyan" /> Remixable
              </span>
            </div>
          </div>
          <div className="mt-3 flex gap-3">
            {gallery.map((src, index) => (
              <button
                key={index}
                onClick={() => setActiveImage(index)}
                aria-label={`View image ${index + 1}`}
                className={`h-16 w-16 overflow-hidden rounded-2xl border-2 bg-white transition sm:h-20 sm:w-20 ${activeImage === index ? "border-[#1d1d1f]" : "border-transparent opacity-60 hover:opacity-100"}`}
              >
                <img
                  src={src}
                  alt=""
                  className="h-full w-full object-cover"
                  onError={(event) => {
                    const img = event.currentTarget;
                    if (img.dataset.fallback) return;
                    img.dataset.fallback = "1";
                    img.src = fallbackImage(`${tile.id}-thumb-${index}`, 200, 200);
                  }}
                />
              </button>
            ))}
          </div>
        </div>

        {/* Buy / remix panel */}
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-black/40">{tile.category}</p>
          <h1 className="mt-2 text-3xl font-black tracking-tight sm:text-4xl">{tile.title}</h1>

          <div className="mt-3 flex flex-wrap items-center gap-2">
            {tile.tags.map((tag) => (
              <span key={tag} className="rounded-full bg-black/[0.05] px-3 py-1 text-xs font-semibold text-black/55">#{tag}</span>
            ))}
          </div>

          <div className="mt-5 flex items-end gap-3">
            <p className="text-3xl font-black tracking-tight">{credits} <span className="text-base font-bold text-black/50">credits</span></p>
            <p className="pb-1 text-sm text-black/40 line-through">{credits * 2} credits</p>
            <span className="mb-1 rounded-full bg-lime px-2.5 py-1 text-[11px] font-black text-charcoal">LAUNCH PRICE</span>
          </div>

          <p className="mt-5 text-sm leading-6 text-black/60 sm:text-[15px] sm:leading-7">
            {tile.remixPrompt || "A direction ready to make your own."} Remix it with AI into your format — poster, tee, social, wall art — or buy the finished piece from a vetted creator.
          </p>

          {/* Primary actions */}
          <div className="mt-7 flex flex-col gap-3">
            <Link href={remixHref} className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#1d1d1f] px-6 py-4 text-sm font-bold text-white transition hover:bg-cyan hover:text-charcoal">
              <Wand2 size={17} /> Remix with AI
            </Link>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setAdded(true)}
                className={`inline-flex items-center justify-center gap-2 rounded-full border px-5 py-3.5 text-sm font-bold transition ${added ? "border-lime bg-lime text-charcoal" : "border-black/[0.15] bg-white text-[#1d1d1f] hover:border-black"}`}
              >
                {added ? <><Check size={16} /> Added</> : <><ShoppingBag size={16} /> Buy this design</>}
              </button>
              <Link href="/studio" className="inline-flex items-center justify-center gap-2 rounded-full border border-black/[0.15] bg-white px-5 py-3.5 text-sm font-bold text-[#1d1d1f] transition hover:border-cyan hover:text-cyan">
                <Zap size={16} /> Generate variations
              </Link>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <button
                onClick={() => { const next = !liked; setLiked(next); toggleLocal("liked", next); }}
                className={`inline-flex items-center justify-center gap-2 rounded-full border px-4 py-3 text-xs font-bold transition ${liked ? "border-magenta bg-magenta text-white" : "border-black/[0.12] bg-white text-black/70 hover:border-black/30"}`}
              >
                <Heart size={15} /> {liked ? "Loved" : "Love"}
              </button>
              <button
                onClick={() => { const next = !saved; setSaved(next); toggleLocal("saved", next); }}
                className={`inline-flex items-center justify-center gap-2 rounded-full border px-4 py-3 text-xs font-bold transition ${saved ? "border-cyan bg-cyan text-charcoal" : "border-black/[0.12] bg-white text-black/70 hover:border-black/30"}`}
              >
                <Bookmark size={15} /> {saved ? "Saved" : "Save"}
              </button>
              <Link href="/marketplace" className="inline-flex items-center justify-center gap-2 rounded-full border border-black/[0.12] bg-white px-4 py-3 text-xs font-bold text-black/70 transition hover:border-black/30">
                <BriefcaseBusiness size={15} /> Hire creator
              </Link>
            </div>
          </div>

          {/* Assurance rows */}
          <div className="mt-8 divide-y divide-black/[0.06] rounded-3xl border border-black/[0.08] bg-white shadow-sm">
            {[
              { icon: Download, title: "Instant export", body: "Download production-ready assets in your format after purchase." },
              { icon: Truck, title: "Fulfilled by creators", body: tile.providerSuggestion === "digital" ? "Delivered digitally by the design owner." : "Printed, stitched, or built by vetted providers near you." },
              { icon: RotateCcw, title: "Unlimited remixes", body: "Every purchase includes free AI variations for 30 days." },
              { icon: ShieldCheck, title: "License included", body: "Personal and commercial usage rights on every bought design." }
            ].map(({ icon: Icon, title, body }) => (
              <div key={title} className="flex gap-4 p-4 sm:p-5">
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-black/[0.04] text-[#1d1d1f]"><Icon size={17} /></span>
                <div>
                  <p className="text-sm font-bold">{title}</p>
                  <p className="mt-0.5 text-xs leading-5 text-black/50">{body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Similar designs */}
      <section className="mt-14 sm:mt-20">
        <div className="mb-5 flex items-end justify-between sm:mb-7">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-black/40">Keep browsing</p>
            <h2 className="mt-1.5 text-2xl font-black tracking-tight sm:text-3xl">Similar designs</h2>
          </div>
          <Link href={`/explore?category=${encodeURIComponent(tile.category)}`} className="hidden shrink-0 items-center gap-1.5 rounded-full border border-black/[0.12] bg-white px-4 py-2 text-sm font-semibold transition hover:bg-[#1d1d1f] hover:text-white sm:inline-flex">
            More {tile.category}
            <ChevronRight size={15} />
          </Link>
        </div>
        <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {similar.map((item) => <FeedCard key={item.id} tile={item} />)}
        </div>
      </section>
    </main>
  );
}
