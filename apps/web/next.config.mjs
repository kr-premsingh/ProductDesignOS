/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ["@productdesignos/ui"],
  images: {
    remotePatterns: [{ protocol: "https", hostname: "picsum.photos" }]
  },
  // apps/web has no /api route handlers of its own — proxy relative /api/* calls
  // (auth, waitlist, saves/likes) to the Fastify API so client code can keep using
  // same-origin fetches without CORS or hardcoding a host.
  async rewrites() {
    const apiUrl = process.env.API_URL || process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";
    const coreApiUrl = process.env.CORE_API_URL || "http://localhost:4100";
    return [
      { source: "/api/:path*", destination: `${apiUrl}/api/:path*` },
      { source: "/core-api/:path*", destination: `${coreApiUrl}/:path*` }
    ];
  }
};

export default nextConfig;
