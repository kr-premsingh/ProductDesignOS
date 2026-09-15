"use client";

import { useEffect, useState } from "react";
import { MessageCircle, Send, ShoppingBag } from "lucide-react";
import { useAuth } from "@/lib/auth";

type Offering = { id: string; owner_id: string; title: string; description?: string; fulfillment_type: string; pricing_type: string; price_credits?: number; lead_time_days?: number };
type Order = { id: string; offering_id: string; brief: string; status: string; quoted_credits?: number };
type OrderMessage = { id: string; sender_id: string; body: string; created_at: string };

export default function MarketplacePage() {
  const { token, user } = useAuth();
  const [offerings, setOfferings] = useState<Offering[]>([]);
  const [message, setMessage] = useState<string | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);

  useEffect(() => {
    const coreApiUrl = process.env.NEXT_PUBLIC_CORE_API_URL || "/core-api";
    fetch(`${coreApiUrl}/offerings`).then((res) => res.json()).then(setOfferings).catch(() => setOfferings([]));
    if (token) fetch(`${coreApiUrl}/orders`, { headers: { Authorization: `Bearer ${token}` } }).then((res) => res.ok ? res.json() : []).then(setOrders).catch(() => setOrders([]));
  }, [token]);

  async function requestQuote(offeringId: string) {
    if (!token) { setMessage("Sign in to request a quote."); return; }
    const brief = window.prompt("Tell the provider what you need:");
    if (!brief) return;
    const coreApiUrl = process.env.NEXT_PUBLIC_CORE_API_URL || "/core-api";
    const res = await fetch(`${coreApiUrl}/offerings/${offeringId}/orders`, {
      method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` }, body: JSON.stringify({ brief })
    });
    setMessage(res.ok ? "Request sent to the provider." : (await res.json()).error || "Request failed.");
  }

  return (
    <main className="mx-auto max-w-7xl px-4 py-10">
      <p className="text-sm font-semibold uppercase text-cyan">Marketplace</p>
      <h1 className="mt-2 text-4xl font-black">Get your idea made by someone who gets it.</h1>
      <p className="mt-4 max-w-2xl text-white/70">Browse creator offerings, share your brief, and move from inspiration to a real digital or physical outcome.</p>
      <div className="mt-8 grid gap-4 md:grid-cols-3">
        {offerings.map((offering) => (
          <article key={offering.id} className="rounded-card border border-white/10 bg-white/6 p-5">
            <ShoppingBag className="text-cyan" />
            <h2 className="mt-4 text-xl font-semibold">{offering.title}</h2>
            <p className="mt-2 text-sm text-muted">{offering.description || "Custom work shaped around your brief."}</p>
            <p className="mt-4 text-xs uppercase text-muted">{offering.fulfillment_type} · {offering.pricing_type}</p>
            <button onClick={() => requestQuote(offering.id)} className="mt-5 rounded-full bg-cyan px-4 py-2 text-sm font-semibold text-charcoal">Request quote</button>
          </article>
        ))}
      </div>
      {!offerings.length ? <p className="mt-10 text-sm text-muted">Creator offerings will appear here as providers join the pilot.</p> : null}
      {orders.length ? (
        <section className="mt-14">
          <h2 className="text-2xl font-black">Your requests</h2>
          <div className="mt-4 grid gap-3">
            {orders.map((order) => <OrderThread key={order.id} order={order} token={token} userId={user?.id} />)}
          </div>
        </section>
      ) : null}
      {message ? <p className="mt-6 text-sm text-lime">{message}</p> : null}
    </main>
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

  return <article className="rounded-card border border-white/10 bg-white/6 p-4 text-sm"><div className="flex flex-wrap items-center justify-between gap-3"><p className="max-w-2xl text-white/85">{order.brief}</p><span className="rounded-full bg-white/10 px-3 py-1 text-xs uppercase text-cyan">{order.status}{order.quoted_credits ? ` · ${order.quoted_credits} credits` : ""}</span></div><button onClick={() => setOpen((value) => !value)} className="mt-4 inline-flex items-center gap-2 text-xs font-semibold text-cyan hover:text-magenta"><MessageCircle size={15}/>{open ? "Hide conversation" : "Open conversation"}</button>{open ? <div className="mt-4 border-t border-white/10 pt-4"><div className="max-h-56 space-y-2 overflow-y-auto">{messages.length ? messages.map((message) => <div key={message.id} className={`max-w-[85%] rounded-card px-3 py-2 ${message.sender_id === userId ? "ml-auto bg-cyan text-charcoal" : "bg-white/10 text-white/85"}`}>{message.body}</div>) : <p className="text-xs text-muted">Start the conversation with a clear next step.</p>}</div><form onSubmit={sendMessage} className="mt-3 flex gap-2"><input value={draft} onChange={(event) => setDraft(event.target.value)} maxLength={2000} placeholder="Write a message" className="min-w-0 flex-1 rounded-full border border-white/15 bg-charcoal/50 px-4 py-2 text-sm outline-none focus:border-cyan"/><button disabled={sending || !draft.trim()} className="grid h-9 w-9 place-items-center rounded-full bg-cyan text-charcoal disabled:opacity-50" aria-label="Send message"><Send size={15}/></button></form></div> : null}</article>;
}