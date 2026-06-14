export default function AboutPage() {
  return (
    <main className="mx-auto max-w-4xl px-4 py-16">
      <p className="text-sm font-semibold uppercase text-cyan">About</p>
      <h1 className="mt-2 text-5xl font-black">Design that knows you.</h1>
      <p className="mt-6 text-lg leading-8 text-muted">
        ProductDesignOS connects AI-assisted exploration with human craft, curated inspiration, and provider fulfillment.
        The MVP is focused on showing how personal taste can become real visual output fast.
      </p>
      <div className="mt-10 grid gap-4 md:grid-cols-3">
        {["Students", "Influencers", "Providers"].map((role) => (
          <div key={role} className="glass-panel rounded-card p-4">
            <h2 className="font-semibold">{role}</h2>
            <p className="mt-2 text-sm text-muted">A role-aware path from taste to portfolio-ready work.</p>
          </div>
        ))}
      </div>
    </main>
  );
}
