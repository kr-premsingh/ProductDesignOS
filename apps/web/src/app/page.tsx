import Link from "next/link";
import { Palette, PanelsTopLeft, UserRound } from "lucide-react";
import { EarlyAccess } from "@/components/early-access";

const cards = [
  { icon: PanelsTopLeft, title: "Inspire", text: "Curated visual systems for remixing." },
  { icon: Palette, title: "Demo", text: "AI logo variants with human-readable rationale." },
  { icon: UserRound, title: "Profiles", text: "Role-aware portfolios for students, creators, and providers." }
];

export default function Home() {
  return (
    <main>
      <section className="mx-auto grid min-h-[calc(100vh-64px)] max-w-7xl content-center px-4 py-10">
        <div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
          <div className="max-w-3xl">
            <p className="mb-4 text-sm font-semibold uppercase text-cyan">Design operating system</p>
            <h1 className="text-5xl font-black leading-none md:text-7xl">Templates are dead. Design your signature.</h1>
            <p className="mt-6 max-w-xl text-lg text-muted">AI and human craft for designs that feel like you.</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <EarlyAccess />
              <Link href="/app/demo/logo" className="rounded-full border border-white/15 px-5 py-3 text-sm font-semibold transition hover:border-magenta hover:text-magenta">
                Try Logo Demo
              </Link>
            </div>
          </div>
          <div className="grid gap-3">
            {cards.map((card, index) => (
              <div key={card.title} className="glass-panel rounded-panel p-5" style={{ transform: `translateX(${index * 18}px)` }}>
                <card.icon className="mb-7 text-cyan" />
                <h2 className="text-2xl font-semibold">{card.title}</h2>
                <p className="mt-2 text-sm text-muted">{card.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
      <section className="border-t border-white/10 px-4 py-8">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-4 text-sm text-muted">
          <span className="text-glass">Early partners</span>
          <span>Design schools</span>
          <span>Independent studios</span>
          <span>Print providers</span>
          <span>Creator agencies</span>
        </div>
      </section>
    </main>
  );
}
