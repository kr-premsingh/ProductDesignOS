"use client";

import { useEffect, useState } from "react";
import { Check, ShieldCheck } from "lucide-react";
import { useAuth } from "@/lib/auth";

type Provider = { id: string; username: string; email: string; provider_categories: string[]; provider_capabilities: string[]; provider_portfolio: string[] };

export default function AdminPage() {
  const { token, user } = useAuth();
  const [providers, setProviders] = useState<Provider[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token || !user?.roles?.includes("admin")) return;
    const coreApiUrl = process.env.NEXT_PUBLIC_CORE_API_URL || "/core-api";
    fetch(`${coreApiUrl}/admin/providers`, { headers: { Authorization: `Bearer ${token}` } })
      .then(async (res) => { if (!res.ok) throw new Error((await res.json()).error); return res.json(); })
      .then(setProviders).catch((err) => setError(err.message));
  }, [token, user]);

  async function approve(id: string) {
    if (!token) return;
    const coreApiUrl = process.env.NEXT_PUBLIC_CORE_API_URL || "/core-api";
    const res = await fetch(`${coreApiUrl}/admin/providers/${id}/approve`, { method: "POST", headers: { Authorization: `Bearer ${token}` } });
    if (res.ok) setProviders((items) => items.filter((provider) => provider.id !== id));
  }

  if (!user?.roles?.includes("admin")) return <main className="mx-auto max-w-4xl px-4 py-20 text-center text-muted">Admin access required.</main>;
  return <main className="mx-auto max-w-5xl px-4 py-12"><div className="flex items-center gap-3"><span className="grid h-10 w-10 place-items-center rounded-full bg-cyan/15 text-cyan"><ShieldCheck size={20}/></span><div><p className="text-sm font-semibold uppercase text-cyan">Dooniq operations</p><h1 className="text-3xl font-black">Provider review</h1></div></div><div className="mt-10 grid gap-4">{providers.map((provider) => <article key={provider.id} className="rounded-card border border-black/[0.1] bg-white p-5 shadow-sm"><div className="flex flex-wrap items-start justify-between gap-4"><div><h2 className="font-bold">@{provider.username}</h2><p className="mt-1 text-sm text-black/55">{provider.email}</p><p className="mt-4 text-sm"><b>Categories:</b> {provider.provider_categories.join(", ")}</p><p className="mt-1 text-sm"><b>Capabilities:</b> {provider.provider_capabilities.join(", ")}</p><div className="mt-3 flex flex-wrap gap-2">{provider.provider_portfolio.map((url) => <a key={url} href={url} target="_blank" rel="noreferrer" className="rounded-full bg-black/[0.05] px-3 py-1 text-xs text-black/65">Portfolio</a>)}</div></div><button onClick={() => approve(provider.id)} className="inline-flex items-center gap-2 rounded-full bg-cyan px-4 py-2 text-sm font-semibold text-charcoal"><Check size={16}/> Approve</button></div></article>)}{!providers.length && !error ? <p className="py-16 text-center text-sm text-black/50">No provider applications waiting for review.</p> : null}{error ? <p className="text-magenta">{error}</p> : null}</div></main>;
}