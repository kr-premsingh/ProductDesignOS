"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  ArrowRight,
  Bookmark,
  Check,
  Copy,
  Download,
  Globe,
  History,
  ImagePlus,
  Images,
  Loader2,
  Lock,
  RefreshCw,
  Sparkles,
  Trash2,
  Upload,
  Wand2,
  X
} from "lucide-react";
import { useAuth } from "@/lib/auth";
import AuthModal from "@/components/auth-modal";
import { fetchCategories, fetchDesigns, toTile, type ApiCategory, type Tile } from "@/lib/catalog";
import { inspireTiles as fallbackTiles } from "@/lib/mock-data";

type VariantCard = {
  design_id: string;
  title: string;
  rationale: string;
  asset_url: string;
};

type JobStatus = "idle" | "running" | "complete" | "failed";

type Session = {
  id: string;
  prompt: string;
  categorySlug: string;
  format: string;
  variants: VariantCard[];
  createdAt: number;
};

const FORMATS = [
  { id: "poster", label: "Poster", hint: "4:5 print" },
  { id: "social", label: "Social post", hint: "1:1 feed" },
  { id: "thumbnail", label: "Thumbnail", hint: "16:9 video" },
  { id: "merch", label: "Merch graphic", hint: "tees & hoodies" },
  { id: "wall", label: "Wall art", hint: "framed print" },
  { id: "logo", label: "Logo / brand", hint: "identity mark" }
];

const STYLES = ["Minimal", "Bold", "Retro", "Editorial", "Neon", "Organic", "Geometric", "Handmade"];

const HISTORY_KEY = "dooniq_studio_history";
const MAX_UPLOAD_BYTES = 5 * 1024 * 1024;

type SourceTab = "saved" | "explore" | "upload";

function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error("Could not read that file"));
    reader.readAsDataURL(file);
  });
}

function loadHistory(): Session[] {
  try {
    return JSON.parse(localStorage.getItem(HISTORY_KEY) || "[]");
  } catch {
    return [];
  }
}

function saveHistory(sessions: Session[]) {
  try {
    localStorage.setItem(HISTORY_KEY, JSON.stringify(sessions.slice(0, 12)));
  } catch {}
}

function decodeSvgDataUri(uri: string): string {
  const prefix = "data:image/svg+xml;utf8,";
  return uri.startsWith(prefix) ? decodeURIComponent(uri.slice(prefix.length)) : "";
}

