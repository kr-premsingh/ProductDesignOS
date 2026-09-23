"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  Bookmark,
  Check,
  Grid2X2,
  Link as LinkIcon,
  Package,
  Pencil,
  UserPlus,
  Wand2
} from "lucide-react";
import { useAuth } from "@/lib/auth";
import { fetchCategories, fetchDesigns, toTile, type Tile } from "@/lib/catalog";
import { inspireTiles as fallbackTiles } from "@/lib/mock-data";
import { FeedCard } from "@/components/feed-card";

type ProfileData = {
  profile: {
    username: string;
    display_name?: string;
    bio?: string;
    avatar_url?: string;
    provider_status?: string;
    provider_categories: string[];
    provider_capabilities: string[];
    provider_portfolio: string[];
  };
  designs: { id: string; title?: string; asset_url: string; tags: string[] }[];
  offerings: { id: string; title: string; description?: string; fulfillment_type: string }[];
  follower_count: number;
  following_count: number;
};

type Tab = "work" | "saved" | "services";

function demoProfile(username: string): ProfileData {
  return {
    profile: {
      username,
      display_name: "Dooniq Studio",
      bio: "The official Dooniq showcase — remixable directions across posters, merch, socials, and interiors.",
      avatar_url: "",
      provider_status: "approved",
      provider_categories: ["Posters", "Merch", "Social"],
      provider_capabilities: ["AI remixes", "Print-ready exports", "Brand systems"],
      provider_portfolio: []
    },
    designs: fallbackTiles.slice(0, 12).map((tile) => ({ id: tile.id, title: tile.title, asset_url: tile.image, tags: tile.tags })),
    offerings: [
      { id: "demo-offer-1", title: "Custom poster series", description: "A three-poster set built from your brief, delivered print-ready.", fulfillment_type: "physical" },
      { id: "demo-offer-2", title: "Social launch kit", description: "Ten on-brand social templates remixed from your identity.", fulfillment_type: "digital" }
    ],
    follower_count: 128,
    following_count: 34
  };
}

