"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { RefreshCw } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { fetchCategories, type ApiCategory } from "@/lib/catalog";

type VariantCard = {
  design_id: string;
  title: string;
  rationale: string;
  asset_url: string;
};

type JobStatus = "idle" | "running" | "complete" | "failed";

export default function StudioPage() {
  return (
    <Suspense fallback={null}>
      <StudioPageInner />
    </Suspense>
  );
}

function StudioPageInner() {
  const searchParams = useSearchParams();
  const sourceDesignId = searchParams.get("source");
  const sourcePrompt = searchParams.get("prompt") || "";

  const { user, token } = useAuth();
  const [categories, setCategories] = useState<ApiCategory[]>([]);
  const [categorySlug, setCategorySlug] = useState("branding");
  const [prompt, setPrompt] = useState(sourcePrompt);
  const [variants, setVariants] = useState<VariantCard[]>([]);
  const [status, setStatus] = useState<JobStatus>("idle");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const coreApiUrl = process.env.NEXT_PUBLIC_CORE_API_URL || "/core-api";
    fetchCategories(coreApiUrl)
      .then((apiCategories) => {
        if (apiCategories.length) setCategories(apiCategories);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (sourcePrompt) setPrompt(sourcePrompt);
  }, [sourcePrompt]);

  async function generate() {
    if (!token) {
      setError("Sign in first — remixing uses credits from your account.");
      return;
    }
    if (!prompt.trim()) {
      setError("Describe the design you want.");
      return;
    }
    setStatus("running");
    setError(null);
    setVariants([]);

    try {
      const coreApiUrl = process.env.NEXT_PUBLIC_CORE_API_URL || "/core-api";
      const res = await fetch(`${coreApiUrl}/ai/jobs`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          category_slug: categorySlug,
          prompt: prompt.trim(),
          source_design_id: sourceDesignId
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Generation failed");
      setVariants(data.variants || []);
      setStatus("complete");
    } catch (err: any) {
      setStatus("failed");
      setError(err?.message || "Generation failed");
    }
  }

  return (
    <main className="mx-auto max-w-7xl px-4 py-10">
      <div className="grid gap-8 lg:grid-cols-[380px_1fr]">
        <section>
          <p className="text-sm font-semibold uppercase text-cyan">Design Studio</p>
          <h1 className="mt-2 text-4xl font-black">Remix any design into yours.</h1>
          {!user ? (
            <p className="mt-4 rounded-card border border-magenta/40 bg-magenta/10 px-4 py-3 text-sm text-white/80">
              Sign in to remix — every account starts with free credits.
            </p>
          ) : null}
          <div className="glass-panel mt-6 grid gap-3 rounded-panel p-4">
            <select
              value={categorySlug}
              onChange={(e) => setCategorySlug(e.target.value)}
              className="rounded-card border border-white/10 bg-charcoal px-3 py-3 outline-none focus:border-cyan"
            >
              {categories.length
                ? categories.map((c) => (
                    <option key={c.id} value={c.slug}>{c.name}</option>
                  ))
                : <option value="branding">Branding & Logos</option>}
            </select>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Describe the design you want — style, mood, use case"
              rows={4}
              className="rounded-card border border-white/10 bg-white/8 px-3 py-3 outline-none focus:border-cyan"
            />
            <button
              onClick={generate}
              disabled={status === "running"}
              className="inline-flex items-center justify-center gap-2 rounded-full bg-cyan px-5 py-3 font-semibold text-charcoal disabled:opacity-60"
            >
              <RefreshCw size={17} className={status === "running" ? "animate-spin" : ""} />
              {status === "running" ? "Crafting variants" : "Generate variants"}
            </button>
            {status === "running" ? (
              <p className="text-xs text-muted">Crafting your variants. This takes a few seconds.</p>
            ) : null}
            {error ? <p className="text-sm text-magenta">{error}</p> : null}
          </div>
        </section>
        <section className="grid gap-4 md:grid-cols-3">
          {variants.map((variant) => (
            <article key={variant.design_id} className="rounded-card border border-white/10 bg-white/6 p-4">
              {variant.asset_url.startsWith("data:image/svg") ? (
                <div
                  className="overflow-hidden rounded-card bg-charcoal"
                  dangerouslySetInnerHTML={{ __html: decodeSvgDataUri(variant.asset_url) }}
                />
              ) : (
                <img src={variant.asset_url} alt={variant.title} className="w-full rounded-card" />
              )}
              <h2 className="mt-4 font-semibold">{variant.title}</h2>
              <p className="mt-2 text-sm text-muted">{variant.rationale}</p>
            </article>
          ))}
          {!variants.length && status !== "running" ? (
            <div className="col-span-full grid place-items-center rounded-card border border-white/10 bg-white/6 p-10 text-sm text-muted">
              Your variants will show up here.
            </div>
          ) : null}
        </section>
      </div>
    </main>
  );
}

function decodeSvgDataUri(uri: string): string {
  const prefix = "data:image/svg+xml;utf8,";
  return uri.startsWith(prefix) ? decodeURIComponent(uri.slice(prefix.length)) : "";
}
