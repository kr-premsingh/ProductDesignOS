"use client";

import { useEffect, useState } from "react";
import { ShoppingBag } from "lucide-react";
import { useAuth } from "@/lib/auth";

type Offering = { id: string; owner_id: string; title: string; description?: string; fulfillment_type: string; pricing_type: string; price_credits?: number; lead_time_days?: number };
type Order = { id: string; offering_id: string; brief: string; status: string; quoted_credits?: number };

export default function MarketplacePage() {
  const { token } = useAuth();
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
            {orders.map((order) => <div key={order.id} className="flex flex-wrap items-center justify-between gap-3 rounded-card border border-white/10 bg-white/6 p-4 text-sm"><span>{order.brief}</span><span className="rounded-full bg-white/10 px-3 py-1 text-xs uppercase text-cyan">{order.status}{order.quoted_credits ? ` · ${order.quoted_credits} credits` : ""}</span></div>)}
          </div>
        </section>
      ) : null}
      {message ? <p className="mt-6 text-sm text-lime">{message}</p> : null}
    </main>
  );
}