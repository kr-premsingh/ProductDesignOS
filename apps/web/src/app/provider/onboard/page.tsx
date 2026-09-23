"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, BadgeCheck, Check, CheckCircle2, Clock, MessageCircle, ShieldCheck, Sparkles, Wallet } from "lucide-react";
import { useAuth } from "@/lib/auth";
import AuthModal from "@/components/auth-modal";

const CATEGORY_OPTIONS = ["Posters", "Merch", "Social", "Print", "Interiors", "UI", "Brand assets", "Packaging"];
const CAPABILITY_OPTIONS = ["AI remixes", "Print-ready exports", "Screen printing", "Embroidery", "Brand systems", "Photo mockups", "Riso & letterpress", "3D mockups"];

const inputClass =
  "w-full rounded-2xl border border-black/[0.12] bg-[#f5f5f7] px-4 py-3 text-sm outline-none transition placeholder:text-black/35 focus:border-cyan";

function ChipGroup({
  options,
  selected,
  onToggle
}: {
  options: string[];
  selected: string[];
  onToggle: (value: string) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((option) => (
        <button
          type="button"
          key={option}
          onClick={() => onToggle(option)}
          className={`rounded-full border px-3.5 py-1.5 text-xs font-semibold transition ${selected.includes(option) ? "border-cyan bg-cyan text-charcoal" : "border-black/[0.12] bg-white text-black/60 hover:border-black/30"}`}
        >
          {option}
        </button>
      ))}
    </div>
  );
}

