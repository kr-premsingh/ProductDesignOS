import { trends } from "@/lib/mock-data";

export default function DesignTrendsPage() {
  return (
    <main className="mx-auto max-w-7xl px-4 py-10">
      <p className="text-sm font-semibold uppercase text-cyan">Design trends</p>
      <h1 className="mt-2 max-w-3xl text-4xl font-black">Systems worth studying, remixing, and making personal.</h1>
      <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {trends.map((trend) => (
          <article key={trend.id} className="overflow-hidden rounded-card border border-white/10 bg-white/6">
            <img src={trend.image} alt="" className="h-44 w-full object-cover" />
            <div className="p-4">
              <h2 className="text-xl font-semibold">{trend.title}</h2>
              <p className="mt-2 text-sm text-muted">{trend.summary}</p>
              <div className="mt-4 flex flex-wrap gap-2">
                {trend.keywords.map((keyword) => (
                  <span key={keyword} className="rounded-full bg-white/10 px-2 py-1 text-xs text-muted">{keyword}</span>
                ))}
              </div>
            </div>
          </article>
        ))}
      </div>
    </main>
  );
}
