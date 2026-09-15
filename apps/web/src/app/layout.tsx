import type { Metadata } from "next";
import { headers } from "next/headers";
import "./globals.css";
import { SiteNav } from "@/components/site-nav";
import { CompanyNav } from "@/components/company-nav";
import { AuthProvider } from "@/lib/auth";

export const metadata: Metadata = {
  title: "Dooniq",
  description: "Make inspiration uniquely yours."
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const hostname = headers().get("host")?.split(":")[0].toLowerCase();
  const isCompanySite = hostname === "productdesignos.com" || hostname === "www.productdesignos.com";
  return (
    <html lang="en">
      <body className="min-h-screen bg-[var(--surface)] text-white">
        {isCompanySite ? <><CompanyNav />{children}</> : <AuthProvider><SiteNav /><main className="min-h-screen pb-28">{children}</main></AuthProvider>}
      </body>
    </html>
  );
}
