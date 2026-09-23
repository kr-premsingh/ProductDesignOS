"use client";

import { useEffect, useMemo, useState } from "react";
import { ArrowRight, ArrowUpRight, Flame, ShoppingBag, Sparkles, Wand2, Zap } from "lucide-react";
import Link from "next/link";
import { FeedCard } from "@/components/feed-card";
import { categories as fallbackCategories, inspireTiles as fallbackTiles } from "@/lib/mock-data";
import { creditsFor, fetchCategories, fetchDesigns, toTile, type Tile } from "@/lib/catalog";

function imageFor(tile: Tile | undefined, seed: string) {
  return tile?.image || `https://picsum.photos/seed/${encodeURIComponent(seed)}/1200/900`;
}

function SectionHeading({ eyebrow, title, href, cta }: { eyebrow: string; title: string; href?: string; cta?: string }) {
  return (
    <div className="mb-5 flex items-end justify-between gap-4 sm:mb-7">
      <div>
        <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-black/40">{eyebrow}</p>
        <h2 className="mt-1.5 text-2xl font-black tracking-tight text-[#1d1d1f] sm:text-3xl md:text-4xl">{title}</h2>
      </div>
      {href ? (
        <Link href={href} className="group hidden shrink-0 items-center gap-1.5 rounded-full border border-black/[0.12] bg-white px-4 py-2 text-sm font-semibold text-[#1d1d1f] transition hover:border-black hover:bg-[#1d1d1f] hover:text-white sm:inline-flex">
          {cta || "View all"}
          <ArrowRight size={15} className="transition-transform group-hover:translate-x-0.5" />
        </Link>
      ) : null}
    </div>
  );
}

function TrendCard({ tile }: { tile: Tile }) {
  return (
    <Link href={`/design/${encodeURIComponent(tile.id)}`} className="group relative w-[240px] shrink-0 snap-start overflow-hidden rounded-3xl bg-white shadow-[0_1px_2px_rgba(0,0,0,0.05),0_10px_30px_rgba(0,0,0,0.06)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_10px_20px_rgba(0,0,0,0.08),0_24px_50px_rgba(0,0,0,0.12)] sm:w-[280px]">
      <div className="relative overflow-hidden">
        <img
          src={tile.image}
          alt={tile.title}
          className="aspect-[4/5] w-full object-cover transition duration-700 group-hover:scale-[1.04]"
          onError={(event) => {
            const img = event.currentTarget;
            if (img.dataset.fallback) return;
            img.dataset.fallback = "1";
            img.src = `https://picsum.photos/seed/${encodeURIComponent(tile.id)}/900/1200`;
          }}
        />
        <span className="absolute left-3 top-3 inline-flex items-center gap-1 rounded-full bg-[#1d1d1f]/85 px-2.5 py-1 text-[11px] font-bold text-white backdrop-blur">
          <Flame size={11} className="text-magenta" /> Trending
        </span>
        <span className="absolute bottom-3 left-3 rounded-full bg-white/90 px-3 py-1.5 text-xs font-black text-[#1d1d1f] shadow-sm backdrop-blur">
          {creditsFor(tile.id)} credits
        </span>
      </div>
      <div className="p-4">
        <div className="flex items-center justify-between gap-2">
          <h3 className="truncate text-sm font-bold text-[#1d1d1f]">{tile.title}</h3>
          <span className="shrink-0 text-[10px] font-semibold uppercase tracking-wider text-black/40">{tile.category}</span>
        </div>
        <p className="mt-1 line-clamp-1 text-xs text-black/50">{tile.remixPrompt || "Ready to remix."}</p>
        <div className="mt-3 flex items-center justify-between">
          <span className="inline-flex items-center gap-1.5 text-xs font-bold text-[#1d1d1f]">
            <Wand2 size={13} className="text-cyan" /> Remix or buy
          </span>
          <span className="grid h-8 w-8 place-items-center rounded-full bg-[#1d1d1f] text-white transition group-hover:bg-cyan group-hover:text-charcoal">
            <ArrowUpRight size={14} />
          </span>
        </div>
      </div>
    </Link>
  );
}