export default function ProviderOnboardPage() {
  const [submitted, setSubmitted] = useState(false);
  const [offeringCreated, setOfferingCreated] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [categories, setCategories] = useState<string[]>([]);
  const [capabilities, setCapabilities] = useState<string[]>([]);
  const [authOpen, setAuthOpen] = useState(false);
  const { user, token } = useAuth();

  function toggle(setter: React.Dispatch<React.SetStateAction<string[]>>) {
    return (value: string) =>
      setter((current) => (current.includes(value) ? current.filter((v) => v !== value) : [...current, value]));
  }

  return (
    <main className="text-[#1d1d1f]">
      {/* Hero */}
      <section className="border-b border-black/[0.07] bg-white px-4 py-12 sm:px-6 sm:py-16 lg:px-10 2xl:px-16">
        <div className="max-w-3xl">
          <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-black/40">Provider pilot</p>
          <h1 className="mt-2 text-4xl font-black tracking-tight sm:text-6xl">Turn great taste into fulfilled work.</h1>
          <p className="mt-4 max-w-xl text-sm leading-6 text-black/55 sm:text-base sm:leading-7">
            People fall in love with designs on Dooniq every day. Providers turn that demand into finished products — and get paid in credits for it.
          </p>
          {!user ? (
            <button
              onClick={() => setAuthOpen(true)}
              className="mt-7 inline-flex items-center gap-2 rounded-full bg-[#1d1d1f] px-6 py-3.5 text-sm font-bold text-white transition hover:bg-cyan hover:text-charcoal"
            >
              Sign in to apply <ArrowRight size={15} />
            </button>
          ) : null}
        </div>
      </section>

      {/* Benefits */}
      <section className="px-4 pt-12 sm:px-6 lg:px-10 2xl:px-16">
        <div className="grid gap-3 sm:grid-cols-3">
          {[
            { icon: Sparkles, title: "Demand comes to you", body: "Briefs arrive with the design, format, and references already attached — no cold pitching." },
            { icon: Wallet, title: "Priced in credits", body: "Quote per job, credits move when the buyer accepts. No invoices, no chasing payments." },
            { icon: ShieldCheck, title: "Vetted & featured", body: "Approved providers get the badge, a portfolio page, and placement in the marketplace." }
          ].map(({ icon: Icon, title, body }) => (
            <div key={title} className="rounded-3xl border border-black/[0.07] bg-white p-6 shadow-sm">
              <span className="grid h-11 w-11 place-items-center rounded-2xl bg-[#1d1d1f] text-cyan"><Icon size={19} /></span>
              <h2 className="mt-4 text-lg font-black tracking-tight">{title}</h2>
              <p className="mt-2 text-sm leading-6 text-black/55">{body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Application form */}
      <section className="px-4 py-12 sm:px-6 sm:py-16 lg:px-10 2xl:px-16">
        <div className="grid gap-8 lg:grid-cols-[1fr_1.4fr] lg:gap-14">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-black/40">Step 1</p>
            <h2 className="mt-1.5 text-2xl font-black tracking-tight sm:text-3xl">Apply as a provider</h2>
            <p className="mt-3 text-sm leading-6 text-black/55">
              Tell us what you make and show us three pieces you're proud of. We review every application by hand — usually within a couple of days.
            </p>
            <div className="mt-6 space-y-3 text-sm text-black/55">
              {[
                "Free portfolio page with the provider badge",
                "Briefs matched to your categories and capabilities",
                "In-thread chat with buyers, quotes in credits"
              ].map((item) => (
                <p key={item} className="flex items-start gap-2.5">
                  <Check size={16} className="mt-0.5 shrink-0 text-cyan" /> {item}
                </p>
              ))}
            </div>
          </div>

          <form
            className="rounded-3xl border border-black/[0.08] bg-white p-6 shadow-[0_1px_2px_rgba(0,0,0,0.04),0_12px_32px_rgba(0,0,0,0.05)] sm:p-8"
            onSubmit={async (event) => {
              event.preventDefault();
              setError(null);
              if (!token) {
                setAuthOpen(true);
                return;
              }
              const form = new FormData(event.currentTarget);
              if (!categories.length) {
                setError("Pick at least one category you work in.");
                return;
              }
              if (!capabilities.length) {
                setError("Pick at least one capability.");
                return;
              }
              const coreApiUrl = process.env.NEXT_PUBLIC_CORE_API_URL || "/core-api";
              const response = await fetch(`${coreApiUrl}/providers/onboard`, {
                method: "POST",
                headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
                body: JSON.stringify({
                  categories,
                  capabilities,
                  portfolio: String(form.get("portfolio") || "").split("\n").map((v) => v.trim()).filter(Boolean)
                })
              });
              if (response.ok) setSubmitted(true);
              else setError((await response.json()).error || "Provider application failed.");
            }}
          >
            <label className="block text-xs font-bold uppercase tracking-[0.16em] text-black/40">What do you make?</label>
            <div className="mt-2">
              <ChipGroup options={CATEGORY_OPTIONS} selected={categories} onToggle={toggle(setCategories)} />
            </div>

            <label className="mt-6 block text-xs font-bold uppercase tracking-[0.16em] text-black/40">How do you make it?</label>
            <div className="mt-2">
              <ChipGroup options={CAPABILITY_OPTIONS} selected={capabilities} onToggle={toggle(setCapabilities)} />
            </div>

            <label className="mt-6 block text-xs font-bold uppercase tracking-[0.16em] text-black/40">Portfolio links</label>
            <textarea
              name="portfolio"
              required
              placeholder={"Three links, one per line —\nhttps://your-site.com/work-1\nhttps://instagram.com/you\nhttps://behance.net/you"}
              className={`mt-2 min-h-28 resize-none ${inputClass}`}
            />

            <button className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#1d1d1f] px-6 py-4 text-sm font-bold text-white transition hover:bg-cyan hover:text-charcoal">
              Submit for review <ArrowRight size={15} />
            </button>
            {error ? <p className="mt-3 text-center text-sm font-semibold text-magenta">{error}</p> : null}
          </form>
        </div>

        {/* Step 2 — appears after the application is in */}
        {submitted ? (
          <div className="mt-14 grid gap-8 lg:grid-cols-[1fr_1.4fr] lg:gap-14">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-black/40">Step 2</p>
              <h2 className="mt-1.5 text-2xl font-black tracking-tight sm:text-3xl">List your first offering</h2>
              <p className="mt-3 flex items-start gap-2.5 text-sm leading-6 text-black/55">
                <CheckCircle2 size={17} className="mt-0.5 shrink-0 text-lime" />
                Application submitted for review. While it moves through approval, set up the service buyers will see in the marketplace.
              </p>
            </div>
            <OfferingForm token={token} onCreated={() => setOfferingCreated(true)} />
          </div>
        ) : null}

        {offeringCreated ? (
          <div className="mt-8 flex flex-wrap items-center justify-between gap-3 rounded-3xl border border-lime/50 bg-lime/10 p-6">
            <p className="flex items-center gap-2.5 text-sm font-semibold text-[#1d1d1f]">
              <CheckCircle2 size={18} className="text-lime" /> Your offering is live in the marketplace.
            </p>
            <Link href="/marketplace" className="inline-flex items-center gap-2 rounded-full bg-[#1d1d1f] px-5 py-2.5 text-xs font-bold text-white transition hover:bg-cyan hover:text-charcoal">
              View marketplace <ArrowRight size={13} />
            </Link>
          </div>
        ) : null}
      </section>

      <AuthModal open={authOpen} onClose={() => setAuthOpen(false)} />
    </main>
  );
}

function OfferingForm({ token, onCreated }: { token: string | null; onCreated: () => void }) {
  const [error, setError] = useState<string | null>(null);
  const [fulfillment, setFulfillment] = useState("digital");

  return (
    <form
      className="rounded-3xl border border-black/[0.08] bg-white p-6 shadow-[0_1px_2px_rgba(0,0,0,0.04),0_12px_32px_rgba(0,0,0,0.05)] sm:p-8"
      onSubmit={async (event) => {
        event.preventDefault();
        if (!token) return;
        setError(null);
        const form = new FormData(event.currentTarget);
        const coreApiUrl = process.env.NEXT_PUBLIC_CORE_API_URL || "/core-api";
        const response = await fetch(`${coreApiUrl}/offerings`, {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
          body: JSON.stringify({
            category_slug: String(form.get("category_slug")),
            title: String(form.get("title")),
            description: String(form.get("description")),
            fulfillment_type: fulfillment,
            pricing_type: "quote_only",
            lead_time_days: Number(form.get("lead_time_days")) || null
          })
        });
        if (response.ok) {
          onCreated();
          event.currentTarget.reset();
        } else {
          setError((await response.json()).error || "Could not create offering.");
        }
      }}
    >
      <label className="block text-xs font-bold uppercase tracking-[0.16em] text-black/40">Offering title</label>
      <input name="title" required placeholder="Custom poster series, merch print run…" className={`mt-2 ${inputClass}`} />

      <label className="mt-5 block text-xs font-bold uppercase tracking-[0.16em] text-black/40">What will you make?</label>
      <textarea name="description" required placeholder="Describe what's included, formats, and what you need from the buyer." className={`mt-2 min-h-24 resize-none ${inputClass}`} />

      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        <div>
          <label className="block text-xs font-bold uppercase tracking-[0.16em] text-black/40">Category</label>
          <select name="category_slug" defaultValue="branding" className={`mt-2 ${inputClass}`}>
            <option value="branding">Branding & Logos</option>
            <option value="apparel">Apparel & Prints</option>
            <option value="invitations">Invitations & Stationery</option>
          </select>
        </div>
        <div>
          <label className="block text-xs font-bold uppercase tracking-[0.16em] text-black/40">Turnaround (days)</label>
          <input name="lead_time_days" type="number" min="1" placeholder="7" className={`mt-2 ${inputClass}`} />
        </div>
      </div>

      <label className="mt-5 block text-xs font-bold uppercase tracking-[0.16em] text-black/40">Fulfillment</label>
      <div className="mt-2 grid grid-cols-3 gap-2">
        {[
          { id: "digital", label: "Digital", icon: MessageCircle },
          { id: "physical", label: "Physical", icon: BadgeCheck },
          { id: "service", label: "Service", icon: Clock }
        ].map(({ id, label, icon: Icon }) => (
          <button
            type="button"
            key={id}
            onClick={() => setFulfillment(id)}
            className={`flex items-center justify-center gap-2 rounded-2xl border px-3 py-3 text-xs font-bold transition ${fulfillment === id ? "border-[#1d1d1f] bg-[#1d1d1f] text-white" : "border-black/[0.1] bg-white text-black/60 hover:border-black/30"}`}
          >
            <Icon size={14} /> {label}
          </button>
        ))}
      </div>

      <button className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#1d1d1f] px-6 py-4 text-sm font-bold text-white transition hover:bg-cyan hover:text-charcoal">
        List offering <ArrowRight size={15} />
      </button>
      {error ? <p className="mt-3 text-center text-sm font-semibold text-magenta">{error}</p> : null}
    </form>
  );
}

