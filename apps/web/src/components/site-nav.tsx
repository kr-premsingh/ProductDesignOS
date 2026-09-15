"use client";
import Link from "next/link";
import { useState } from "react";
import { Compass, User, ShoppingBag, House, WandSparkles } from "lucide-react";
import { useAuth } from "@/lib/auth";
import AuthModal from "@/components/auth-modal";
import { Logomark } from "@/components/logo";

const links = [
  { label: "Explore", href: "/", icon: Compass },
  { label: "Studio", href: "/studio", icon: WandSparkles },
  { label: "Marketplace", href: "/marketplace", icon: ShoppingBag },
  { label: "Become a provider", href: "/provider/onboard", icon: User }
];

const mobileLinks = [
  { label: "Home", href: "/", icon: House },
  { label: "Inspire", href: "/inspire", icon: Compass },
  { label: "Studio", href: "/studio", icon: WandSparkles },
  { label: "Market", href: "/marketplace", icon: ShoppingBag }
];

export function SiteNav() {
  return <SiteNavInner />;
}

function SiteNavInner() {
  const { user, logout } = useAuth();
  const [openAuth, setOpenAuth] = useState(false);
  return (
    <>
      <header className="sticky top-0 z-40 border-b border-black/[0.07] bg-[rgba(250,250,252,0.86)] shadow-[0_1px_0_rgba(0,0,0,0.03)] backdrop-blur-xl">
        <nav className="mx-auto flex max-w-7xl flex-wrap items-center gap-3 px-4 py-3 md:flex-nowrap md:justify-between">
          <Link href="/" className="flex min-w-0 flex-1 items-center gap-2 text-sm font-semibold text-[#1d1d1f] md:flex-none">
            <span className="grid h-10 w-10 place-items-center rounded-2xl border border-black/[0.08] bg-white shadow-sm">
              <Logomark size={18} />
            </span>
            <span className="truncate text-[#1d1d1f]">Dooniq</span>
          </Link>

          <div className="hidden items-center gap-2 text-sm text-black/60 md:flex">
            {links.map(({ label, href }) => (
              <Link key={href} href={href} className="rounded-full px-3 py-2 transition hover:bg-black/[0.05] hover:text-black">
                {label}
              </Link>
            ))}
          </div>

          <div className="flex items-center gap-2">
            {user ? (
              <>
                <Link href={`/profile/${user.username}`} className="flex shrink-0 items-center gap-2 rounded-full border border-black/[0.1] bg-white px-3 py-2 text-sm text-[#1d1d1f] shadow-sm transition hover:border-cyan hover:text-cyan">
                  <User size={16} />
                  <span className="hidden md:inline">Profile</span>
                </Link>
                <button onClick={() => logout()} className="rounded-full px-3 py-2 text-sm text-black/60 hover:bg-black/[0.05]">Sign out</button>
              </>
            ) : (
              <>
                <button onClick={() => setOpenAuth(true)} className="rounded-full border border-black/[0.1] bg-white px-3 py-2 text-sm text-[#1d1d1f] shadow-sm hover:border-cyan">Sign in</button>
              </>
            )}
          </div>
        </nav>
      </header>

      <nav className="fixed bottom-3 left-1/2 z-50 flex h-16 w-[calc(100%-1.5rem)] max-w-sm -translate-x-1/2 items-stretch justify-between gap-1 rounded-[22px] border border-black/[0.08] bg-[rgba(255,255,255,0.92)] px-2 py-1.5 text-black/60 shadow-[0_18px_55px_rgba(0,0,0,0.16)] backdrop-blur-2xl md:hidden">
        {mobileLinks.map(({ label, href, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            aria-label={label}
            className="flex min-w-0 flex-1 flex-col items-center justify-center rounded-2xl px-1 py-1 text-[10px] font-medium leading-none transition hover:bg-black/[0.05] hover:text-black"
          >
            <Icon size={18} strokeWidth={1.8} />
            <span className="mt-1">{label}</span>
          </Link>
        ))}
        {user ? (
          <Link href={`/profile/${user.username}`} aria-label="Account" className="flex min-w-0 flex-1 flex-col items-center justify-center rounded-2xl px-1 py-1 text-[10px] font-medium leading-none transition hover:bg-black/[0.05] hover:text-black">
            <User size={18} strokeWidth={1.8} />
            <span className="mt-1">Account</span>
          </Link>
        ) : (
          <button onClick={() => setOpenAuth(true)} aria-label="Account" className="flex min-w-0 flex-1 flex-col items-center justify-center rounded-2xl px-1 py-1 text-[10px] font-medium leading-none transition hover:bg-black/[0.05] hover:text-black">
            <User size={18} strokeWidth={1.8} />
            <span className="mt-1">Account</span>
          </button>
        )}
      </nav>

      <AuthModal open={openAuth} onClose={() => setOpenAuth(false)} />
    </>
  );
}
