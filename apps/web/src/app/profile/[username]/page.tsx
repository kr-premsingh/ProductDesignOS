"use client";

import { useEffect, useState } from "react";
import { Grid2X2, Link as LinkIcon, MapPin, Package } from "lucide-react";
import { useAuth } from "@/lib/auth";

type Profile = { profile: { username: string; display_name?: string; bio?: string; avatar_url?: string; provider_status?: string; provider_categories: string[]; provider_capabilities: string[]; provider_portfolio: string[] }; designs: { id: string; title?: string; asset_url: string; tags: string[] }[]; offerings: { id: string; title: string; description?: string; fulfillment_type: string }[]; follower_count: number; following_count: number };

export default function ProfilePage({ params }: { params: { username: string } }) {
  const { user } = useAuth();
  const [data, setData] = useState<Profile | null>(null);
  const [error, setError] = useState(false);
  const isOwner = user?.username === params.username;

  useEffect(() => {
    const controller = new AbortController();
    const coreApiUrl = process.env.NEXT_PUBLIC_CORE_API_URL || "/core-api";
    fetch(`${coreApiUrl}/profiles/${params.username}`, { signal: controller.signal })
      .then((res) => { if (!res.ok) throw new Error(String(res.status)); return res.json(); })
      .then(setData)
      .catch(() => setError(true));
    return () => controller.abort();
  }, [params.username]);

  if (error) return <main className="mx-auto max-w-5xl px-4 py-20 text-center text-black/50"><h1 className="text-2xl font-bold text-[#1d1d1f]">This portfolio is not available.</h1><p className="mt-3">The profile may not exist yet, or the connection was interrupted.</p></main>;
  if (!data) return <main className="mx-auto max-w-5xl px-4 py-20 text-center text-black/50">Loading portfolio...</main>;
  const { profile, designs, offerings } = data;
  return <main className="mx-auto w-full max-w-[1800px] px-4 py-10 text-[#1d1d1f] sm:px-6 xl:px-10"><section className="flex flex-col gap-6 sm:flex-row sm:items-center"><div className="grid h-24 w-24 shrink-0 place-items-center overflow-hidden rounded-full border border-black/[0.1] bg-white text-3xl font-black text-cyan shadow-sm">{profile.avatar_url ? <img src={profile.avatar_url} alt="" className="h-full w-full object-cover" /> : profile.username.slice(0, 1).toUpperCase()}</div><div className="min-w-0 flex-1"><div className="flex flex-wrap items-center gap-3"><h1 className="text-2xl font-bold">{profile.display_name || `@${profile.username}`}</h1>{profile.provider_status && profile.provider_status !== "none" ? <span className="rounded-full bg-cyan/15 px-3 py-1 text-xs font-semibold text-cyan">Provider</span> : null}</div><p className="mt-2 text-sm text-black/50">@{profile.username}</p><p className="mt-3 max-w-xl text-sm leading-6 text-black/70">{profile.bio || "Creating things that feel personal."}</p></div><div className="flex gap-6 text-center text-sm"><span><b className="block text-lg">{designs.length}</b>designs</span><span><b className="block text-lg">{data.follower_count}</b>followers</span><span><b className="block text-lg">{data.following_count}</b>following</span></div></section><div className="mt-10 border-t border-black/[0.1] pt-5"><div className="flex items-center gap-2 text-sm font-semibold"><Grid2X2 size={17}/> Portfolio</div><div className="mt-5 grid grid-cols-2 gap-1 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6">{designs.map((design) => <article key={design.id} className="group relative aspect-square overflow-hidden bg-white shadow-sm"><img src={design.asset_url} alt={design.title || "Portfolio design"} className="h-full w-full object-cover transition duration-300 group-hover:scale-105"/><span className="absolute inset-x-0 bottom-0 bg-black/55 p-3 text-sm font-semibold text-white opacity-0 transition group-hover:opacity-100">{design.title || "Untitled"}</span></article>)}</div>{!designs.length ? <p className="py-12 text-center text-sm text-black/50">{isOwner ? "Publish a Studio variant to start your portfolio." : "No public work yet."}</p> : null}</div>{offerings.length ? <section className="mt-12"><div className="flex items-center gap-2 text-sm font-semibold"><Package size={17}/> Services & offerings</div><div className="mt-4 grid gap-3 sm:grid-cols-2">{offerings.map((offering) => <article key={offering.id} className="rounded-card border border-black/[0.1] bg-white p-5 shadow-sm"><h2 className="font-semibold">{offering.title}</h2><p className="mt-2 text-sm text-black/55">{offering.description}</p><p className="mt-4 text-xs uppercase text-cyan">{offering.fulfillment_type}</p></article>)}</div></section> : null}{profile.provider_portfolio.length ? <section className="mt-12"><div className="flex items-center gap-2 text-sm font-semibold"><LinkIcon size={17}/> Elsewhere</div><div className="mt-4 flex flex-wrap gap-2">{profile.provider_portfolio.map((url) => <a key={url} href={url} target="_blank" rel="noreferrer" className="rounded-full border border-black/[0.12] bg-white px-4 py-2 text-sm text-black/60 hover:border-cyan hover:text-cyan">Portfolio link</a>)}</div></section> : null}</main>;
}
