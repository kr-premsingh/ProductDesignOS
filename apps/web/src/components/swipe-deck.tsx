"use client";

import { useMemo, useRef, useState } from "react";
import Link from "next/link";
import { Check, Heart, RotateCcw, X } from "lucide-react";
import { creditsFor, type Tile } from "@/lib/catalog";
import { designPhoto } from "@/lib/artwork";

type Verdict = "like" | "nope";

const PREF_KEY = "dooniq_taste";

function recordVerdict(tile: Tile, verdict: Verdict) {
  try {
    const prefs = JSON.parse(localStorage.getItem(PREF_KEY) || '{"likes":[],"nopes":[],"categories":{}}');
    const entry = { id: tile.id, at: Date.now() };
    if (verdict === "like") {
      prefs.likes = [...prefs.likes.filter((p: any) => p.id !== tile.id), entry].slice(-100);
      prefs.categories[tile.category] = (prefs.categories[tile.category] || 0) + 1;
      // Liking also drops it into the saved set so Studio can use it as a source.
      const saved = new Set(JSON.parse(localStorage.getItem("saved") || "[]"));
      saved.add(tile.id);
      localStorage.setItem("saved", JSON.stringify(Array.from(saved)));
    } else {
      prefs.nopes = [...prefs.nopes.filter((p: any) => p.id !== tile.id), entry].slice(-100);
      prefs.categories[tile.category] = (prefs.categories[tile.category] || 0) - 1;
    }
    localStorage.setItem(PREF_KEY, JSON.stringify(prefs));
    window.dispatchEvent(new CustomEvent("dooniq:taste"));
  } catch {}
}

export function readTaste(): { likes: string[]; categories: Record<string, number> } {
  try {
    const prefs = JSON.parse(localStorage.getItem(PREF_KEY) || '{"likes":[],"categories":{}}');
    return { likes: prefs.likes.map((p: any) => p.id), categories: prefs.categories || {} };
  } catch {
    return { likes: [], categories: {} };
  }
}

