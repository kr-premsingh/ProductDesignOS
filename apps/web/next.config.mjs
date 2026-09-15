/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ["@productdesignos/ui"],
  images: {
    remotePatterns: [{ protocol: "https", hostname: "picsum.photos" }]
  },
  // apps/web has no /api route handlers of its own — proxy relative /api/* calls
  // (auth, waitlist, saves/likes) to the Fastify API so client code can keep using
  // same-origin fetches without CORS or hardcoding a host.
  // Product requests stay same-origin and are proxied to the Rust core API.
  async rewrites() {
    const coreApiUrl = process.env.CORE_API_URL || "http://localhost:4100";
    return [
      { source: "/core-api/:path*", destination: `${coreApiUrl}/:path*` }
    ];
  }
};

export default nextConfig;
