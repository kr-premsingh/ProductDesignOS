import { ArrowUpRight, Compass, HeartHandshake, Sparkles, UsersRound } from "lucide-react";

const principles = [
  { icon: Compass, title: "Taste is a starting point", copy: "We build systems that begin with what matters to you, not a template library." },
  { icon: Sparkles, title: "AI should feel personal", copy: "The point is not more output. It is work that speaks in your voice." },
  { icon: HeartHandshake, title: "Craft stays human", copy: "Technology expands possibility; creators and providers bring it to life." }
];

export const metadata = {
  title: "ProductDesignOS | Design for individuality",
  description: "The company behind Dooniq, a remix-first design platform for personal expression."
};

export default function CompanyPage() {
  return (
    <main className="overflow-hidden">
      <section className="relative min-h-[calc(100vh-64px)] overflow-hidden px-4 py-16 md:py-24">
        <img src="/hero-image.png" alt="A creative workspace at night" className="hero-image absolute inset-0 h-full w-full object-cover object-[62%_center] brightness-[0.55] saturate-[0.72]" />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(6,9,14,0.94)_0%,rgba(7,10,15,0.72)_54%,rgba(7,10,15,0.3)_100%)]" />
        <div className="relative mx-auto flex min-h-[calc(100vh-190px)] max-w-7xl items-center">
          <div className="max-w-3xl">
            <p className="text-sm font-semibold uppercase text-cyan">ProductDesignOS</p>
            <h1 className="mt-5 text-5xl font-black leading-[1.06] md:text-7xl">Building a world beyond templates.</h1>
            <p className="mt-7 max-w-2xl text-lg leading-8 text-white/75 md:text-xl">We are building the operating system for individuality: tools, networks, and marketplaces that help people make their taste visible, useful, and uniquely their own.</p>
            <a href="https://dooniq.com" className="mt-9 inline-flex items-center gap-2 rounded-full bg-glass px-6 py-3 text-sm font-semibold text-charcoal transition hover:bg-cyan">Explore Dooniq <ArrowUpRight size={17} /></a>
          </div>
        </div>
      </section>

      <section id="mission" className="bg-[#080B10] px-4 py-20">
        <div className="mx-auto max-w-7xl">
          <p className="text-sm font-semibold uppercase text-magenta">Why we exist</p>
          <h2 className="mt-3 max-w-3xl text-3xl font-black md:text-5xl">The things people make should carry more of who they are.</h2>
          <div className="mt-12 grid gap-4 md:grid-cols-3">
            {principles.map(({ icon: Icon, title, copy }) => <article key={title} className="rounded-card border border-white/10 bg-white/6 p-6"><Icon size={22} className="text-cyan" /><h3 className="mt-6 text-xl font-semibold">{title}</h3><p className="mt-3 text-sm leading-6 text-muted">{copy}</p></article>)}
          </div>
        </div>
      </section>

      <section id="team" className="border-y border-white/10 bg-[#0B0F14] px-4 py-20">
        <div className="mx-auto grid max-w-7xl gap-10 md:grid-cols-[1.2fr_0.8fr] md:items-center">
          <div><p className="text-sm font-semibold uppercase text-cyan">The product</p><h2 className="mt-3 text-3xl font-black md:text-5xl">Meet Dooniq.</h2><p className="mt-5 max-w-xl text-lg leading-8 text-white/70">Dooniq is where inspiration becomes action: discover the work you love, remix it with AI, share it, or collaborate with someone who can make it real.</p><a href="https://dooniq.com" className="mt-7 inline-flex items-center gap-2 text-sm font-semibold text-cyan hover:text-magenta">Enter the product <ArrowUpRight size={16} /></a></div>
          <div className="rounded-panel border border-white/10 bg-white/6 p-7"><UsersRound size={28} className="text-magenta" /><p className="mt-6 text-2xl font-semibold">For people making a personal mark, and the people who help them make it.</p><p className="mt-4 text-sm leading-6 text-muted">Individuals, students, creators, communities, providers, and brands.</p></div>
        </div>
      </section>

      <section id="partners" className="bg-[#080B10] px-4 py-20">
        <div className="mx-auto grid max-w-7xl gap-8 md:grid-cols-[1fr_0.8fr] md:items-end">
          <div><p className="text-sm font-semibold uppercase text-magenta">Partners &amp; early teams</p><h2 className="mt-3 text-3xl font-black md:text-5xl">Help shape the first generation of Dooniq.</h2><p className="mt-5 max-w-2xl text-lg leading-8 text-white/70">We are looking for creators, maker communities, studios, and brands who believe personal expression should be easier to make real.</p></div>
          <a href="https://dooniq.com" className="inline-flex items-center justify-center gap-2 rounded-full border border-white/20 px-6 py-3 text-sm font-semibold text-white transition hover:border-cyan hover:text-cyan">Explore the product <ArrowUpRight size={17} /></a>
        </div>
      </section>
    </main>
  );
}