export default function ProfilePage({ params }: { params: { username: string } }) {
  const { user, token } = useAuth();
  const [data, setData] = useState<ProfileData | null>(null);
  const [error, setError] = useState(false);
  const [editing, setEditing] = useState(false);
  const [tab, setTab] = useState<Tab>("work");
  const [following, setFollowing] = useState(false);
  const [followBusy, setFollowBusy] = useState(false);
  const [savedTiles, setSavedTiles] = useState<Tile[]>([]);
  const isOwner = user?.username === params.username;

  useEffect(() => {
    const controller = new AbortController();
    const coreApiUrl = process.env.NEXT_PUBLIC_CORE_API_URL || "/core-api";
    fetch(`${coreApiUrl}/profiles/${params.username}`, { signal: controller.signal })
      .then((res) => {
        if (!res.ok) throw new Error(String(res.status));
        return res.json();
      })
      .then(setData)
      .catch((err) => {
        if (err?.name === "AbortError") return;
        if (params.username === "demo") setData(demoProfile("demo"));
        else setError(true);
      });
    return () => controller.abort();
  }, [params.username]);

  // Owner's saved collection — localStorage ids resolved against the feed.
  useEffect(() => {
    if (!isOwner) return;
    let savedIds: string[] = [];
    try {
      savedIds = JSON.parse(localStorage.getItem("saved") || "[]");
    } catch {}
    if (!savedIds.length) {
      setSavedTiles([]);
      return;
    }
    const local = fallbackTiles.filter((t) => savedIds.includes(t.id));
    setSavedTiles(local);
    const coreApiUrl = process.env.NEXT_PUBLIC_CORE_API_URL || "/core-api";
    Promise.all([fetchCategories(coreApiUrl), fetchDesigns(coreApiUrl, { limit: 100 })])
      .then(([apiCategories, apiDesigns]) => {
        const apiTiles = apiDesigns.map((d) => toTile(d, apiCategories)).filter((t) => savedIds.includes(t.id));
        if (apiTiles.length) {
          setSavedTiles((current) => {
            const seen = new Set(apiTiles.map((t) => t.id));
            return [...apiTiles, ...current.filter((t) => !seen.has(t.id))];
          });
        }
      })
      .catch(() => {});
  }, [isOwner]);

  const followerCount = useMemo(
    () => (data ? data.follower_count + (following ? 1 : 0) : 0),
    [data, following]
  );

  async function toggleFollow() {
    if (!token || !data || followBusy) return;
    setFollowBusy(true);
    try {
      const coreApiUrl = process.env.NEXT_PUBLIC_CORE_API_URL || "/core-api";
      const res = await fetch(`${coreApiUrl}/users/${data.profile.username}/follow`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const body = await res.json();
        setFollowing(Boolean(body?.active ?? !following));
      }
    } catch {
      setFollowing((value) => !value);
    } finally {
      setFollowBusy(false);
    }
  }

  if (error) {
    return (
      <main className="mx-auto max-w-5xl px-4 py-24 text-center text-[#1d1d1f]">
        <h1 className="text-2xl font-black tracking-tight">This portfolio isn't available.</h1>
        <p className="mt-3 text-sm text-black/50">The profile may not exist yet, or the connection was interrupted.</p>
        <Link href="/explore" className="mt-6 inline-flex items-center gap-2 rounded-full bg-[#1d1d1f] px-6 py-3 text-sm font-bold text-white">
          Back to Explore <ArrowRight size={15} />
        </Link>
      </main>
    );
  }

  if (!data) {
    return (
      <main className="mx-auto max-w-5xl px-4 py-24 text-center text-sm text-black/40">Loading portfolio…</main>
    );
  }

  const { profile, designs, offerings } = data;
  const isProvider = Boolean(profile.provider_status && profile.provider_status !== "none");
  const hasServices = isProvider || offerings.length > 0 || profile.provider_portfolio.length > 0;

  const tabs: { id: Tab; label: string; icon: typeof Grid2X2; count?: number }[] = [
    { id: "work", label: "Work", icon: Grid2X2, count: designs.length },
    ...(isOwner ? [{ id: "saved" as Tab, label: "Saved", icon: Bookmark, count: savedTiles.length }] : []),
    ...(hasServices ? [{ id: "services" as Tab, label: "Services", icon: Package, count: offerings.length }] : [])
  ];

  return (
    <main className="text-[#1d1d1f]">
      {/* Header */}
      <section className="border-b border-black/[0.07] bg-white">
        <div className="mx-auto max-w-6xl px-4 py-10 sm:py-14">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
            <div className="grid h-24 w-24 shrink-0 place-items-center overflow-hidden rounded-full border border-black/[0.08] bg-[#f5f5f7] text-3xl font-black text-[#1d1d1f] shadow-sm sm:h-28 sm:w-28">
              {profile.avatar_url ? (
                <img src={profile.avatar_url} alt="" className="h-full w-full object-cover" />
              ) : (
                profile.username.slice(0, 1).toUpperCase()
              )}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-3">
                <h1 className="text-2xl font-black tracking-tight sm:text-3xl">{profile.display_name || `@${profile.username}`}</h1>
                {isProvider ? (
                  <span className="rounded-full bg-cyan px-3 py-1 text-[11px] font-black uppercase tracking-wider text-charcoal">Provider</span>
                ) : null}
              </div>
              <p className="mt-1 text-sm text-black/45">@{profile.username}</p>
              <p className="mt-3 max-w-xl text-sm leading-6 text-black/60">{profile.bio || "Creating things that feel personal."}</p>
              {profile.provider_categories.length ? (
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {profile.provider_categories.map((category) => (
                    <span key={category} className="rounded-full bg-black/[0.05] px-2.5 py-1 text-[11px] font-semibold text-black/55">{category}</span>
                  ))}
                </div>
              ) : null}
              <div className="mt-4 flex gap-6 text-sm text-black/55">
                <span><b className="mr-1 text-base font-black text-[#1d1d1f]">{designs.length}</b>designs</span>
                <span><b className="mr-1 text-base font-black text-[#1d1d1f]">{followerCount}</b>followers</span>
                <span><b className="mr-1 text-base font-black text-[#1d1d1f]">{data.following_count}</b>following</span>
              </div>
            </div>
            <div className="flex shrink-0 gap-2">
              {isOwner ? (
                <>
                  <button
                    onClick={() => setEditing((value) => !value)}
                    className="inline-flex items-center gap-1.5 rounded-full border border-black/[0.12] bg-white px-4 py-2.5 text-sm font-semibold text-black/70 shadow-sm transition hover:border-black"
                  >
                    <Pencil size={14} /> Edit profile
                  </button>
                  <Link
                    href="/studio"
                    className="inline-flex items-center gap-1.5 rounded-full bg-[#1d1d1f] px-4 py-2.5 text-sm font-bold text-white transition hover:bg-cyan hover:text-charcoal"
                  >
                    <Wand2 size={14} /> New design
                  </Link>
                </>
              ) : (
                <>
                  <button
                    onClick={toggleFollow}
                    disabled={followBusy}
                    className={`inline-flex items-center gap-1.5 rounded-full px-5 py-2.5 text-sm font-bold transition disabled:opacity-60 ${following ? "border border-black/[0.15] bg-white text-[#1d1d1f]" : "bg-[#1d1d1f] text-white hover:bg-cyan hover:text-charcoal"}`}
                  >
                    {following ? <><Check size={14} /> Following</> : <><UserPlus size={14} /> Follow</>}
                  </button>
                  {offerings.length ? (
                    <Link href="/marketplace" className="inline-flex items-center gap-1.5 rounded-full border border-black/[0.12] bg-white px-4 py-2.5 text-sm font-semibold text-black/70 shadow-sm transition hover:border-black">
                      <Package size={14} /> Hire
                    </Link>
                  ) : null}
                </>
              )}
            </div>
          </div>

          {editing && isOwner ? (
            <EditProfileForm
              profile={profile}
              token={token}
              onSaved={(update) => {
                setData((current) => (current ? { ...current, profile: { ...current.profile, ...update } } : current));
                setEditing(false);
              }}
              onCancel={() => setEditing(false)}
            />
          ) : null}
        </div>

        {/* Tabs */}
        <div className="mx-auto max-w-6xl px-4">
          <div className="flex gap-1 overflow-x-auto">
            {tabs.map(({ id, label, icon: Icon, count }) => (
              <button
                key={id}
                onClick={() => setTab(id)}
                className={`flex shrink-0 items-center gap-2 border-b-2 px-4 py-3 text-sm font-bold transition ${tab === id ? "border-[#1d1d1f] text-[#1d1d1f]" : "border-transparent text-black/45 hover:text-black"}`}
              >
                <Icon size={15} /> {label}
                {count != null ? <span className="rounded-full bg-black/[0.05] px-2 py-0.5 text-[11px] font-semibold text-black/45">{count}</span> : null}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Content */}
      <section className="mx-auto max-w-6xl px-4 py-8 sm:py-10">
        {tab === "work" ? (
          designs.length ? (
            <div className="columns-2 gap-3 sm:columns-3 lg:columns-4">
              {designs.map((design) => (
                <Link
                  key={design.id}
                  href={`/design/${encodeURIComponent(design.id)}`}
                  className="group relative mb-3 block break-inside-avoid overflow-hidden rounded-2xl bg-white shadow-sm"
                >
                  <img
                    src={design.asset_url}
                    alt={design.title || "Portfolio design"}
                    className="w-full object-cover transition duration-300 group-hover:scale-[1.03]"
                    onError={(event) => {
                      const img = event.currentTarget;
                      if (img.dataset.fallback) return;
                      img.dataset.fallback = "1";
                      img.src = `https://picsum.photos/seed/${encodeURIComponent(design.id)}/800/1000`;
                    }}
                  />
                  <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-3 pt-8 text-sm font-bold text-white opacity-0 transition group-hover:opacity-100">
                    {design.title || "Untitled"}
                  </span>
                </Link>
              ))}
            </div>
          ) : (
            <EmptyState
              title={isOwner ? "Your portfolio is waiting." : "No public work yet."}
              body={isOwner ? "Generate directions in Studio and publish the ones you love — they show up here." : "Check back soon — this creator hasn't published anything yet."}
              cta={isOwner ? { label: "Open Studio", href: "/studio" } : undefined}
            />
          )
        ) : null}

        {tab === "saved" && isOwner ? (
          savedTiles.length ? (
            <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">
              {savedTiles.map((tile) => <FeedCard key={tile.id} tile={tile} />)}
            </div>
          ) : (
            <EmptyState
              title="Nothing saved yet."
              body="Tap the bookmark on any design in Explore and it'll land here for later."
              cta={{ label: "Browse Explore", href: "/explore" }}
            />
          )
        ) : null}

        {tab === "services" && hasServices ? (
          <div className="space-y-10">
            {offerings.length ? (
              <div>
                <h2 className="text-lg font-black tracking-tight">Services & offerings</h2>
                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  {offerings.map((offering) => (
                    <article key={offering.id} className="rounded-3xl border border-black/[0.07] bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
                      <div className="flex items-start justify-between gap-3">
                        <h3 className="font-black tracking-tight">{offering.title}</h3>
                        <span className="shrink-0 rounded-full bg-black/[0.05] px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-black/55">{offering.fulfillment_type}</span>
                      </div>
                      <p className="mt-2 text-sm leading-6 text-black/55">{offering.description || "Custom work shaped around your brief."}</p>
                      <Link href="/marketplace" className="mt-4 inline-flex items-center gap-1.5 text-xs font-bold text-[#1d1d1f] transition hover:text-cyan">
                        Request a quote <ArrowRight size={13} />
                      </Link>
                    </article>
                  ))}
                </div>
              </div>
            ) : null}
            {profile.provider_capabilities.length ? (
              <div>
                <h2 className="text-lg font-black tracking-tight">Capabilities</h2>
                <div className="mt-3 flex flex-wrap gap-2">
                  {profile.provider_capabilities.map((capability) => (
                    <span key={capability} className="rounded-full border border-black/[0.1] bg-white px-3.5 py-1.5 text-xs font-semibold text-black/60 shadow-sm">{capability}</span>
                  ))}
                </div>
              </div>
            ) : null}
            {profile.provider_portfolio.length ? (
              <div>
                <h2 className="flex items-center gap-2 text-lg font-black tracking-tight"><LinkIcon size={16} /> Elsewhere</h2>
                <div className="mt-3 flex flex-wrap gap-2">
                  {profile.provider_portfolio.map((url) => (
                    <a
                      key={url}
                      href={url}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 rounded-full border border-black/[0.12] bg-white px-4 py-2 text-sm font-semibold text-black/60 shadow-sm transition hover:border-cyan hover:text-cyan"
                    >
                      {url.replace(/^https?:\/\//, "").replace(/\/$/, "")} <ArrowRight size={13} />
                    </a>
                  ))}
                </div>
              </div>
            ) : null}
          </div>
        ) : null}
      </section>
    </main>
  );
}

function EmptyState({ title, body, cta }: { title: string; body: string; cta?: { label: string; href: string } }) {
  return (
    <div className="grid min-h-64 place-items-center rounded-[32px] border border-dashed border-black/[0.14] bg-white/60 p-10 text-center">
      <div className="max-w-sm">
        <span className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-[#1d1d1f] text-cyan"><Grid2X2 size={22} /></span>
        <h2 className="mt-5 text-xl font-black tracking-tight text-[#1d1d1f]">{title}</h2>
        <p className="mt-2 text-sm leading-6 text-black/50">{body}</p>
        {cta ? (
          <Link href={cta.href} className="mt-5 inline-flex items-center gap-2 rounded-full bg-[#1d1d1f] px-5 py-2.5 text-xs font-bold text-white transition hover:bg-cyan hover:text-charcoal">
            {cta.label} <ArrowRight size={13} />
          </Link>
        ) : null}
      </div>
    </div>
  );
}

function EditProfileForm({
  profile,
  token,
  onSaved,
  onCancel
}: {
  profile: ProfileData["profile"];
  token: string | null;
  onSaved: (update: Partial<ProfileData["profile"]>) => void;
  onCancel: () => void;
}) {
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function saveProfile(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!token) return;
    setSaving(true);
    setError(null);
    const form = new FormData(event.currentTarget);
    try {
      const coreApiUrl = process.env.NEXT_PUBLIC_CORE_API_URL || "/core-api";
      const response = await fetch(`${coreApiUrl}/profiles/me`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          display_name: form.get("display_name"),
          bio: form.get("bio"),
          avatar_url: form.get("avatar_url")
        })
      });
      if (!response.ok) throw new Error("Could not save profile.");
      onSaved(await response.json());
    } catch (err: any) {
      setError(err?.message || "Could not save profile.");
      setSaving(false);
    }
  }

  return (
    <form onSubmit={saveProfile} className="mt-7 grid gap-3 rounded-3xl border border-black/[0.08] bg-[#f5f5f7] p-5 sm:grid-cols-2 sm:p-6">
      <input
        name="display_name"
        defaultValue={profile.display_name || ""}
        placeholder="Display name"
        className="rounded-2xl border border-black/[0.12] bg-white px-4 py-3 text-sm outline-none transition focus:border-cyan"
      />
      <input
        name="avatar_url"
        defaultValue={profile.avatar_url || ""}
        placeholder="Avatar image URL"
        className="rounded-2xl border border-black/[0.12] bg-white px-4 py-3 text-sm outline-none transition focus:border-cyan"
      />
      <textarea
        name="bio"
        defaultValue={profile.bio || ""}
        placeholder="A short bio"
        className="min-h-24 resize-none rounded-2xl border border-black/[0.12] bg-white px-4 py-3 text-sm outline-none transition focus:border-cyan sm:col-span-2"
      />
      {error ? <p className="text-sm font-semibold text-magenta sm:col-span-2">{error}</p> : null}
      <div className="flex gap-2 sm:col-span-2">
        <button disabled={saving} className="rounded-full bg-[#1d1d1f] px-5 py-2.5 text-sm font-bold text-white transition hover:bg-cyan hover:text-charcoal disabled:opacity-50">
          {saving ? "Saving…" : "Save profile"}
        </button>
        <button type="button" onClick={onCancel} className="rounded-full px-5 py-2.5 text-sm font-semibold text-black/60 transition hover:bg-black/[0.05]">
          Cancel
        </button>
      </div>
    </form>
  );
}
