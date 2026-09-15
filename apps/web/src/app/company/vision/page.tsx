import Link from "next/link";
import { ArrowUpRight, Compass, Sparkles, Store } from "lucide-react";

const stages = [
  { icon: Compass, title: "Discover", copy: "Find the work, ideas, and visual language that feel like you." },
  { icon: Sparkles, title: "Make it yours", copy: "Use intelligent tools to turn a spark into a direction with your point of view." },
  { icon: Store, title: "Bring it to life", copy: "Share, commission, or build with people who know how to make it real." }
];

export default function VisionPage() {
  return <main className="mx-auto max-w-7xl px-4 py-20"><p className="text-sm font-semibold uppercase text-cyan">Our vision</p><h1 className="mt-4 max-w-4xl text-5xl font-black leading-[1.08] md:text-7xl">A more personal internet starts with what people make.</h1><p className="mt-8 max-w-2xl text-lg leading-8 text-white/70">ProductDesignOS is building the systems behind a world where ideas do not stop at inspiration. They become personal work, useful objects, and new ways for creators to earn.</p><div className="mt-16 grid gap-4 md:grid-cols-3">{stages.map(({ icon: Icon, title, copy }) => <article key={title} className="rounded-card border border-white/10 bg-white/6 p-6"><Icon className="text-cyan" size={24}/><h2 className="mt-8 text-2xl font-bold">{title}</h2><p className="mt-3 leading-6 text-muted">{copy}</p></article>)}</div><Link href="https://dooniq.com" className="mt-16 inline-flex items-center gap-2 rounded-full bg-glass px-6 py-3 font-semibold text-charcoal hover:bg-cyan">Explore Dooniq <ArrowUpRight size={17}/></Link></main>;
}