import Link from "next/link";
import { ArrowUpRight, Brush, Cpu, Fingerprint, Sparkles } from "lucide-react";
import { EarlyAccess } from "@/components/early-access";

const modules = [
  { icon: Fingerprint, label: "Identity" },
  { icon: Cpu, label: "AI Remix" },
  { icon: Brush, label: "Human Craft" },
  { icon: Sparkles, label: "Inspire Feed" }
];

export default function Home() {
  return (
    <main className="overflow-hidden">
      <section className="relative min-h-[calc(100vh-96px)] overflow-hidden bg-[radial-gradient(circle_at_top_left,_rgba(0,229,255,0.06),_transparent_32%)] px-4 py-8 md:min-h-[calc(100vh-64px)] md:py-10">
        <img
          src="https://images.unsplash.com/photo-1636955816868-fcb881e57954?auto=format&fit=crop&w=2400&q=85"
          alt=""
          className="absolute inset-0 h-full w-full object-cover brightness-90 contrast-110 opacity-40"
        />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(8,11,16,0.92)_0%,rgba(10,14,20,0.78)_48%,rgba(12,18,26,0.64)_100%)]" />
        <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-[#06080d] to-transparent" />
        <div className="pointer-events-none absolute right-[-8rem] top-16 hidden h-[34rem] w-[34rem] rounded-full border border-cyan/30 md:block" />
        <div className="pointer-events-none absolute right-12 top-40 hidden h-48 w-48 rounded-full border border-magenta/35 md:block" />

        <div className="relative mx-auto grid min-h-[calc(100vh-150px)] max-w-7xl content-center md:min-h-[calc(100vh-120px)]">
          <div className="max-w-4xl">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/8 px-3 py-2 text-xs font-semibold uppercase text-cyan backdrop-blur-md">
              <span className="h-2 w-2 rounded-full bg-lime" />
              ProductDesignOS
            </div>
            <h1 className="max-w-4xl text-5xl font-black leading-[0.95] md:text-7xl lg:text-8xl">
              A Design OS for Individuality
            </h1>
            <p className="mt-6 max-w-2xl text-base leading-7 text-white/72 md:text-xl md:leading-8">
              Build visual identities, inspiration systems, and production-ready design directions around the person, not the template.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <EarlyAccess />
              <Link href="/app/demo/logo" className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/8 px-5 py-3 text-sm font-semibold text-glass backdrop-blur-md transition hover:border-magenta hover:text-magenta">
                Try Logo Demo <ArrowUpRight size={16} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="border-y border-white/10 bg-[#080B10] px-4 py-5">
        <div className="mx-auto grid max-w-7xl gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {modules.map((module) => (
            <Link key={module.label} href={module.label === "AI Remix" ? "/app/demo/logo" : "/inspire"} className="group flex items-center justify-between rounded-card border border-white/10 bg-white/6 px-4 py-4 transition hover:border-cyan/60 hover:bg-white/10">
              <span className="flex items-center gap-3 text-sm font-semibold">
                <module.icon size={18} className="text-cyan" />
                {module.label}
              </span>
              <ArrowUpRight size={16} className="text-muted transition group-hover:text-cyan" />
            </Link>
          ))}
        </div>
      </section>

      <section className="bg-[#080B10] px-4 py-14">
        <div className="mx-auto grid max-w-7xl gap-8 md:grid-cols-[0.8fr_1.2fr] md:items-end">
          <div>
            <p className="text-sm font-semibold uppercase text-magenta">From taste to output</p>
            <h2 className="mt-3 text-3xl font-black md:text-5xl">Inspiration, AI, profiles, and providers in one loop.</h2>
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            {["Explore", "Remix", "Publish"].map((step, index) => (
              <div key={step} className="rounded-card border border-white/10 bg-white/6 p-4">
                <span className="text-xs text-muted">0{index + 1}</span>
                <h3 className="mt-5 text-xl font-semibold">{step}</h3>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
