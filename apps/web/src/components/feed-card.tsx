"use client";

import React, { useState, useEffect } from 'react';
import { Wand2, Heart, Bookmark, BriefcaseBusiness } from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth';

async function postAction(path: string, token?: string) {
  try {
    const headers: Record<string,string> = { 'content-type': 'application/json' };
    if (token) headers['authorization'] = `Bearer ${token}`;
    const res = await fetch(path, { method: 'POST', headers });
    return res.ok;
  } catch (err) {
    return false;
  }
}

type Tile = {
  id: string;
  title: string;
  category: string;
  remixPrompt?: string;
  image: string;
  providerSuggestion?: string;
};

export function FeedCard({ tile }: { tile: Tile }) {
  const [liked, setLiked] = useState(false);
  const [saved, setSaved] = useState(false);
  const { user, token } = useAuth();

  useEffect(() => {
    let mounted = true;
    async function init() {
      try {
        const likedSet = JSON.parse(localStorage.getItem('liked') || '[]');
        setLiked(likedSet.includes(tile.id));
        const savedSet = JSON.parse(localStorage.getItem('saved') || '[]');
        setSaved(savedSet.includes(tile.id));
      } catch (err) {}

    }
    init();
    return undefined;
  }, [tile.id, user, token]);

  async function toggleLiked() {
    const next = !liked;
    setLiked(next);
    if (user?.id && token) {
      const coreApiUrl = process.env.NEXT_PUBLIC_CORE_API_URL || "/core-api";
      await postAction(`${coreApiUrl}/designs/${tile.id}/like`, token);
    } else {
      try {
        const likedSet = new Set(JSON.parse(localStorage.getItem('liked') || '[]'));
        if (next) likedSet.add(tile.id); else likedSet.delete(tile.id);
        localStorage.setItem('liked', JSON.stringify(Array.from(likedSet)));
      } catch (err) {}
    }
  }

  async function toggleSaved() {
    const next = !saved;
    setSaved(next);
    if (user?.id && token) {
      const coreApiUrl = process.env.NEXT_PUBLIC_CORE_API_URL || "/core-api";
      await postAction(`${coreApiUrl}/designs/${tile.id}/save`, token);
    } else {
      try {
        const savedSet = new Set(JSON.parse(localStorage.getItem('saved') || '[]'));
        if (next) savedSet.add(tile.id); else savedSet.delete(tile.id);
        localStorage.setItem('saved', JSON.stringify(Array.from(savedSet)));
      } catch (err) {}
    }
  }

  return (
    <article className="group mb-5 break-inside-avoid overflow-hidden rounded-xl bg-white shadow-[0_1px_2px_rgba(0,0,0,0.06),0_8px_24px_rgba(0,0,0,0.06)] transition duration-300 hover:-translate-y-0.5 hover:shadow-[0_4px_10px_rgba(0,0,0,0.08),0_18px_38px_rgba(0,0,0,0.1)]">
      <div className="relative">
        <img
          src={tile.image}
          alt=""
          className="aspect-[4/5] w-full object-cover transition duration-500 group-hover:scale-[1.025]"
          onError={(event) => {
            const img = event.currentTarget;
            if (img.dataset.fallback) return;
            img.dataset.fallback = "1";
            img.src = `https://picsum.photos/seed/${encodeURIComponent(tile.id)}/900/1200`;
          }}
        />
        <div className="absolute right-3 top-3 flex gap-2 opacity-0 transition group-hover:opacity-100 focus-within:opacity-100">
          <button aria-label="Like" onClick={toggleLiked} className={`grid h-9 w-9 place-items-center rounded-full shadow-sm backdrop-blur ${liked ? 'bg-[#ff4da6] text-white' : 'bg-white/90 text-[#1d1d1f]'}`}>
            <Heart size={14} />
          </button>
          <button aria-label="Save" onClick={toggleSaved} className={`grid h-9 w-9 place-items-center rounded-full shadow-sm backdrop-blur ${saved ? 'bg-cyan text-charcoal' : 'bg-white/90 text-[#1d1d1f]'}`}>
            <Bookmark size={14} />
          </button>
        </div>
      </div>

      <div className="p-4 text-[#1d1d1f]">
        <div className="flex items-center justify-between gap-3">
          <h2 className="font-semibold">{tile.title}</h2>
          <span className="rounded-full bg-black/[0.05] px-2.5 py-1 text-[11px] font-medium text-black/55">{tile.category}</span>
        </div>
        <p className="mt-2 line-clamp-2 text-sm leading-5 text-black/55">{tile.remixPrompt || "A direction ready to make your own."}</p>
        <div className="mt-4 flex gap-2">
          <Link
            href={
              user
                ? `/studio?source=${encodeURIComponent(tile.id)}&prompt=${encodeURIComponent(tile.remixPrompt || "")}`
                : `/studio`
            }
            className="inline-flex items-center gap-2 rounded-full bg-[#1d1d1f] px-3.5 py-2 text-xs font-semibold text-white transition hover:bg-cyan hover:text-charcoal"
          >
            <Wand2 size={14} /> Remix
          </Link>
          <button className="inline-flex items-center gap-2 rounded-full border border-black/[0.12] px-3.5 py-2 text-xs font-semibold text-black/60 transition hover:border-black/30 hover:text-black">
            <BriefcaseBusiness size={14} /> Hire
          </button>
        </div>
      </div>
    </article>
  );
}
