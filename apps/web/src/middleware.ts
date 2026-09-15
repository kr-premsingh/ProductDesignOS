import { NextResponse, type NextRequest } from "next/server";

const COMPANY_HOSTS = new Set(["productdesignos.com", "www.productdesignos.com"]);
const COMPANY_ROUTES: Record<string, string> = {
  "/": "/company",
  "/vision": "/company/vision",
  "/about": "/company/about",
  "/contact": "/company/contact"
};

export function middleware(request: NextRequest) {
  const hostname = request.headers.get("host")?.split(":")[0].toLowerCase();
  const companyRoute = COMPANY_ROUTES[request.nextUrl.pathname];
  if (hostname && COMPANY_HOSTS.has(hostname) && companyRoute) {
    const url = request.nextUrl.clone();
    url.pathname = companyRoute;
    return NextResponse.rewrite(url);
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/", "/vision", "/about", "/contact"],
};
