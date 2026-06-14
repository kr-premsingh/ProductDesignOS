import Link from "next/link";
import { Sparkles } from "lucide-react";

const links = [
  ["Inspire", "/inspire"],
  ["Trends", "/design-trends"],
  ["Demo", "/app/demo/logo"],
  ["About", "/about"]
];

export function SiteNav() {
  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-charcoal/78 backdrop-blur-xl">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
        <Link href="/" className="flex items-center gap-2 text-sm font-semibold">
          <span className="grid h-8 w-8 place-items-center rounded-card bg-cyan text-charcoal">
            <Sparkles size={17} />
          </span>
          ProductDesignOS
        </Link>
        <div className="hidden items-center gap-6 text-sm text-muted md:flex">
          {links.map(([label, href]) => (
            <Link key={href} href={href} className="transition hover:text-glass">
              {label}
            </Link>
          ))}
        </div>
        <Link href="/provider/onboard" className="rounded-full border border-white/15 px-4 py-2 text-sm transition hover:border-cyan hover:text-cyan">
          Provider
        </Link>
      </nav>
    </header>
  );
}
