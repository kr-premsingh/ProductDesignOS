import { NextResponse, type NextRequest } from "next/server";

const COMPANY_HOSTS = new Set(["productdesignos.com", "www.productdesignos.com"]);

export function middleware(request: NextRequest) {
  const hostname = request.headers.get("host")?.split(":")[0].toLowerCase();
  if (hostname && COMPANY_HOSTS.has(hostname) && request.nextUrl.pathname === "/") {
    const url = request.nextUrl.clone();
    url.pathname = "/company";
    return NextResponse.rewrite(url);
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/"],
};
