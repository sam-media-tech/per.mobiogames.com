/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,

  // The live portfolio URLs carry a trailing slash (/es/pricing/) but the live LP does NOT
  // (/xkh55). The ad destination is /xkh55 exactly, and the Google Ads account is suspended,
  // so neither form may change. trailingSlash alone would force /xkh55 -> /xkh55/, so we take
  // slash policy away from Next and apply it per-path in middleware.ts instead.
  trailingSlash: true,
  skipTrailingSlashRedirect: true,

  // Static preview builds have no image optimizer, so next/image must emit plain
  // <img src="/games/…webp"> instead of /_next/image?url=… — otherwise every tile
  // 404s on S3 and the catalogue renders empty. The files are already the exact
  // sizes we serve, so nothing is lost by skipping optimisation.
  images: { unoptimized: process.env.NEXT_PUBLIC_DEMO_MODE === '1' },
};

export default nextConfig;
