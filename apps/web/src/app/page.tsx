"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ArrowRight, ArrowUpRight, ChevronLeft, ChevronRight, Flame, ShoppingBag, Sparkles, Wand2, Zap } from "lucide-react";
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

const HERO_SLIDES = [
  {
    kicker: "The inspiration marketplace",
    title: ["See it. Remix it.", "Make it yours."],
    body: "Shop remixable designs for posters, merch, socials, and interiors — personalize any piece with AI, or buy it made by real creators.",
    seed: "dooniq-hero",
    accent: "cyan"
  },
  {
    kicker: "Fresh this week",
    title: ["New drops,", "zero blank canvas."],
    body: "Every week, creators publish remixable directions. Start from something great instead of nothing.",
    seed: "dooniq-hero-drops",
    accent: "magenta"
  },
  {
    kicker: "Dooniq Studio",
    title: ["Your idea.", "Three directions.", "Seconds."],
    body: "Type a feeling, a format, a vibe — Studio drafts distinct remixable directions you can refine, save, or send to a creator.",
    seed: "dooniq-hero-studio",
    accent: "lime"
  },
  {
    kicker: "Get it made",
    title: ["From screen", "to doorstep."],
    body: "Buy any design as a finished product — printed, stitched, or built by vetted providers.",
    seed: "dooniq-hero-made",
    accent: "cyan"
  }
];

const SLIDE_MS = 6000;

