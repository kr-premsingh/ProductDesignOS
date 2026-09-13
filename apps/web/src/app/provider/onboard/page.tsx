"use client";

import { useState } from "react";
import { CheckCircle2 } from "lucide-react";
import { useAuth } from "@/lib/auth";

export default function ProviderOnboardPage() {
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { token } = useAuth();

  return (
    <main className="mx-auto max-w-3xl px-4 py-10">
      <p className="text-sm font-semibold uppercase text-cyan">Provider pilot</p>
      <h1 className="mt-2 text-4xl font-black">Turn great taste into fulfilled work.</h1>
      <form
        className="glass-panel mt-8 grid gap-4 rounded-panel p-5"
        onSubmit={async (event) => {
          event.preventDefault();
          setError(null);
          if (!token) {
            setError("Sign in before applying as a provider.");
            return;
          }
          const form = new FormData(event.currentTarget);
          const coreApiUrl = process.env.NEXT_PUBLIC_CORE_API_URL || "/core-api";
          const response = await fetch(`${coreApiUrl}/providers/onboard`, {
            method: "POST",
            headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
            body: JSON.stringify({
              categories: String(form.get("categories") || "").split(",").map((v) => v.trim()).filter(Boolean),
              capabilities: String(form.get("capabilities") || "").split(",").map((v) => v.trim()).filter(Boolean),
              portfolio: String(form.get("portfolio") || "").split("\n").map((v) => v.trim()).filter(Boolean)
            })
          });
          if (response.ok) setSubmitted(true);
          else setError((await response.json()).error || "Provider application failed.");
        }}
      >
        <input name="categories" required placeholder="Categories: print, interiors, merch" className="rounded-card border border-white/10 bg-white/8 px-3 py-3 outline-none focus:border-cyan" />
        <input name="capabilities" required placeholder="Capabilities: print, digital, interior" className="rounded-card border border-white/10 bg-white/8 px-3 py-3 outline-none focus:border-cyan" />
        <textarea name="portfolio" required placeholder="Paste 3 portfolio links, one per line" className="min-h-32 rounded-card border border-white/10 bg-white/8 px-3 py-3 outline-none focus:border-cyan" />
        <button className="rounded-full bg-cyan px-5 py-3 font-semibold text-charcoal">Submit for approval</button>
        {error ? <p className="text-sm text-magenta">{error}</p> : null}
      </form>
      {submitted ? (
        <p className="mt-4 flex items-center gap-2 text-sm text-lime">
          <CheckCircle2 size={18} /> Provider record submitted for admin approval.
        </p>
      ) : null}
    </main>
  );
}
