"use client";

import { useState } from "react";
import { ArrowRight, Check, X } from "lucide-react";
import { track } from "@/lib/analytics";

export function EarlyAccess() {
  const [open, setOpen] = useState(false);
  const [done, setDone] = useState(false);

  return (
    <>
      <button
        className="inline-flex items-center gap-2 rounded-full bg-glass px-5 py-3 text-sm font-semibold text-charcoal transition hover:bg-cyan"
        onClick={() => {
          setOpen(true);
          track("early_access_opened");
        }}
      >
        Join Early Access <ArrowRight size={16} />
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
                onSubmit={(event) => {
                  event.preventDefault();
                  setDone(true);
                  track("early_access_submitted");
                }}
              >
                <input required type="email" placeholder="Email" className="rounded-card border border-white/10 bg-white/8 px-3 py-3 outline-none focus:border-cyan" />
                <select required className="rounded-card border border-white/10 bg-charcoal px-3 py-3 outline-none focus:border-cyan" defaultValue="">
                  <option value="" disabled>Role</option>
                  <option>Student</option>
                  <option>Influencer</option>
                  <option>Provider</option>
                </select>
                <input placeholder="Your design mood in one line" className="rounded-card border border-white/10 bg-white/8 px-3 py-3 outline-none focus:border-cyan" />
                <button className="mt-2 rounded-full bg-cyan px-5 py-3 font-semibold text-charcoal">Request invite</button>
              </form>
            )}
          </div>
        </div>
      ) : null}
    </>
  );
}