function VariantArt({ variant }: { variant: VariantCard }) {
  if (variant.asset_url.startsWith("data:image/svg")) {
    return (
      <div
        className="grid aspect-square w-full place-items-center overflow-hidden bg-[#0b0f14] [&_svg]:h-full [&_svg]:w-full"
        dangerouslySetInnerHTML={{ __html: decodeSvgDataUri(variant.asset_url) }}
      />
    );
  }
  return <img src={variant.asset_url} alt={variant.title} className="aspect-square w-full object-cover" />;
}

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
  const [format, setFormat] = useState("poster");
  const [styles, setStyles] = useState<string[]>([]);
  const [variants, setVariants] = useState<VariantCard[]>([]);
  const [status, setStatus] = useState<JobStatus>("idle");
  const [error, setError] = useState<string | null>(null);
  const [history, setHistory] = useState<Session[]>([]);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [authOpen, setAuthOpen] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [sourceTile, setSourceTile] = useState<Tile | null>(null);
  const [sourceImage, setSourceImage] = useState<string | null>(null);
  const [sourcePickerOpen, setSourcePickerOpen] = useState(false);
  const [sourceTab, setSourceTab] = useState<SourceTab>("saved");
  const [pickerTiles, setPickerTiles] = useState<Tile[]>([]);
  const [pickerError, setPickerError] = useState<string | null>(null);
  const resultsRef = useRef<HTMLDivElement>(null);
  const uploadInputRef = useRef<HTMLInputElement>(null);

  const hasSource = Boolean(sourceTile || sourceImage);

  useEffect(() => {
    setHistory(loadHistory());
  }, []);

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

  useEffect(() => {
    if (!sourceDesignId) return;
    const fallback = fallbackTiles.find((t) => t.id === sourceDesignId);
    if (fallback) {
      setSourceTile(fallback);
      setSourceImage(fallback.image);
      return;
    }
    const coreApiUrl = process.env.NEXT_PUBLIC_CORE_API_URL || "/core-api";
    Promise.all([fetchCategories(coreApiUrl), fetchDesigns(coreApiUrl, { limit: 100 })])
      .then(([apiCategories, apiDesigns]) => {
        const match = apiDesigns.map((d) => toTile(d, apiCategories)).find((t) => t.id === sourceDesignId);
        if (match) {
          setSourceTile(match);
          setSourceImage(match.image);
        }
      })
      .catch(() => {});
  }, [sourceDesignId]);

  useEffect(() => {
    if (!sourcePickerOpen) return;
    const coreApiUrl = process.env.NEXT_PUBLIC_CORE_API_URL || "/core-api";
    fetchDesigns(coreApiUrl, { limit: 60 })
      .then(async (apiDesigns) => {
        if (!apiDesigns.length) {
          setPickerTiles(fallbackTiles);
          return;
        }
        const apiCategories = await fetchCategories(coreApiUrl).catch(() => []);
        setPickerTiles(apiDesigns.map((d) => toTile(d, apiCategories)));
      })
      .catch(() => setPickerTiles(fallbackTiles));
  }, [sourcePickerOpen]);

  function pickSourceTile(tile: Tile) {
    setSourceTile(tile);
    setSourceImage(tile.image);
    setSourcePickerOpen(false);
    setPickerError(null);
    if (!prompt.trim() && tile.remixPrompt) setPrompt(tile.remixPrompt);
  }

  function clearSource() {
    setSourceTile(null);
    setSourceImage(null);
    if (uploadInputRef.current) uploadInputRef.current.value = "";
  }

  async function handleUpload(file: File | undefined) {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setPickerError("That file isn't an image. Try a PNG or JPG.");
      return;
    }
    if (file.size > MAX_UPLOAD_BYTES) {
      setPickerError("Images up to 5 MB work best.");
      return;
    }
    try {
      const dataUrl = await readFileAsDataUrl(file);
      setSourceTile(null);
      setSourceImage(dataUrl);
      setSourcePickerOpen(false);
      setPickerError(null);
    } catch (err: any) {
      setPickerError(err?.message || "Could not read that file");
    }
  }

  const savedPickerTiles = (() => {
    let savedIds: string[] = [];
    try {
      savedIds = JSON.parse(localStorage.getItem("saved") || "[]");
    } catch {}
    const saved = pickerTiles.filter((t) => savedIds.includes(t.id));
    return saved.length ? saved : pickerTiles.slice(0, 12);
  })();

  function toggleStyle(style: string) {
    setStyles((current) => (current.includes(style) ? current.filter((s) => s !== style) : [...current, style]));
  }

  function surpriseMe() {
    const starters = [
      "Sun-faded travel poster for a coastal town, grainy risograph texture",
      "Brutalist event flyer with oversized type and one accent color",
      "Botanical line-art print, soft paper background, gallery feel",
      "Y2K chrome sticker pack energy, playful but premium",
      "Swiss-grid conference identity, confident monochrome with cyan accent",
      "Hand-drawn cafe menu board, warm ink on cream paper"
    ];
    const pick = starters[Math.floor(Math.random() * starters.length)];
    setPrompt(pick);
  }

  function composedPrompt() {
    const parts = [prompt.trim()];
    if (sourceTile) parts.push(`Inspired by: "${sourceTile.title}" (${sourceTile.category})`);
    else if (sourceImage) parts.push("Inspired by an uploaded reference image");
    if (styles.length) parts.push(`Style: ${styles.join(", ").toLowerCase()}`);
    const fmt = FORMATS.find((f) => f.id === format);
    if (fmt) parts.push(`Format: ${fmt.label} (${fmt.hint})`);
    return parts.filter(Boolean).join(". ");
  }

  async function generate() {
    if (!token) {
      setAuthOpen(true);
      return;
    }
    if (!prompt.trim() && !hasSource) {
      setError("Describe the design you want, or pick a source design to remix.");
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
          prompt: composedPrompt() || "A fresh take on the source design",
          source_design_id: sourceTile?.id || sourceDesignId
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Generation failed");
      const nextVariants: VariantCard[] = data.variants || [];
      setVariants(nextVariants);
      setStatus("complete");
      const session: Session = {
        id: `${Date.now()}`,
        prompt: prompt.trim(),
        categorySlug,
        format,
        variants: nextVariants,
        createdAt: Date.now()
      };
      setHistory((current) => {
        const next = [session, ...current].slice(0, 12);
        saveHistory(next);
        return next;
      });
      setTimeout(() => resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 50);
    } catch (err: any) {
      setStatus("failed");
      setError(err?.message || "Generation failed");
    }
  }

  function restoreSession(session: Session) {
    setPrompt(session.prompt);
    setCategorySlug(session.categorySlug);
    setFormat(session.format);
    setVariants(session.variants);
    setStatus("complete");
    setHistoryOpen(false);
  }

  function deleteSession(id: string) {
    setHistory((current) => {
      const next = current.filter((s) => s.id !== id);
      saveHistory(next);
      return next;
    });
  }

  async function copyPrompt(text: string, id: string) {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 1500);
    } catch {}
  }

  function downloadVariant(variant: VariantCard, index: number) {
    const svg = variant.asset_url.startsWith("data:image/svg")
      ? decodeSvgDataUri(variant.asset_url)
      : null;
    if (svg) {
      const blob = new Blob([svg], { type: "image/svg+xml" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `dooniq-${variant.title.toLowerCase().replace(/[^a-z0-9]+/g, "-") || "variant"}-${index + 1}.svg`;
      a.click();
      URL.revokeObjectURL(url);
    } else {
      window.open(variant.asset_url, "_blank");
    }
  }

  return (
    <main className="mx-auto max-w-7xl px-3 py-6 text-[#1d1d1f] sm:px-5 sm:py-10 lg:px-8">
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-black/40">Dooniq Studio</p>
          <h1 className="mt-1.5 text-3xl font-black tracking-tight sm:text-5xl">Describe it. Direct it. Ship it.</h1>
          <p className="mt-2 max-w-lg text-sm leading-6 text-black/50">
            Turn a feeling into three distinct, remixable design directions. 1 credit per generation.
          </p>
        </div>
        <button
          onClick={() => setHistoryOpen((open) => !open)}
          className="inline-flex items-center gap-2 rounded-full border border-black/[0.12] bg-white px-4 py-2.5 text-sm font-semibold shadow-sm transition hover:border-black"
        >
          <History size={15} /> History {history.length ? `(${history.length})` : ""}
        </button>
      </div>

      <div className="grid gap-6 lg:grid-cols-[400px_1fr] lg:gap-10">
        {/* Control panel */}
        <section className="space-y-5 lg:sticky lg:top-24 lg:self-start">
          {!user ? (
            <div className="flex items-center justify-between gap-3 rounded-3xl border border-magenta/30 bg-magenta/[0.06] px-5 py-4">
              <p className="text-sm font-semibold text-[#1d1d1f]">Sign in to generate — new accounts get 50 free credits.</p>
              <button onClick={() => setAuthOpen(true)} className="shrink-0 rounded-full bg-[#1d1d1f] px-4 py-2 text-xs font-bold text-white">Sign in</button>
            </div>
          ) : null}

          {hasSource ? (
            <div className="flex items-center gap-3 rounded-3xl border border-black/[0.08] bg-white p-3 shadow-sm">
              {sourceImage ? (
                <img src={sourceImage} alt="" className="h-14 w-14 shrink-0 rounded-2xl object-cover" />
              ) : null}
              <div className="min-w-0">
                <p className="text-[10px] font-bold uppercase tracking-wider text-black/40">{sourceTile ? "Remixing" : "Reference image"}</p>
                <p className="truncate text-sm font-bold">{sourceTile ? sourceTile.title : "Uploaded image"}</p>
              </div>
              {sourceTile ? (
                <Link href={`/design/${encodeURIComponent(sourceTile.id)}`} className="ml-auto shrink-0 text-xs font-semibold text-black/50 hover:text-black">View</Link>
              ) : null}
              <button onClick={clearSource} aria-label="Remove source" className="shrink-0 rounded-full p-1.5 text-black/35 transition hover:bg-black/[0.05] hover:text-magenta">
                <X size={14} />
              </button>
            </div>
          ) : null}

          {/* Inspiration source picker */}
          <div className="rounded-3xl border border-black/[0.08] bg-white p-5 shadow-[0_1px_2px_rgba(0,0,0,0.04),0_12px_32px_rgba(0,0,0,0.05)] sm:p-6">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold uppercase tracking-[0.16em] text-black/40">Start from inspiration</label>
              {sourcePickerOpen ? (
                <button onClick={() => setSourcePickerOpen(false)} aria-label="Close picker" className="text-black/40 transition hover:text-black"><X size={15} /></button>
              ) : null}
            </div>
            {!sourcePickerOpen ? (
              <button
                onClick={() => setSourcePickerOpen(true)}
                className="mt-3 flex w-full items-center justify-center gap-2 rounded-2xl border border-dashed border-black/[0.18] bg-[#f5f5f7] px-4 py-4 text-sm font-semibold text-black/55 transition hover:border-cyan hover:text-cyan"
              >
                <ImagePlus size={17} /> {hasSource ? "Change source design" : "Pick a design or upload an image"}
              </button>
            ) : (
              <div className="mt-3">
                <div className="grid grid-cols-3 gap-1.5 rounded-2xl bg-black/[0.04] p-1.5">
                  {(["saved", "explore", "upload"] as SourceTab[]).map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setSourceTab(tab)}
                      className={`rounded-xl px-2 py-2 text-xs font-bold capitalize transition ${sourceTab === tab ? "bg-white text-[#1d1d1f] shadow-sm" : "text-black/50 hover:text-black"}`}
                    >
                      {tab === "saved" ? "Saved" : tab === "explore" ? "Explore" : "Upload"}
                    </button>
                  ))}
                </div>
                {pickerError ? <p className="mt-3 text-xs font-semibold text-magenta">{pickerError}</p> : null}
                {sourceTab === "upload" ? (
                  <div className="mt-3">
                    <input
                      ref={uploadInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => handleUpload(e.target.files?.[0])}
                    />
                    <button
                      onClick={() => uploadInputRef.current?.click()}
                      className="flex w-full flex-col items-center gap-2 rounded-2xl border border-dashed border-black/[0.18] bg-[#f5f5f7] px-4 py-8 text-sm font-semibold text-black/55 transition hover:border-cyan hover:text-cyan"
                    >
                      <Upload size={20} />
                      Upload a reference image
                      <span className="text-[11px] font-medium text-black/35">PNG or JPG, up to 5 MB</span>
                    </button>
                  </div>
                ) : (
                  <div className="mt-3 grid max-h-64 grid-cols-3 gap-2 overflow-y-auto pr-1">
                    {(sourceTab === "saved" ? savedPickerTiles : pickerTiles).map((tile) => (
                      <button
                        key={tile.id}
                        onClick={() => pickSourceTile(tile)}
                        className={`group relative overflow-hidden rounded-xl border-2 transition ${sourceTile?.id === tile.id ? "border-cyan" : "border-transparent hover:border-black/20"}`}
                        title={tile.title}
                      >
                        <img src={tile.image} alt={tile.title} className="aspect-square w-full object-cover transition duration-300 group-hover:scale-105" />
                        {sourceTab === "saved" ? (
                          <span className="absolute left-1.5 top-1.5 rounded-full bg-cyan/90 p-1 text-charcoal"><Bookmark size={9} /></span>
                        ) : null}
                        <span className="absolute inset-x-0 bottom-0 truncate bg-gradient-to-t from-black/70 to-transparent px-1.5 pb-1 pt-4 text-left text-[10px] font-semibold text-white">
                          {tile.title}
                        </span>
                      </button>
                    ))}
                  </div>
                )}
                {sourceTab !== "upload" && !pickerTiles.length ? (
                  <p className="mt-3 text-center text-xs text-black/40"><Images size={13} className="mr-1 inline" /> Loading designs…</p>
                ) : null}
              </div>
            )}
          </div>

          <div className="rounded-3xl border border-black/[0.08] bg-white p-5 shadow-[0_1px_2px_rgba(0,0,0,0.04),0_12px_32px_rgba(0,0,0,0.05)] sm:p-6">
            <label className="text-xs font-bold uppercase tracking-[0.16em] text-black/40">Category</label>
            <select
              value={categorySlug}
              onChange={(e) => setCategorySlug(e.target.value)}
              className="mt-2 w-full rounded-2xl border border-black/[0.12] bg-[#f5f5f7] px-4 py-3 text-sm font-medium outline-none transition focus:border-cyan"
            >
              {categories.length
                ? categories.map((c) => <option key={c.id} value={c.slug}>{c.name}</option>)
                : <option value="branding">Branding & Logos</option>}
            </select>

            <div className="mt-5 flex items-center justify-between">
              <label className="text-xs font-bold uppercase tracking-[0.16em] text-black/40">Your idea</label>
              <button onClick={surpriseMe} className="inline-flex items-center gap-1.5 text-xs font-bold text-black/50 transition hover:text-cyan">
                <Sparkles size={13} /> Surprise me
              </button>
            </div>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="A poster for a rooftop jazz night — warm, cinematic, a little mysterious…"
              rows={4}
              className="mt-2 w-full resize-none rounded-2xl border border-black/[0.12] bg-[#f5f5f7] px-4 py-3 text-sm leading-6 outline-none transition placeholder:text-black/35 focus:border-cyan"
            />

            <label className="mt-5 block text-xs font-bold uppercase tracking-[0.16em] text-black/40">Format</label>
            <div className="mt-2 grid grid-cols-3 gap-2">
              {FORMATS.map((f) => (
                <button
                  key={f.id}
                  onClick={() => setFormat(f.id)}
                  className={`rounded-2xl border px-2 py-2.5 text-center transition ${format === f.id ? "border-[#1d1d1f] bg-[#1d1d1f] text-white" : "border-black/[0.1] bg-white text-black/70 hover:border-black/30"}`}
                >
                  <span className="block text-xs font-bold">{f.label}</span>
                  <span className={`mt-0.5 block text-[10px] ${format === f.id ? "text-white/60" : "text-black/40"}`}>{f.hint}</span>
                </button>
              ))}
            </div>

            <label className="mt-5 block text-xs font-bold uppercase tracking-[0.16em] text-black/40">Style direction <span className="font-medium normal-case tracking-normal text-black/30">(optional)</span></label>
            <div className="mt-2 flex flex-wrap gap-2">
              {STYLES.map((style) => (
                <button
                  key={style}
                  onClick={() => toggleStyle(style)}
                  className={`rounded-full border px-3.5 py-1.5 text-xs font-semibold transition ${styles.includes(style) ? "border-cyan bg-cyan text-charcoal" : "border-black/[0.12] bg-white text-black/60 hover:border-black/30"}`}
                >
                  {style}
                </button>
              ))}
            </div>

            <button
              onClick={generate}
              disabled={status === "running"}
              className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#1d1d1f] px-6 py-4 text-sm font-bold text-white transition hover:bg-cyan hover:text-charcoal disabled:opacity-60"
            >
              {status === "running" ? <Loader2 size={17} className="animate-spin" /> : <Wand2 size={17} />}
              {status === "running" ? "Crafting your directions…" : "Generate 3 directions"}
            </button>
            {status === "running" ? (
              <p className="mt-3 text-center text-xs text-black/45">Usually takes a few seconds.</p>
            ) : null}
            {error ? <p className="mt-3 text-center text-sm font-semibold text-magenta">{error}</p> : null}
          </div>

          {historyOpen && history.length ? (
            <div className="rounded-3xl border border-black/[0.08] bg-white p-4 shadow-sm">
              <div className="mb-2 flex items-center justify-between px-1">
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-black/40">Recent sessions</p>
                <button onClick={() => setHistoryOpen(false)} aria-label="Close history"><X size={15} className="text-black/40" /></button>
              </div>
              <ul className="divide-y divide-black/[0.06]">
                {history.map((session) => (
                  <li key={session.id} className="group flex items-center gap-3 py-2.5">
                    <button onClick={() => restoreSession(session)} className="min-w-0 flex-1 text-left">
                      <p className="truncate text-sm font-semibold">{session.prompt}</p>
                      <p className="mt-0.5 text-[11px] text-black/40">
                        {new Date(session.createdAt).toLocaleDateString()} · {session.variants.length} variants
                      </p>
                    </button>
                    <button onClick={() => deleteSession(session.id)} aria-label="Delete session" className="text-black/25 opacity-0 transition hover:text-magenta group-hover:opacity-100">
                      <Trash2 size={14} />
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </section>

        {/* Results */}
        <section ref={resultsRef} className="scroll-mt-24">
          {status === "running" ? (
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {[0, 1, 2].map((i) => (
                <div key={i} className="overflow-hidden rounded-3xl border border-black/[0.06] bg-white shadow-sm">
                  <div className="aspect-square animate-pulse bg-black/[0.05]" style={{ animationDelay: `${i * 150}ms` }} />
                  <div className="space-y-2 p-5">
                    <div className="h-4 w-2/3 animate-pulse rounded bg-black/[0.07]" />
                    <div className="h-3 w-full animate-pulse rounded bg-black/[0.05]" />
                    <div className="h-3 w-4/5 animate-pulse rounded bg-black/[0.05]" />
                  </div>
                </div>
              ))}
            </div>
          ) : variants.length ? (
            <>
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-lg font-black tracking-tight">Your directions</h2>
                <span className="text-xs text-black/45">{variants.length} variants · private until you publish</span>
              </div>
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {variants.map((variant, index) => (
                  <article key={variant.design_id} className="group overflow-hidden rounded-3xl border border-black/[0.06] bg-white shadow-[0_1px_2px_rgba(0,0,0,0.04),0_12px_32px_rgba(0,0,0,0.05)] transition hover:-translate-y-0.5 hover:shadow-[0_8px_20px_rgba(0,0,0,0.08),0_22px_50px_rgba(0,0,0,0.1)]">
                    <div className="relative">
                      <VariantArt variant={variant} />
                      <span className="absolute left-3 top-3 rounded-full bg-[#1d1d1f]/85 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-white backdrop-blur">
                        Direction {index + 1}
                      </span>
                    </div>
                    <div className="p-5">
                      <h3 className="font-bold tracking-tight">{variant.title}</h3>
                      <p className="mt-1.5 line-clamp-2 text-sm leading-5 text-black/55">{variant.rationale}</p>
                      <div className="mt-4 grid grid-cols-2 gap-2">
                        <PublishButton designId={variant.design_id} token={token} />
                        <button
                          onClick={() => downloadVariant(variant, index)}
                          className="inline-flex items-center justify-center gap-1.5 rounded-full border border-black/[0.12] px-3 py-2 text-xs font-bold text-black/70 transition hover:border-black hover:text-black"
                        >
                          <Download size={13} /> Export
                        </button>
                        <button
                          onClick={() => copyPrompt(variant.rationale || variant.title, variant.design_id)}
                          className="inline-flex items-center justify-center gap-1.5 rounded-full border border-black/[0.12] px-3 py-2 text-xs font-bold text-black/70 transition hover:border-black hover:text-black"
                        >
                          {copiedId === variant.design_id ? <><Check size={13} className="text-lime" /> Copied</> : <><Copy size={13} /> Copy brief</>}
                        </button>
                        <Link
                          href={`/design/${encodeURIComponent(variant.design_id)}`}
                          className="inline-flex items-center justify-center gap-1.5 rounded-full border border-black/[0.12] px-3 py-2 text-xs font-bold text-black/70 transition hover:border-cyan hover:text-cyan"
                        >
                          Open <ArrowRight size={13} />
                        </Link>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
              <div className="mt-6 flex flex-wrap items-center justify-between gap-3 rounded-3xl border border-black/[0.06] bg-white p-5 shadow-sm">
                <p className="text-sm text-black/55">Not quite it? Tweak the idea or style chips and generate again — each run takes a fresh angle.</p>
                <button
                  onClick={generate}
                  className="inline-flex items-center gap-2 rounded-full bg-[#1d1d1f] px-5 py-2.5 text-xs font-bold text-white transition hover:bg-cyan hover:text-charcoal"
                >
                  <RefreshCw size={13} /> Rerun
                </button>
              </div>
            </>
          ) : (
            <div className="grid min-h-[420px] place-items-center rounded-[32px] border border-dashed border-black/[0.14] bg-white/60 p-10 text-center">
              <div className="max-w-sm">
                <span className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-[#1d1d1f] text-cyan">
                  <Wand2 size={22} />
                </span>
                <h2 className="mt-5 text-xl font-black tracking-tight">Your canvas is ready.</h2>
                <p className="mt-2 text-sm leading-6 text-black/50">
                  Describe what you're making, pick a source design from your saved or the feed, or upload a reference image — Studio drafts three distinct directions you can export, remix, or publish.
                </p>
                <div className="mt-5 flex flex-wrap justify-center gap-2 text-[11px] font-semibold text-black/40">
                  <span className="inline-flex items-center gap-1 rounded-full bg-black/[0.05] px-3 py-1.5"><Lock size={11} /> Private by default</span>
                  <span className="inline-flex items-center gap-1 rounded-full bg-black/[0.05] px-3 py-1.5"><Globe size={11} /> Publish when ready</span>
                </div>
              </div>
            </div>
          )}
        </section>
      </div>

      <AuthModal open={authOpen} onClose={() => setAuthOpen(false)} />
    </main>
  );
}

function PublishButton({ designId, token }: { designId: string; token: string | null }) {
  const [state, setState] = useState<"idle" | "publishing" | "published" | "error">("idle");
  if (state === "published") {
    return (
      <span className="inline-flex items-center justify-center gap-1.5 rounded-full bg-lime px-3 py-2 text-xs font-bold text-charcoal">
        <Check size={13} /> Published
      </span>
    );
  }
  return (
    <button
      onClick={async () => {
        if (!token) return;
        setState("publishing");
        try {
          const coreApiUrl = process.env.NEXT_PUBLIC_CORE_API_URL || "/core-api";
          const res = await fetch(`${coreApiUrl}/designs/${designId}/visibility`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
            body: JSON.stringify({ visibility: "public" })
          });
          setState(res.ok ? "published" : "error");
        } catch {
          setState("error");
        }
      }}
      disabled={!token || state === "publishing"}
      className="inline-flex items-center justify-center gap-1.5 rounded-full bg-[#1d1d1f] px-3 py-2 text-xs font-bold text-white transition hover:bg-cyan hover:text-charcoal disabled:opacity-50"
    >
      {state === "publishing" ? "Publishing…" : state === "error" ? "Retry publish" : "Publish"}
    </button>
  );
}
