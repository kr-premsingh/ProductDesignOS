"use client";

import { useState } from "react";
import { RefreshCw, Save } from "lucide-react";
import { track } from "@/lib/analytics";

type Variant = {
  id: string;
  title: string;
  rationale: string;
  colors: string[];
  svg: string;
};

const localVariants: Variant[] = [0, 1, 2].map((index) => ({
  id: `local-${index}`,
  title: ["Signal Mark", "Orbit Badge", "Signature Glyph"][index],
  rationale: "A premium, personal identity direction ready for remixing.",
  colors: ["#00E5FF", "#FF4DA6", "#0B0F14"],
  svg: `<svg xmlns="http://www.w3.org/2000/svg" width="320" height="320" viewBox="0 0 144 144"><rect width="144" height="144" rx="24" fill="#0B0F14"/><circle cx="72" cy="72" r="${48 - index * 6}" fill="${index === 1 ? "#FF4DA6" : "#00E5FF"}"/><text x="72" y="84" text-anchor="middle" fill="#F7F8FA" font-family="Arial" font-size="34" font-weight="800">PD</text></svg>`
}));

export default function LogoDemoPage() {
  const [variants, setVariants] = useState<Variant[]>(localVariants);
  const [loading, setLoading] = useState(false);

  async function generate(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    const form = new FormData(event.currentTarget);
    const payload = {
      name: String(form.get("name") || "ProductDesignOS"),
      personality: String(form.get("personality") || "premium curious human"),
      colorMood: String(form.get("colorMood") || "neon"),
      style: String(form.get("style") || "minimal"),
      formats: ["svg"]
    };
    track("logo_demo_submitted", payload);

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL;
      if (!apiUrl) throw new Error("No API URL configured");
      const created = await fetch(`${apiUrl}/api/ai/logo`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      }).then((response) => response.json());
      const job = await fetch(`${apiUrl}/api/ai/job/${created.jobId}`).then((response) => response.json());
      setVariants(job.outputs);
    } catch {
      setVariants(localVariants);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="mx-auto max-w-7xl px-4 py-10">
      <div className="grid gap-8 lg:grid-cols-[380px_1fr]">
        <section>
          <p className="text-sm font-semibold uppercase text-cyan">AI Logo Demo</p>
          <h1 className="mt-2 text-4xl font-black">Three directions in one breath.</h1>
          <form onSubmit={generate} className="glass-panel mt-6 grid gap-3 rounded-panel p-4">
            <input name="name" required placeholder="Name" defaultValue="ProductDesignOS" className="rounded-card border border-white/10 bg-white/8 px-3 py-3 outline-none focus:border-cyan" />
            <input name="personality" required placeholder="3 words" defaultValue="premium curious human" className="rounded-card border border-white/10 bg-white/8 px-3 py-3 outline-none focus:border-cyan" />
            <select name="colorMood" className="rounded-card border border-white/10 bg-charcoal px-3 py-3 outline-none focus:border-cyan" defaultValue="neon">
              <option value="neon">Neon</option>
              <option value="calm">Calm</option>
              <option value="luxe">Luxe</option>
              <option value="mono">Mono</option>
            </select>
            <select name="style" className="rounded-card border border-white/10 bg-charcoal px-3 py-3 outline-none focus:border-cyan" defaultValue="minimal">
              <option value="minimal">Minimal</option>
              <option value="geometric">Geometric</option>
              <option value="hand-drawn">Hand-drawn</option>
            </select>
            <button className="inline-flex items-center justify-center gap-2 rounded-full bg-cyan px-5 py-3 font-semibold text-charcoal">
              <RefreshCw size={17} className={loading ? "animate-spin" : ""} /> {loading ? "Crafting variants" : "Generate variants"}
            </button>
          </form>
        </section>
        <section className="grid gap-4 md:grid-cols-3">
          {variants.map((variant) => (
            <article key={variant.id} className="rounded-card border border-white/10 bg-white/6 p-4">
              <div className="overflow-hidden rounded-card bg-charcoal" dangerouslySetInnerHTML={{ __html: variant.svg }} />
              <h2 className="mt-4 font-semibold">{variant.title}</h2>
              <p className="mt-2 text-sm text-muted">{variant.rationale}</p>
              <button className="mt-4 inline-flex items-center gap-2 rounded-full border border-white/15 px-3 py-2 text-xs text-muted">
                <Save size={14} /> Save to profile
              </button>
            </article>
          ))}
        </section>
      </div>
    </main>
  );
}
