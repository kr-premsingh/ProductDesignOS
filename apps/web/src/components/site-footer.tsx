import Link from "next/link";
import { Instagram, Twitter, Youtube, Music2, Pin } from "lucide-react";
import { Logomark } from "@/components/logo";

const exploreLinks = [
  { label: "Explore", href: "/explore" },
  { label: "Studio", href: "/studio" },
  { label: "Marketplace", href: "/marketplace" },
  { label: "Design trends", href: "/design-trends" }
];

const companyLinks = [
  { label: "About", href: "/about" },
  { label: "Become a provider", href: "/provider/onboard" },
  { label: "Company", href: "/company" }
];

const legalLinks = [
  { label: "Privacy Policy", href: "/privacy" },
  { label: "Terms of Service", href: "/terms" }
];

const socials = [
  { label: "Pinterest", href: "https://www.pinterest.com/dooniq", icon: Pin },
  { label: "Instagram", href: "https://www.instagram.com/dooniq", icon: Instagram },
  { label: "TikTok", href: "https://www.tiktok.com/@dooniq", icon: Music2 },
  { label: "X", href: "https://x.com/dooniq", icon: Twitter },
  { label: "YouTube", href: "https://www.youtube.com/@dooniq", icon: Youtube }
];

export function SiteFooter() {
  return (
    <footer className="border-t border-black/[0.07] bg-white text-[#1d1d1f]">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16">
        <div className="grid gap-10 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
          <div>
            <Link href="/" className="flex items-center gap-2 text-sm font-semibold">
              <span className="grid h-10 w-10 place-items-center rounded-2xl border border-black/[0.08] bg-white shadow-sm">
                <Logomark size={18} />
              </span>
              Dooniq
            </Link>
            <p className="mt-4 max-w-xs text-sm leading-6 text-black/50">
              The inspiration marketplace. See it, remix it, make it yours.
            </p>
            <div className="mt-5 flex gap-2">
              {socials.map(({ label, href, icon: Icon }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="grid h-10 w-10 place-items-center rounded-full border border-black/[0.1] bg-white text-black/60 shadow-sm transition hover:border-black hover:text-black"
                >
                  <Icon size={16} strokeWidth={1.8} />
                </a>
              ))}
            </div>
          </div>

          <nav aria-label="Explore">
            <h3 className="text-xs font-bold uppercase tracking-[0.18em] text-black/40">Explore</h3>
            <ul className="mt-4 space-y-2.5">
              {exploreLinks.map(({ label, href }) => (
                <li key={href}><Link href={href} className="text-sm text-black/60 transition hover:text-black">{label}</Link></li>
              ))}
            </ul>
          </nav>

          <nav aria-label="Company">
            <h3 className="text-xs font-bold uppercase tracking-[0.18em] text-black/40">Company</h3>
            <ul className="mt-4 space-y-2.5">
              {companyLinks.map(({ label, href }) => (
                <li key={href}><Link href={href} className="text-sm text-black/60 transition hover:text-black">{label}</Link></li>
              ))}
            </ul>
          </nav>

          <nav aria-label="Legal">
            <h3 className="text-xs font-bold uppercase tracking-[0.18em] text-black/40">Legal</h3>
            <ul className="mt-4 space-y-2.5">
              {legalLinks.map(({ label, href }) => (
                <li key={href}><Link href={href} className="text-sm text-black/60 transition hover:text-black">{label}</Link></li>
              ))}
            </ul>
          </nav>
        </div>

        <div className="mt-12 flex flex-col gap-3 border-t border-black/[0.07] pt-6 text-xs text-black/40 sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} Dooniq. All rights reserved.</p>
          <p>Made for people with taste.</p>
        </div>
      </div>
    </footer>
  );
}