export function SwipeDeck({ tiles }: { tiles: Tile[] }) {
  const seen = useRef<Set<string>>(new Set());
  const [deck, setDeck] = useState<Tile[]>(() => {
    let skip: string[] = [];
    try {
      const prefs = JSON.parse(localStorage.getItem(PREF_KEY) || '{"likes":[],"nopes":[]}');
      skip = [...(prefs.likes || []), ...(prefs.nopes || [])].map((p: any) => p.id);
    } catch {}
    skip.forEach((id) => seen.current.add(id));
    return tiles.filter((t) => !seen.current.has(t.id)).slice(0, 15);
  });
  const [exiting, setExiting] = useState<{ id: string; dir: Verdict } | null>(null);
  const [done, setDone] = useState(false);

  // Top-up the deck once tiles arrive from the API.
  const knownIds = useMemo(() => new Set(deck.map((t) => t.id)), [deck]);
  const extras = tiles.filter((t) => !knownIds.has(t.id) && !seen.current.has(t.id)).slice(0, Math.max(0, 15 - deck.length));
  const fullDeck = [...deck, ...extras];

  const top = fullDeck[0];
  const likeCount = (() => {
    try {
      return JSON.parse(localStorage.getItem(PREF_KEY) || '{"likes":[]}').likes.length;
    } catch {
      return 0;
    }
  })();

  function decide(verdict: Verdict) {
    if (!top || exiting) return;
    setExiting({ id: top.id, dir: verdict });
    recordVerdict(top, verdict);
    seen.current.add(top.id);
    setTimeout(() => {
      setDeck((current) => current.filter((t) => t.id !== top.id));
      setExiting(null);
      if (fullDeck.length <= 1) setDone(true);
    }, 350);
  }

  function reset() {
    try {
      const prefs = JSON.parse(localStorage.getItem(PREF_KEY) || '{"likes":[],"nopes":[],"categories":{}}');
      prefs.nopes = [];
      localStorage.setItem(PREF_KEY, JSON.stringify(prefs));
    } catch {}
    seen.current = new Set(JSON.parse(localStorage.getItem(PREF_KEY) || '{"likes":[]}').likes.map((p: any) => p.id));
    setDeck(tiles.filter((t) => !seen.current.has(t.id)).slice(0, 15));
    setDone(false);
  }

  return (
    <section className="border-b border-black/[0.08] pb-8 pt-6">
      <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-black/40">Tune your taste</p>
          <h2 className="mt-1.5 text-2xl font-black tracking-tight text-[#1d1d1f] sm:text-3xl">Made for you</h2>
          <p className="mt-1 text-sm text-black/50">
            {likeCount > 0
              ? `${likeCount} liked — your recommendations below are already shifting.`
              : "Swipe right on what moves you. We'll tune your feed to match."}
          </p>
        </div>
        <span className="rounded-full bg-black/[0.05] px-3 py-1.5 text-xs font-semibold text-black/50">
          {done ? "Deck complete" : `${fullDeck.length} to review`}
        </span>
      </div>

      {/* Matches the home hero height */}
      <div className="grid min-h-[70vh] place-items-center sm:min-h-[76vh]">
        {done || !top ? (
          <div className="max-w-sm text-center">
            <span className="mx-auto grid h-16 w-16 place-items-center rounded-3xl bg-[#1d1d1f] text-cyan">
              <Check size={26} />
            </span>
            <h3 className="mt-5 text-2xl font-black tracking-tight">Taste profile updated.</h3>
            <p className="mt-2 text-sm leading-6 text-black/55">
              Your Discover feed and Studio sources now lean into what you loved. Keep exploring — the deck refills as new designs drop.
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-2">
              <Link href="/studio" className="inline-flex items-center gap-2 rounded-full bg-[#1d1d1f] px-5 py-3 text-sm font-bold text-white transition hover:bg-cyan hover:text-charcoal">
                Remix a liked design
              </Link>
              <button onClick={reset} className="inline-flex items-center gap-2 rounded-full border border-black/[0.12] bg-white px-5 py-3 text-sm font-semibold text-black/70 transition hover:border-black">
                <RotateCcw size={15} /> Review again
              </button>
            </div>
          </div>
        ) : (
          <div className="flex w-full flex-col items-center">
            {/* Card stack */}
            <div className="relative h-[52vh] w-full max-w-sm sm:h-[56vh]">
              {fullDeck.slice(0, 4).map((tile, index) => {
                const isTop = index === 0;
                const exit = exiting && exiting.id === tile.id ? exiting.dir : null;
                return (
                  <div
                    key={tile.id}
                    className="absolute inset-0 select-none"
                    style={{
                      transform: exit
                        ? `translateX(${exit === "like" ? 130 : -130}%) rotate(${exit === "like" ? 18 : -18}deg)`
                        : `translateY(${index * -12}px) rotate(${index === 1 ? 3 : index === 2 ? -3 : index === 3 ? 2 : 0}deg) scale(${1 - index * 0.045})`,
                      transition: exit
                        ? "transform 350ms cubic-bezier(0.2, 0.8, 0.3, 1), opacity 350ms"
                        : "transform 300ms cubic-bezier(0.32, 0.72, 0, 1)",
                      opacity: exit ? 0 : index > 2 ? 0 : 1,
                      zIndex: 10 - index,
                      pointerEvents: isTop ? "auto" : "none"
                    }}
                  >
                    <div className="relative h-full overflow-hidden rounded-[28px] bg-white shadow-[0_2px_4px_rgba(0,0,0,0.06),0_20px_50px_rgba(0,0,0,0.12)] ring-1 ring-black/[0.06]">
                      <img
                        src={tile.image}
                        alt={tile.title}
                        draggable={false}
                        className="h-full w-full object-cover"
                        onError={(event) => {
                          const img = event.currentTarget;
                          if (img.dataset.fallback) return;
                          img.dataset.fallback = "1";
                          img.src = designPhoto(tile.id, tile.category, 800, 1100);
                        }}
                      />
                      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/75 via-black/35 to-transparent p-5 pt-16">
                        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-cyan">{tile.category}</p>
                        <h3 className="mt-1 text-xl font-black tracking-tight text-white">{tile.title}</h3>
                        <p className="mt-1 line-clamp-2 text-xs leading-5 text-white/70">{tile.remixPrompt || "A direction ready to make your own."}</p>
                        <div className="mt-2 flex items-center gap-2 text-[11px] font-bold text-white/80">
                          <span>{creditsFor(tile.id)} credits</span>
                          <span className="text-white/40">·</span>
                          <Link
                            href={`/design/${encodeURIComponent(tile.id)}`}
                            className="underline decoration-white/40 underline-offset-2 transition hover:text-white"
                            onClick={(e) => e.stopPropagation()}
                          >
                            Open details
                          </Link>
                        </div>
                      </div>
                      {/* Verdict stamps */}
                      {exit === "like" ? (
                        <span className="absolute left-5 top-5 -rotate-12 rounded-xl border-4 border-lime px-3 py-1 text-2xl font-black uppercase tracking-widest text-lime">Love it</span>
                      ) : null}
                      {exit === "nope" ? (
                        <span className="absolute right-5 top-5 rotate-12 rounded-xl border-4 border-magenta px-3 py-1 text-2xl font-black uppercase tracking-widest text-magenta">Nope</span>
                      ) : null}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Action buttons */}
            <div className="mt-6 flex items-center gap-4">
              <button
                onClick={() => decide("nope")}
                aria-label="Not for me"
                className="group grid h-14 w-14 place-items-center rounded-full border-2 border-black/[0.12] bg-white text-black/60 shadow-[0_8px_24px_rgba(0,0,0,0.1)] transition hover:-rotate-12 hover:scale-110 hover:border-magenta hover:text-magenta active:scale-95"
              >
                <X size={22} strokeWidth={2.5} />
              </button>
              <button
                onClick={() => decide("like")}
                aria-label="Love it"
                className="group grid h-16 w-16 place-items-center rounded-full bg-[#1d1d1f] text-cyan shadow-[0_12px_32px_rgba(0,0,0,0.22)] transition hover:rotate-12 hover:scale-110 hover:bg-cyan hover:text-charcoal active:scale-95"
              >
                <Heart size={24} fill="currentColor" />
              </button>
            </div>
            <p className="mt-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-black/35">
              Tap ✕ to pass · ♥ to love
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