function HeroCarousel() {
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const viewportRef = useRef<HTMLDivElement>(null);
  const [viewportWidth, setViewportWidth] = useState(0);
  const count = HERO_SLIDES.length;
  const GAP = 12;

  const go = useCallback((next: number) => setActive(((next % count) + count) % count), [count]);

  useEffect(() => {
    if (paused) return;
    const timer = setInterval(() => setActive((current) => (current + 1) % count), SLIDE_MS);
    return () => clearInterval(timer);
  }, [paused, count]);

  useEffect(() => {
    const node = viewportRef.current;
    if (!node) return;
    const observer = new ResizeObserver((entries) => setViewportWidth(entries[0].contentRect.width));
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  // Desktop (>=768px): MS Store-style peek — active slide edges align with the page's
  // adaptive content padding (px-4 / sm:px-6 / lg:px-10 / 2xl:px-16), neighbours peek past it.
  // Mobile: classic full-width carousel with a small gutter.
  const desktop = viewportWidth >= 768;
  const pad = viewportWidth >= 1536 ? 64 : viewportWidth >= 1024 ? 40 : viewportWidth >= 640 ? 24 : 16;
  const PEEK = 72;
  const slideWidth = desktop ? viewportWidth - 2 * pad - 2 * PEEK : viewportWidth - 24;
  const step = slideWidth + GAP;
  // Center the active slide; track contains a clone on each end so the loop is visually seamless.
  const offset = viewportWidth / 2 - slideWidth / 2 - (active + 1) * step;

  // [last, ...slides, first] — the clones make first/last wrap seamlessly in the peek layout.
  const track = [HERO_SLIDES[count - 1], ...HERO_SLIDES, HERO_SLIDES[0]];

  return (
    <section
      className="group/carousel pt-3"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div ref={viewportRef} className="relative overflow-hidden">
        <div
          className="flex transition-transform duration-700 [transition-timing-function:cubic-bezier(0.32,0.72,0,1)]"
          style={{ gap: GAP, transform: `translateX(${offset}px)` }}
        >
          {track.map((slide, index) => {
            const slideIndex = index - 1;
            const wrapped = ((slideIndex % count) + count) % count;
            return (
              <HeroSlide
                key={`${slide.seed}-${index}`}
                slide={slide}
                isActive={slideIndex === active}
                width={slideWidth}
                onClick={slideIndex !== active ? () => go(wrapped) : undefined}
              />
            );
          })}
        </div>

        {/* Arrows */}
        <button
          onClick={() => go(active - 1)}
          aria-label="Previous slide"
          className="absolute left-[28px] top-1/2 z-10 grid h-10 w-10 -translate-y-1/2 place-items-center rounded-full bg-charcoal/60 text-white opacity-0 shadow-lg backdrop-blur transition hover:bg-white hover:text-charcoal focus:opacity-100 group-hover/carousel:opacity-100 sm:left-[36px] sm:h-12 sm:w-12 lg:left-[52px] 2xl:left-[76px]"
        >
          <ChevronLeft size={20} />
        </button>
        <button
          onClick={() => go(active + 1)}
          aria-label="Next slide"
          className="absolute right-[28px] top-1/2 z-10 grid h-10 w-10 -translate-y-1/2 place-items-center rounded-full bg-charcoal/60 text-white opacity-0 shadow-lg backdrop-blur transition hover:bg-white hover:text-charcoal focus:opacity-100 group-hover/carousel:opacity-100 sm:right-[36px] sm:h-12 sm:w-12 lg:right-[52px] 2xl:right-[76px]"
        >
          <ChevronRight size={20} />
        </button>

        {/* Dots */}
        <div className="absolute bottom-4 left-1/2 z-10 flex -translate-x-1/2 gap-2 sm:bottom-6">
          {HERO_SLIDES.map((slide, index) => (
            <button
              key={slide.seed}
              onClick={() => go(index)}
              aria-label={`Go to slide ${index + 1}`}
              className={`h-1.5 rounded-full transition-all duration-500 ${index === active ? "w-7 bg-white" : "w-1.5 bg-white/40 hover:bg-white/70"}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

function HeroSlide({
  slide,
  isActive,
  width,
  onClick
}: {
  slide: (typeof HERO_SLIDES)[number];
  isActive: boolean;
  width: number;
  onClick?: () => void;
}) {
  const accentClass = slide.accent === "magenta" ? "text-magenta" : slide.accent === "lime" ? "text-lime" : "text-cyan";
  return (
    <div
      onClick={onClick}
      role={onClick ? "button" : undefined}
      aria-label={onClick ? `Show slide: ${slide.kicker}` : undefined}
      className={`relative shrink-0 overflow-hidden rounded-[28px] bg-charcoal transition-all duration-700 sm:rounded-[36px] ${onClick ? "cursor-pointer" : ""} ${isActive ? "" : "brightness-[0.55] hover:brightness-[0.75]"}`}
      style={width ? { width } : undefined}
    >
      <img
        src={`https://picsum.photos/seed/${slide.seed}/1600/1000`}
        alt=""
        className={`absolute inset-0 h-full w-full object-cover transition-transform duration-[7000ms] ease-linear ${isActive ? "scale-110 opacity-70" : "scale-105 opacity-60"}`}
      />
      <div className={`absolute inset-0 bg-gradient-to-r transition-opacity duration-700 ${isActive ? "from-black/75 via-black/45 to-black/10" : "from-black/70 via-black/55 to-black/40"}`} />
      <div className={`relative flex min-h-[70vh] flex-col justify-end p-6 transition-opacity duration-500 sm:min-h-[76vh] sm:p-12 lg:p-16 ${isActive ? "opacity-100" : "opacity-0 md:opacity-25"}`}>
        <p className="mb-3 inline-flex w-fit items-center gap-2 rounded-full border border-white/25 bg-white/10 px-3.5 py-1.5 text-[11px] font-bold uppercase tracking-[0.2em] text-white backdrop-blur">
          <Sparkles size={12} className={accentClass} /> {slide.kicker}
        </p>
        <h1 className="max-w-3xl text-4xl font-black leading-[1.02] tracking-tight text-white sm:text-6xl lg:text-7xl">
          {slide.title.map((line) => (
            <span key={line} className="block">{line}</span>
          ))}
        </h1>
        <p className="mt-4 max-w-xl text-sm leading-6 text-white/75 sm:text-base sm:leading-7">{slide.body}</p>
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

      {/* Hero — auto/manual carousel, MS Store-style peek on desktop */}
      <HeroCarousel />

      {/* Shop by category — Snitch-style circles, Apple-clean spacing */}
      <section className="px-4 pt-12 sm:px-6 sm:pt-16 lg:px-10 2xl:px-16">
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

      {/* Trending rail — heading and first card share the same left rail */}
      <section className="pt-12 sm:pt-16">
        <div className="px-4 sm:px-6 lg:px-10 2xl:px-16">
          <SectionHeading eyebrow="Hot right now" title="Trending this week" href="/explore" cta="View all" />
        </div>
        <div className="flex snap-x snap-mandatory scroll-pl-4 gap-4 overflow-x-auto pb-2 [scrollbar-width:none] before:w-0 before:shrink-0 before:content-[''] after:w-4 after:shrink-0 after:content-[''] sm:scroll-pl-6 sm:before:w-2 sm:after:w-6 lg:scroll-pl-10 lg:before:w-6 lg:after:w-10 2xl:scroll-pl-16 2xl:before:w-12 2xl:after:w-16">
          {trending.map((tile) => <TrendCard key={tile.id} tile={tile} />)}
        </div>
      </section>

      {/* Studio editorial banner */}
      <section className="px-4 pt-12 sm:px-6 sm:pt-16 lg:px-10 2xl:px-16">
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
      <section className="px-4 pt-12 sm:px-6 sm:pt-16 lg:px-10 2xl:px-16">
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
      <section className="px-4 py-12 sm:px-6 sm:py-16 lg:px-10 2xl:px-16">
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

