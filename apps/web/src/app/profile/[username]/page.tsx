import { inspireTiles } from "@/lib/mock-data";

export default function ProfilePage({ params }: { params: { username: string } }) {
  return (
    <main>
      <section className="relative min-h-[360px] overflow-hidden">
        <img src="https://picsum.photos/seed/nova-hero/1600/800" alt="" className="absolute inset-0 h-full w-full object-cover opacity-55" />
        <div className="absolute inset-0 bg-gradient-to-t from-charcoal via-charcoal/35 to-transparent" />
        <div className="relative mx-auto flex min-h-[360px] max-w-7xl flex-col justify-end px-4 pb-10">
          <span className="mb-3 w-fit rounded-full bg-cyan px-3 py-1 text-xs font-semibold uppercase text-charcoal">Student</span>
          <h1 className="text-5xl font-black">@{params.username}</h1>
          <p className="mt-3 max-w-xl text-muted">Identity systems with pulse.</p>
        </div>
      </section>
      <section className="mx-auto max-w-7xl px-4 py-10">
        <div className="grid gap-4 md:grid-cols-3">
          {inspireTiles.slice(0, 6).map((tile) => (
            <article key={tile.id} className="overflow-hidden rounded-card border border-white/10 bg-white/6">
              <img src={tile.image} alt="" className="h-64 w-full object-cover" />
              <div className="p-4">
                <h2 className="font-semibold">{tile.title}</h2>
                <p className="mt-1 text-sm text-muted">{tile.category}</p>
              </div>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
