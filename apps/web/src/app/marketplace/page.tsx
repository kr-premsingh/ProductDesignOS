"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  Check,
  Clock,
  MessageCircle,
  Package,
  Palette,
  Send,
  ShieldCheck,
  Shirt,
  ShoppingBag,
  Sparkles,
  X
} from "lucide-react";
import { useAuth } from "@/lib/auth";
import AuthModal from "@/components/auth-modal";

type Offering = { id: string; owner_id: string; title: string; description?: string; fulfillment_type: string; pricing_type: string; price_credits?: number; lead_time_days?: number };
type Order = { id: string; offering_id: string; brief: string; status: string; quoted_credits?: number };
type OrderMessage = { id: string; sender_id: string; body: string; created_at: string };

const FULFILLMENT_META: Record<string, { label: string; icon: typeof Package }> = {
  physical: { label: "Physical product", icon: Package },
  digital: { label: "Digital delivery", icon: Palette },
  "print-shop": { label: "Print & ship", icon: Shirt }
};

function fulfillmentLabel(type: string) {
  return FULFILLMENT_META[type]?.label || type;
}

export default function MarketplacePage() {
  const { token, user } = useAuth();
  const [offerings, setOfferings] = useState<Offering[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [activeOffering, setActiveOffering] = useState<Offering | null>(null);
  const [authOpen, setAuthOpen] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  useEffect(() => {
    const coreApiUrl = process.env.NEXT_PUBLIC_CORE_API_URL || "/core-api";
    fetch(`${coreApiUrl}/offerings`).then((res) => res.json()).then(setOfferings).catch(() => setOfferings([]));
    if (token) fetch(`${coreApiUrl}/orders`, { headers: { Authorization: `Bearer ${token}` } }).then((res) => res.ok ? res.json() : []).then(setOrders).catch(() => setOrders([]));
  }, [token]);

  function openQuote(offering: Offering) {
    if (!token) {
      setAuthOpen(true);
      return;
    }
    setActiveOffering(offering);
  }

  return (
    <main className="text-[#1d1d1f]">
      {/* Hero */}
      <section className="border-b border-black/[0.07] bg-white px-4 py-12 sm:py-16">
        <div className="mx-auto max-w-7xl">
          <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-black/40">Marketplace</p>
          <h1 className="mt-2 max-w-3xl text-4xl font-black tracking-tight sm:text-6xl">Get your idea made by someone who gets it.</h1>
          <p className="mt-4 max-w-2xl text-sm leading-6 text-black/55 sm:text-base sm:leading-7">
            Browse vetted creators and providers, share a brief, and move from inspiration to a real digital or physical outcome.
          </p>
          <div className="mt-7 flex flex-wrap gap-3">
            <a href="#offerings" className="inline-flex items-center gap-2 rounded-full bg-[#1d1d1f] px-6 py-3.5 text-sm font-bold text-white transition hover:bg-cyan hover:text-charcoal">
              Browse services <ArrowRight size={15} />
            </a>
            <Link href="/provider/onboard" className="inline-flex items-center gap-2 rounded-full border border-black/[0.15] bg-white px-6 py-3.5 text-sm font-bold text-[#1d1d1f] transition hover:border-black">
              <Sparkles size={15} /> Sell your skills
            </Link>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="mx-auto max-w-7xl px-4 pt-12 sm:pt-16">
        <div className="grid gap-3 sm:grid-cols-3">
          {[
            { step: "01", title: "Share your brief", body: "Describe what you need — format, style, quantity, deadline. Attach the design you want made." },
            { step: "02", title: "Get a quote", body: "The provider replies with a price in credits and a timeline. Chat in-thread until it's right." },
            { step: "03", title: "Receive it made", body: "Digital files delivered to your library, or physical pieces printed and shipped to you." }
          ].map((item) => (
            <div key={item.step} className="rounded-3xl border border-black/[0.07] bg-white p-6 shadow-sm">
              <p className="text-xs font-black tracking-[0.2em] text-cyan">{item.step}</p>
              <h2 className="mt-3 text-lg font-black tracking-tight">{item.title}</h2>
              <p className="mt-2 text-sm leading-6 text-black/55">{item.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Offerings */}
      <section id="offerings" className="mx-auto max-w-7xl scroll-mt-24 px-4 pt-12 sm:pt-16">
        <div className="mb-6 flex items-end justify-between">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-black/40">Services</p>
            <h2 className="mt-1.5 text-2xl font-black tracking-tight sm:text-3xl">Creator offerings</h2>
          </div>
          <span className="text-xs text-black/45">{offerings.length} available</span>
        </div>

        {offerings.length ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {offerings.map((offering) => {
              const meta = FULFILLMENT_META[offering.fulfillment_type];
              const Icon = meta?.icon || ShoppingBag;
              return (
                <article key={offering.id} className="group flex flex-col rounded-3xl border border-black/[0.07] bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-[0_10px_24px_rgba(0,0,0,0.07),0_24px_50px_rgba(0,0,0,0.1)]">
                  <div className="flex items-start justify-between">
                    <span className="grid h-11 w-11 place-items-center rounded-2xl bg-[#1d1d1f] text-cyan"><Icon size={19} /></span>
                    <span className="rounded-full bg-black/[0.05] px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-black/55">{fulfillmentLabel(offering.fulfillment_type)}</span>
                  </div>
                  <h3 className="mt-4 text-lg font-black tracking-tight">{offering.title}</h3>
                  <p className="mt-2 line-clamp-3 flex-1 text-sm leading-6 text-black/55">{offering.description || "Custom work shaped around your brief."}</p>
                  <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs font-semibold text-black/45">
                    {offering.price_credits != null ? <span>from {offering.price_credits} credits</span> : <span>quote-based · {offering.pricing_type}</span>}
                    {offering.lead_time_days != null ? <span className="inline-flex items-center gap-1"><Clock size={12} /> ~{offering.lead_time_days}d turnaround</span> : null}
                  </div>
                  <button
                    onClick={() => openQuote(offering)}
                    className="mt-5 inline-flex items-center justify-center gap-2 rounded-full bg-[#1d1d1f] px-5 py-3 text-sm font-bold text-white transition hover:bg-cyan hover:text-charcoal"
                  >
                    Request quote <ArrowRight size={14} />
                  </button>
                </article>
              );
            })}
          </div>
        ) : (
          <div className="grid min-h-56 place-items-center rounded-[32px] border border-dashed border-black/[0.14] bg-white/60 p-10 text-center">
            <div className="max-w-sm">
              <span className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-[#1d1d1f] text-cyan"><ShoppingBag size={22} /></span>
              <h3 className="mt-5 text-xl font-black tracking-tight">Providers are onboarding now.</h3>
              <p className="mt-2 text-sm leading-6 text-black/50">Creator offerings will appear here as the pilot opens. Want to be one of the first?</p>
              <Link href="/provider/onboard" className="mt-5 inline-flex items-center gap-2 rounded-full bg-[#1d1d1f] px-5 py-2.5 text-xs font-bold text-white transition hover:bg-cyan hover:text-charcoal">
                Become a provider <ArrowRight size={13} />
              </Link>
            </div>
          </div>
        )}
      </section>

      {/* Orders */}
      {orders.length ? (
        <section className="mx-auto max-w-7xl px-4 pt-12 sm:pt-16">
          <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-black/40">In progress</p>
          <h2 className="mt-1.5 text-2xl font-black tracking-tight sm:text-3xl">Your requests</h2>
          <div className="mt-6 grid gap-3">
            {orders.map((order) => <OrderThread key={order.id} order={order} token={token} userId={user?.id} />)}
          </div>
        </section>
      ) : null}

      {/* Trust strip */}
      <section className="mx-auto max-w-7xl px-4 py-12 sm:py-16">
        <div className="grid gap-3 rounded-[28px] border border-black/[0.07] bg-white p-6 shadow-sm sm:grid-cols-3 sm:p-8">
          {[
            { icon: ShieldCheck, title: "Vetted providers", body: "Every provider is reviewed before their offerings go live." },
            { icon: MessageCircle, title: "In-thread chat", body: "Briefs, quotes, and files stay in one conversation." },
            { icon: Check, title: "Credits protected", body: "Credits only move when you accept a quote." }
          ].map(({ icon: Icon, title, body }) => (
            <div key={title} className="flex gap-4">
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-black/[0.04]"><Icon size={17} /></span>
              <div>
                <p className="text-sm font-bold">{title}</p>
                <p className="mt-0.5 text-xs leading-5 text-black/50">{body}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {notice ? (
        <div className="fixed bottom-24 left-1/2 z-50 -translate-x-1/2 rounded-full bg-[#1d1d1f] px-5 py-3 text-sm font-semibold text-white shadow-xl md:bottom-8">{notice}</div>
      ) : null}

      {activeOffering ? (
        <QuoteModal
          offering={activeOffering}
          token={token}
          onClose={() => setActiveOffering(null)}
          onSent={() => {
            setActiveOffering(null);
            setNotice("Request sent — the provider will reply with a quote.");
            setTimeout(() => setNotice(null), 4000);
          }}
        />
      ) : null}

      <AuthModal open={authOpen} onClose={() => setAuthOpen(false)} />
    </main>
  );
}

function QuoteModal({ offering, token, onClose, onSent }: { offering: Offering; token: string | null; onClose: () => void; onSent: () => void }) {
  const [brief, setBrief] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit() {
    if (!brief.trim() || !token) return;
    setSending(true);
    setError(null);
    try {
      const coreApiUrl = process.env.NEXT_PUBLIC_CORE_API_URL || "/core-api";
      const res = await fetch(`${coreApiUrl}/offerings/${offering.id}/orders`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ brief: brief.trim() })
      });
      if (!res.ok) throw new Error((await res.json()).error || "Request failed.");
      onSent();
    } catch (err: any) {
      setError(err?.message || "Request failed.");
      setSending(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/40 p-4 backdrop-blur-sm" onClick={onClose}>
      <div className="w-full max-w-lg rounded-[28px] bg-white p-6 shadow-2xl sm:p-8" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-black/40">Request a quote</p>
            <h2 className="mt-1.5 text-xl font-black tracking-tight">{offering.title}</h2>
            <p className="mt-1 text-xs text-black/45">{fulfillmentLabel(offering.fulfillment_type)}{offering.lead_time_days != null ? ` · ~${offering.lead_time_days} day turnaround` : ""}</p>
          </div>
          <button onClick={onClose} aria-label="Close" className="rounded-full p-2 text-black/40 transition hover:bg-black/[0.05] hover:text-black"><X size={17} /></button>
        </div>
        <textarea
          value={brief}
          onChange={(e) => setBrief(e.target.value)}
          rows={5}
          autoFocus
          placeholder="Tell the provider what you need — the design, format, quantity, deadline, and any links to references…"
          className="mt-5 w-full resize-none rounded-2xl border border-black/[0.12] bg-[#f5f5f7] px-4 py-3 text-sm leading-6 outline-none transition placeholder:text-black/35 focus:border-cyan"
        />
        {error ? <p className="mt-2 text-sm font-semibold text-magenta">{error}</p> : null}
        <div className="mt-5 flex justify-end gap-2">
          <button onClick={onClose} className="rounded-full px-5 py-2.5 text-sm font-semibold text-black/60 transition hover:bg-black/[0.05]">Cancel</button>
          <button
            onClick={submit}
            disabled={sending || !brief.trim()}
            className="inline-flex items-center gap-2 rounded-full bg-[#1d1d1f] px-6 py-2.5 text-sm font-bold text-white transition hover:bg-cyan hover:text-charcoal disabled:opacity-50"
          >
            <Send size={14} /> {sending ? "Sending…" : "Send request"}
          </button>
        </div>
      </div>
    </div>
  );
}

function OrderThread({ order, token, userId }: { order: Order; token: string | null; userId?: string }) {
  const [messages, setMessages] = useState<OrderMessage[]>([]);
  const [draft, setDraft] = useState("");
  const [open, setOpen] = useState(false);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    if (!open || !token) return;
    const coreApiUrl = process.env.NEXT_PUBLIC_CORE_API_URL || "/core-api";
    fetch(`${coreApiUrl}/orders/${order.id}/messages`, { headers: { Authorization: `Bearer ${token}` } })
      .then((res) => res.ok ? res.json() : [])
      .then(setMessages)
      .catch(() => setMessages([]));
  }, [open, order.id, token]);

  async function sendMessage(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!draft.trim() || !token) return;
    setSending(true);
    const coreApiUrl = process.env.NEXT_PUBLIC_CORE_API_URL || "/core-api";
    try {
      const res = await fetch(`${coreApiUrl}/orders/${order.id}/messages`, { method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` }, body: JSON.stringify({ body: draft.trim() }) });
      if (res.ok) {
        const message: OrderMessage = await res.json();
        setMessages((current) => [...current, message]);
        setDraft("");
      }
    } finally { setSending(false); }
  }

  return (
    <article className="rounded-3xl border border-black/[0.07] bg-white p-5 text-sm shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="max-w-2xl font-medium text-[#1d1d1f]">{order.brief}</p>
        <span className="rounded-full bg-cyan/15 px-3 py-1 text-xs font-bold uppercase tracking-wider text-charcoal">
          {order.status}{order.quoted_credits ? ` · ${order.quoted_credits} credits` : ""}
        </span>
      </div>
      <button onClick={() => setOpen((value) => !value)} className="mt-4 inline-flex items-center gap-2 text-xs font-bold text-black/50 transition hover:text-cyan">
        <MessageCircle size={15} />{open ? "Hide conversation" : "Open conversation"}
      </button>
      {open ? (
        <div className="mt-4 border-t border-black/[0.07] pt-4">
          <div className="max-h-56 space-y-2 overflow-y-auto">
            {messages.length ? messages.map((message) => (
              <div key={message.id} className={`max-w-[85%] rounded-2xl px-3.5 py-2 text-sm ${message.sender_id === userId ? "ml-auto bg-[#1d1d1f] text-white" : "bg-black/[0.05] text-[#1d1d1f]"}`}>
                {message.body}
              </div>
            )) : <p className="text-xs text-black/40">Start the conversation with a clear next step.</p>}
          </div>
          <form onSubmit={sendMessage} className="mt-3 flex gap-2">
            <input
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              maxLength={2000}
              placeholder="Write a message"
              className="min-w-0 flex-1 rounded-full border border-black/[0.12] bg-[#f5f5f7] px-4 py-2 text-sm outline-none transition focus:border-cyan"
            />
            <button disabled={sending || !draft.trim()} className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-[#1d1d1f] text-white transition hover:bg-cyan hover:text-charcoal disabled:opacity-50" aria-label="Send message">
              <Send size={15} />
            </button>
          </form>
        </div>
      ) : null}
    </article>
  );
}