export default function DooniqHome() {
  const [categories, setCategories] = useState<string[]>(fallbackCategories);
  const [tiles, setTiles] = useState<Tile[]>(fallbackTiles);

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

  const heroTile = tiles[0];
  const categoryTiles = useMemo(
    () => categories.map((category) => ({ name: category, tile: tiles.find((t) => t.category === category) })),
    [categories, tiles]
  );
  const trending = tiles.slice(0, 8);
  const freshDrops = tiles.slice(2, 14);

  return (
    <main className="bg-[#f5f5f7] text-[#1d1d1f]">
      {/* Snitch-style announcement strip */}
      <div className="bg-[#1d1d1f] px-4 py-2.5 text-center text-[11px] font-semibold uppercase tracking-[0.18em] text-white sm:text-xs">
        New drops every week <span className="mx-2 text-white/30">•</span> <span className="text-cyan">50 free remix credits</span> on sign up
      </div>

      {/* Hero — full-bleed editorial banner */}
      <section className="px-3 pt-3 sm:px-5 lg:px-8 2xl:px-12">
        <div className="relative overflow-hidden rounded-[28px] bg-charcoal sm:rounded-[36px]">
          <img
            src={imageFor(heroTile, "dooniq-hero")}
            alt=""
            className="absolute inset-0 h-full w-full scale-105 object-cover opacity-70"
            onError={(event) => {
              const img = event.currentTarget;
              if (img.dataset.fallback) return;
              img.dataset.fallback = "1";
              img.src = "https://picsum.photos/seed/dooniq-hero/1600/1000";
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/75 via-black/45 to-black/10" />
          <div className="relative flex min-h-[70vh] flex-col justify-end p-6 sm:min-h-[76vh] sm:p-12 lg:p-16">
            <p className="mb-3 inline-flex w-fit items-center gap-2 rounded-full border border-white/25 bg-white/10 px-3.5 py-1.5 text-[11px] font-bold uppercase tracking-[0.2em] text-white backdrop-blur">
              <Sparkles size={12} className="text-cyan" /> The inspiration marketplace
            </p>
            <h1 className="max-w-3xl text-4xl font-black leading-[1.02] tracking-tight text-white sm:text-6xl lg:text-7xl">
              See it. Remix it.<br />Make it yours.
            </h1>
            <p className="mt-4 max-w-xl text-sm leading-6 text-white/75 sm:text-base sm:leading-7">
              Shop remixable designs for posters, merch, socials, and interiors — personalize any piece with AI, or buy it made by real creators.
            </p>
            <div className="mt-7 flex flex-wrap items-center gap-3">
              <Link href="/explore" className="group inline-flex items-center gap-2 rounded-full bg-white px-6 py-3.5 text-sm font-bold text-[#1d1d1f] transition hover:bg-cyan">
                Shop the drop <ArrowRight size={16} className="transition-transform group-hover:translate-x-0.5" />
              </Link>
              <Link href="/studio" className="inline-flex items-center gap-2 rounded-full border border-white/30 bg-white/10 px-6 py-3.5 text-sm font-bold text-white backdrop-blur transition hover:border-white hover:bg-white hover:text-[#1d1d1f]">
                <Wand2 size={16} /> Remix with AI
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Shop by category — Snitch-style circles, Apple-clean spacing */}
      <section className="px-3 pt-12 sm:px-5 sm:pt-16 lg:px-8 2xl:px-12">
        <SectionHeading eyebrow="Browse" title="Shop by category" href="/explore" cta="All designs" />
        <div className="flex gap-4 overflow-x-auto pb-2 [scrollbar-width:none] sm:gap-6">
          {categoryTiles.map(({ name, tile }) => (
            <Link key={name} href={`/explore?category=${encodeURIComponent(name)}`} className="group flex w-24 shrink-0 flex-col items-center gap-3 sm:w-32">
              <span className="relative block h-24 w-24 overflow-hidden rounded-full border-2 border-transparent bg-white shadow-sm transition duration-300 group-hover:scale-[1.04] group-hover:border-cyan sm:h-32 sm:w-32">
                <img
                  src={imageFor(tile, `dooniq-cat-${name}`)}
                  alt={name}
                  className="h-full w-full object-cover"
                  onError={(event) => {
                    const img = event.currentTarget;
                    if (img.dataset.fallback) return;
                    img.dataset.fallback = "1";
                    img.src = `https://picsum.photos/seed/dooniq-cat-${encodeURIComponent(name)}/400/400`;
                  }}
                />
              </span>
              <span className="text-xs font-bold text-[#1d1d1f] sm:text-sm">{name}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* Trending rail */}
      <section className="px-3 pt-12 sm:px-5 sm:pt-16 lg:px-8 2xl:px-12">
        <SectionHeading eyebrow="Hot right now" title="Trending this week" href="/explore" cta="View all" />
        <div className="-mx-3 flex snap-x snap-mandatory gap-4 overflow-x-auto px-3 pb-2 [scrollbar-width:none] sm:-mx-5 sm:px-5 lg:-mx-8 lg:px-8 2xl:-mx-12 2xl:px-12">
          {trending.map((tile) => <TrendCard key={tile.id} tile={tile} />)}
        </div>
      </section>

      {/* Studio editorial banner */}
      <section className="px-3 pt-12 sm:px-5 sm:pt-16 lg:px-8 2xl:px-12">
        <Link href="/studio" className="group relative block overflow-hidden rounded-[28px] bg-[linear-gradient(118deg,#0b0f14,#12303a_55%,#0b0f14)] p-8 sm:rounded-[36px] sm:p-14">
          <div className="absolute -right-20 -top-24 h-72 w-72 rounded-full bg-cyan/20 blur-3xl transition duration-700 group-hover:bg-cyan/30" />
          <div className="absolute -bottom-24 right-40 h-56 w-56 rounded-full bg-magenta/15 blur-3xl" />
          <div className="relative max-w-2xl">
            <p className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3.5 py-1.5 text-[11px] font-bold uppercase tracking-[0.2em] text-cyan">
              <Zap size={12} /> Dooniq Studio
            </p>
            <h2 className="mt-5 text-3xl font-black tracking-tight text-white sm:text-5xl">Your idea. Three directions. Seconds.</h2>
            <p className="mt-4 max-w-lg text-sm leading-6 text-white/65 sm:text-base">
              Type a feeling, a format, a vibe — Studio generates distinct remixable directions you can refine, save, or send to a creator.
            </p>
            <span className="mt-7 inline-flex items-center gap-2 rounded-full bg-cyan px-6 py-3 text-sm font-bold text-charcoal transition group-hover:gap-3">
              Open Studio <ArrowRight size={16} />
            </span>
          </div>
        </Link>
      </section>

      {/* Fresh drops — Pinterest masonry */}
      <section className="px-3 pt-12 sm:px-5 sm:pt-16 lg:px-8 2xl:px-12">
        <SectionHeading eyebrow="Just landed" title="Fresh drops" href="/explore" cta="Explore everything" />
        <div className="columns-2 gap-3 md:columns-3 lg:columns-4 xl:columns-5">
          {freshDrops.map((tile) => (
            <div key={tile.id} className="mb-3 break-inside-avoid">
              <FeedCard tile={tile} />
            </div>
          ))}
        </div>
      </section>

      {/* Marketplace banner */}
      <section className="px-3 py-12 sm:px-5 sm:py-16 lg:px-8 2xl:px-12">
        <div className="grid gap-4 md:grid-cols-2">
          <Link href="/marketplace" className="group flex min-h-56 flex-col justify-between overflow-hidden rounded-[28px] border border-black/[0.08] bg-white p-7 shadow-sm transition hover:-translate-y-0.5 hover:shadow-[0_18px_50px_rgba(0,0,0,0.1)] sm:min-h-64 sm:p-10">
            <ShoppingBag size={22} className="text-magenta" />
            <div>
              <h3 className="text-2xl font-black tracking-tight sm:text-3xl">Get it made.</h3>
              <p className="mt-2 max-w-sm text-sm leading-6 text-black/55">Buy any design as a finished product — printed, stitched, or built by vetted creators and providers.</p>
              <span className="mt-5 inline-flex items-center gap-2 text-sm font-bold text-[#1d1d1f]">
                Visit marketplace <ArrowRight size={15} className="transition-transform group-hover:translate-x-1" />
              </span>
            </div>
          </Link>
          <Link href="/provider/onboard" className="group flex min-h-56 flex-col justify-between overflow-hidden rounded-[28px] border border-black/[0.08] bg-[linear-gradient(135deg,#fff,#f6fbfc)] p-7 shadow-sm transition hover:-translate-y-0.5 hover:shadow-[0_18px_50px_rgba(0,0,0,0.1)] sm:min-h-64 sm:p-10">
            <Sparkles size={22} className="text-cyan" />
            <div>
              <h3 className="text-2xl font-black tracking-tight sm:text-3xl">Sell your taste.</h3>
              <p className="mt-2 max-w-sm text-sm leading-6 text-black/55">Publish remixable designs, get discovered, and get paid when people make them real.</p>
              <span className="mt-5 inline-flex items-center gap-2 text-sm font-bold text-[#1d1d1f]">
                Become a provider <ArrowRight size={15} className="transition-transform group-hover:translate-x-1" />
              </span>
            </div>
          </Link>
        </div>
      </section>
    </main>
  );
}

