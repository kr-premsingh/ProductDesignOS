"use client";

import { useState } from "react";
import { CheckCircle2 } from "lucide-react";

export default function ProviderOnboardPage() {
  const [submitted, setSubmitted] = useState(false);

  return (
    <main className="mx-auto max-w-3xl px-4 py-10">
      <p className="text-sm font-semibold uppercase text-cyan">Provider pilot</p>
      <h1 className="mt-2 text-4xl font-black">Turn great taste into fulfilled work.</h1>
      <form
        className="glass-panel mt-8 grid gap-4 rounded-panel p-5"
        onSubmit={(event) => {
          event.preventDefault();
          setSubmitted(true);
        }}
      >
        <input required placeholder="Provider username" className="rounded-card border border-white/10 bg-white/8 px-3 py-3 outline-none focus:border-cyan" />
        <input required placeholder="Categories: print, interiors, merch" className="rounded-card border border-white/10 bg-white/8 px-3 py-3 outline-none focus:border-cyan" />
        <input required placeholder="Capabilities: print, digital, interior" className="rounded-card border border-white/10 bg-white/8 px-3 py-3 outline-none focus:border-cyan" />
        <textarea required placeholder="Paste 3 portfolio links" className="min-h-32 rounded-card border border-white/10 bg-white/8 px-3 py-3 outline-none focus:border-cyan" />
        <input placeholder="Sample pricing" className="rounded-card border border-white/10 bg-white/8 px-3 py-3 outline-none focus:border-cyan" />
        <button className="rounded-full bg-cyan px-5 py-3 font-semibold text-charcoal">Submit for approval</button>
      </form>
      {submitted ? (
        <p className="mt-4 flex items-center gap-2 text-sm text-lime">
          <CheckCircle2 size={18} /> Provider record submitted for admin approval.
        </p>
      ) : null}
    </main>
  );
}
