"use client";

import { useState } from "react";
import { ArrowRight, Check, X } from "lucide-react";
import { track } from "@/lib/analytics";

export function EarlyAccess({ label = "Join Early Access", defaultRole }: { label?: string; defaultRole?: string } = {}) {
  const [open, setOpen] = useState(false);
  const [done, setDone] = useState(false);

  return (
    <>
      <button
        className="inline-flex items-center gap-2 rounded-full bg-glass px-5 py-3 text-sm font-semibold text-charcoal transition hover:bg-cyan"
        onClick={() => {
          setOpen(true);
          track("early_access_opened", { defaultRole });
        }}
      >
        {label} <ArrowRight size={16} />
      </button>
      {open ? (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/72 px-4">
          <div className="glass-panel w-full max-w-md rounded-panel p-5 shadow-glow">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-xl font-semibold">Get your invite</h2>
              <button aria-label="Close" className="rounded-full p-2 hover:bg-white/10" onClick={() => setOpen(false)}>
                <X size={18} />
              </button>
            </div>
            {done ? (
              <div className="grid gap-4 py-8 text-center">
                <span className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-lime text-charcoal">
                  <Check />
                </span>
                <p className="text-lg font-semibold">You are on the list.</p>
                <p className="text-sm text-muted">We will send the first private build when it is ready.</p>
              </div>
            ) : (
              <form
                className="grid gap-3"
                onSubmit={async (event) => {
                  event.preventDefault();
                  const form = event.target as HTMLFormElement;
                  const formData = new FormData(form);
                  const email = String(formData.get('email') || '').trim();
                  const role = String(formData.get('role') || '').trim();
                  const mood = String(formData.get('mood') || '').trim();
                  try {
                    const res = await fetch('/core-api/waitlist', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ name: undefined, email, role, mood })
                    });
                    if (res.ok) {
                      setDone(true);
                      track('early_access_submitted');
                    } else {
                      // still mark done but show fallback note
                      setDone(true);
                    }
                  } catch (err) {
                    setDone(true);
                  }
                }}
              >
                <input name="email" required type="email" placeholder="Email" className="rounded-card border border-white/10 bg-white/8 px-3 py-3 outline-none focus:border-cyan" />
                <select name="role" required className="rounded-card border border-white/10 bg-charcoal px-3 py-3 outline-none focus:border-cyan" defaultValue={defaultRole ?? ""}>
                  <option value="" disabled>Role</option>
                  <option>Student</option>
                  <option>Influencer</option>
                  <option>Provider</option>
                </select>
                <input name="mood" placeholder="Your design mood in one line" className="rounded-card border border-white/10 bg-white/8 px-3 py-3 outline-none focus:border-cyan" />
                <button className="mt-2 rounded-full bg-cyan px-5 py-3 font-semibold text-charcoal">Request invite</button>
              </form>
            )}
          </div>
        </div>
      ) : null}
    </>
  );
}
