/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ["@productdesignos/ui"],
  images: {
    remotePatterns: [{ protocol: "https", hostname: "picsum.photos" }]
  }
};

export default nextConfig;
