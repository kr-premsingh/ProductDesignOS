import type { Metadata } from "next";
import "./globals.css";
import { SiteNav } from "@/components/site-nav";
import { AuthProvider } from "@/lib/auth";

export const metadata: Metadata = {
  title: "ProductDesignOS",
  description: "AI and human craft for designs that feel like you."
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-[var(--surface)] text-white">
        <AuthProvider>
          <SiteNav />
          <main className="min-h-screen pb-28">
            {children}
          </main>
        </AuthProvider>
      </body>
    </html>
  );
}
