import { Mail } from "lucide-react";

export default function ContactPage() {
  return <main className="mx-auto max-w-5xl px-4 py-20"><p className="text-sm font-semibold uppercase text-cyan">Contact</p><h1 className="mt-4 text-5xl font-black leading-[1.08] md:text-7xl">Let’s make something more personal.</h1><p className="mt-8 max-w-2xl text-lg leading-8 text-white/70">For partnerships, creator communities, press, or early access, send us a note.</p><a href="mailto:hello@productdesignos.com" className="mt-10 inline-flex items-center gap-3 rounded-panel border border-white/15 bg-white/6 px-6 py-4 text-lg font-semibold hover:border-cyan hover:text-cyan"><Mail size={20}/> hello@productdesignos.com</a></main>;
}