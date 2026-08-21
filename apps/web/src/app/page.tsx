import Link from "next/link";
import { ArrowUpRight, Sparkles, Wand2, Compass, ShoppingBag } from "lucide-react";
import { EarlyAccess } from "@/components/early-access";
import { FeedCard } from "@/components/feed-card";
import { categories as fallbackCategories, inspireTiles as fallbackTiles } from "@/lib/mock-data";
import { fetchCategories, fetchDesigns, toTile } from "@/lib/catalog";

const loopSteps = [
  { icon: Compass, title: "Explore", copy: "Browse real and AI-made designs across categories." },
  { icon: Wand2, title: "Remix", copy: "Turn any pin into something personal with AI in seconds." },
  { icon: Sparkles, title: "Showcase", copy: "Publish to your own portfolio, public or just for followers." },
  { icon: ShoppingBag, title: "Get it made", copy: "Request the real thing from a verified creator or provider, digital or physical." }
];

async function getLandingContent() {
  const coreApiUrl = process.env.CORE_API_URL || "http://localhost:4100";
  try {
    const apiCategories = await fetchCategories(coreApiUrl);
    const apiDesigns = await fetchDesigns(coreApiUrl, { limit: 8 });
    if (apiCategories.length && apiDesigns.length) {
      return {
        categoryNames: apiCategories.map((c) => c.name),
        previewTiles: apiDesigns.map((d) => toTile(d, apiCategories))
      };
    }
  } catch {
    // core-api unavailable, fall through to seeded mock data
  }
  return { categoryNames: fallbackCategories, previewTiles: fallbackTiles.slice(0, 8) };
}

export default async function Home() {
  const { categoryNames, previewTiles } = await getLandingContent();
  return (
    <main className="overflow-hidden">
      <section className="relative min-h-[calc(100vh-96px)] overflow-hidden bg-[radial-gradient(circle_at_top_left,_rgba(232,178,58,0.08),_transparent_32%)] px-4 py-8 md:min-h-[calc(100vh-64px)] md:py-10">
        <img
          src="https://images.unsplash.com/photo-1636955816868-fcb881e57954?auto=format&fit=crop&w=2400&q=85"
          alt=""
          className="absolute inset-0 h-full w-full object-cover brightness-90 contrast-110 opacity-30"
        />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(8,11,16,0.94)_0%,rgba(10,14,20,0.84)_48%,rgba(12,18,26,0.72)_100%)]" />
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
              Most of design today is templates wearing different colors. We think your logo, your outfit, your
              invitation, your space should sound like you — not a preset. Explore thousands of designs, remix any
              of them with AI in seconds to make them personal, then get the real thing made by a creator who gets
              your story.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <EarlyAccess label="Try it free" />
              <Link href="/inspire" className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/8 px-5 py-3 text-sm font-semibold text-glass backdrop-blur-md transition hover:border-magenta hover:text-magenta">
                Explore the feed <ArrowUpRight size={16} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="border-y border-white/10 bg-[#080B10] px-4 py-5">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3">
          <p className="text-xs font-semibold uppercase text-muted">Already on the feed</p>
          <div className="flex flex-wrap gap-2">
            {categoryNames.map((category) => (
              <Link
                key={category}
                href={`/inspire?category=${encodeURIComponent(category)}`}
                className="rounded-full border border-white/10 bg-white/6 px-4 py-2 text-sm font-semibold transition hover:border-cyan/60 hover:bg-white/10"
              >
                {category}
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-[#080B10] px-4 py-14">
        <div className="mx-auto max-w-7xl">
          <div className="mb-8 max-w-2xl">
            <p className="text-sm font-semibold uppercase text-magenta">From taste to output</p>
            <h2 className="mt-3 text-3xl font-black md:text-5xl">Inspiration, AI, portfolios, and providers in one loop.</h2>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {loopSteps.map((step, index) => (
              <div key={step.title} className="rounded-card border border-white/10 bg-white/6 p-4">
                <span className="text-xs text-muted">0{index + 1}</span>
                <step.icon size={20} className="mt-4 text-cyan" />
                <h3 className="mt-3 text-xl font-semibold">{step.title}</h3>
                <p className="mt-2 text-sm text-white/64">{step.copy}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-[#0B0F14] px-4 py-14">
        <div className="mx-auto max-w-7xl">
          <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
            <h2 className="text-3xl font-black md:text-4xl">Live from the feed</h2>
            <Link href="/inspire" className="inline-flex items-center gap-2 text-sm font-semibold text-cyan hover:text-magenta">
              See the full feed <ArrowUpRight size={16} />
            </Link>
          </div>
          <div className="tile-grid">
            {previewTiles.map((tile) => (
              <FeedCard key={tile.id} tile={tile} />
            ))}
          </div>
        </div>
      </section>

      <section id="for-creators" className="border-y border-white/10 bg-[#080B10] px-4 py-14">
        <div className="mx-auto grid max-w-7xl gap-8 md:grid-cols-[1fr_1fr] md:items-center">
          <div>
            <p className="text-sm font-semibold uppercase text-cyan">For creators &amp; providers</p>
            <h2 className="mt-3 text-3xl font-black md:text-5xl">Turn your taste into a storefront.</h2>
            <ul className="mt-6 space-y-3 text-sm text-white/72 md:text-base">
              <li>Free portfolio and AI tools to make and show your work.</li>
              <li>Reach buyers already looking for custom, personalized work.</li>
              <li>A simple quote-and-order flow — no separate invoicing or marketing needed.</li>
            </ul>
            <div className="mt-8">
              <EarlyAccess label="Apply as a Creator/Provider" defaultRole="Provider" />
            </div>
          </div>
          <div className="rounded-panel border border-white/10 bg-white/6 p-6">
            <p className="text-sm font-semibold uppercase text-muted">Coming soon</p>
            <p className="mt-3 text-lg font-semibold">Creator spotlights and reviews will show up here once our pilot cohort ships.</p>
          </div>
        </div>
      </section>

      <section className="bg-[#0B0F14] px-4 py-16">
        <div className="mx-auto grid max-w-7xl gap-6 rounded-panel border border-white/10 bg-white/6 p-8 text-center md:p-14">
          <h2 className="text-3xl font-black md:text-5xl">Your story deserves more than a template.</h2>
          <div className="mx-auto flex flex-wrap justify-center gap-3">
            <EarlyAccess />
          </div>
        </div>
      </section>
    </main>
  );
}

