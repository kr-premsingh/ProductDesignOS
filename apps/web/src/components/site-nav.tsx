"use client";
import Link from "next/link";
import { useState } from "react";
import { Compass, TrendingUp, Play, Info, User } from "lucide-react";
import { useAuth } from "@/lib/auth";
import AuthModal from "@/components/auth-modal";
import { Logomark } from "@/components/logo";

const links = [
  { label: "Inspire", href: "/inspire", icon: Compass },
  { label: "Trends", href: "/design-trends", icon: TrendingUp },
  { label: "Demo", href: "/app/demo/logo", icon: Play },
  { label: "For Creators", href: "/#for-creators", icon: Info },
  { label: "About", href: "/about", icon: Info }
];

export function SiteNav() {
  return <SiteNavInner />;
}

function SiteNavInner() {
  const { user, logout } = useAuth();
  const [openAuth, setOpenAuth] = useState(false);
  return (
    <>
      <header className="sticky top-0 z-40 border-b border-white/10 bg-[rgba(7,11,20,0.78)] shadow-[0_1px_0_rgba(255,255,255,0.05)] backdrop-blur-xl">
        <nav className="mx-auto flex max-w-7xl flex-wrap items-center gap-3 px-4 py-3 md:flex-nowrap md:justify-between">
          <Link href="/" className="flex min-w-0 flex-1 items-center gap-2 text-sm font-semibold md:flex-none">
            <span className="grid h-10 w-10 place-items-center rounded-2xl border border-cyan/25 bg-cyan/12 text-cyan shadow-glow">
              <Logomark size={18} />
            </span>
            <span className="truncate text-white">ProductDesignOS</span>
          </Link>

          <div className="hidden items-center gap-6 text-sm text-white/70 md:flex">
            {links.map(({ label, href }) => (
              <Link key={href} href={href} className="rounded-full px-3 py-2 transition hover:bg-white/10 hover:text-white">
                {label}
              </Link>
            ))}
          </div>

          <div className="flex items-center gap-2">
            {user ? (
              <>
                <Link href={`/profile/${user.username}`} className="flex shrink-0 items-center gap-2 rounded-full border border-white/12 bg-white/5 px-3 py-2 text-sm text-white shadow-sm transition hover:border-cyan/60 hover:bg-white/10 hover:text-cyan">
                  <User size={16} />
                  <span className="hidden md:inline">Profile</span>
                </Link>
                <button onClick={() => logout()} className="rounded-full px-3 py-2 text-sm text-white/70 hover:bg-white/6">Sign out</button>
              </>
            ) : (
              <>
                <button onClick={() => setOpenAuth(true)} className="rounded-full border border-white/12 bg-white/5 px-3 py-2 text-sm text-white shadow-sm hover:bg-white/10">Sign in</button>
              </>
            )}
          </div>
        </nav>
      </header>

      <nav className="fixed bottom-4 left-1/2 z-50 flex w-[calc(100%-2rem)] -translate-x-1/2 items-center justify-between gap-1 rounded-3xl border border-white/10 bg-[rgba(10,14,20,0.88)] p-2 text-white/80 shadow-[0_24px_80px_rgba(0,0,0,0.25)] backdrop-blur-2xl md:hidden">
        {links.map(({ label, href, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className="flex min-w-0 flex-1 flex-col items-center justify-center rounded-2xl px-2 py-2 text-xs font-medium transition hover:bg-white/10 hover:text-white"
          >
            <Icon size={18} />
            <span className="mt-1">{label}</span>
          </Link>
        ))}
        {user ? (
          <Link href={`/profile/${user.username}`} className="flex min-w-0 flex-1 flex-col items-center justify-center rounded-2xl px-2 py-2 text-xs font-medium transition hover:bg-white/10 hover:text-white">
            <User size={18} />
            <span className="mt-1">Profile</span>
          </Link>
        ) : (
          <button onClick={() => setOpenAuth(true)} className="flex min-w-0 flex-1 flex-col items-center justify-center rounded-2xl px-2 py-2 text-xs font-medium transition hover:bg-white/10 hover:text-white">
            <User size={18} />
            <span className="mt-1">Sign in</span>
          </button>
        )}
      </nav>

      <AuthModal open={openAuth} onClose={() => setOpenAuth(false)} />
    </>
  );
}
