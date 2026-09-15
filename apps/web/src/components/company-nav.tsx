import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { Logomark } from "@/components/logo";

export function CompanyNav() {
  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-[rgba(7,11,20,0.84)] backdrop-blur-xl">
      <nav className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3">
        <Link href="/" className="flex items-center gap-2 text-sm font-semibold">
          <span className="grid h-10 w-10 place-items-center rounded-2xl border border-cyan/25 bg-cyan/12 shadow-glow"><Logomark size={18} /></span>
          <span>ProductDesignOS</span>
        </Link>
        <div className="hidden items-center gap-5 text-sm text-white/70 md:flex">
          <Link href="/#mission" className="hover:text-white">About</Link>
          <Link href="/#team" className="hover:text-white">Team</Link>
          <Link href="/#partners" className="hover:text-white">Partners</Link>
        </div>
        <a href="https://dooniq.com" className="inline-flex items-center gap-2 rounded-full bg-glass px-4 py-2 text-sm font-semibold text-charcoal transition hover:bg-cyan">
          Explore Dooniq <ArrowUpRight size={16} />
        </a>
      </nav>
    </header>
  );
}
