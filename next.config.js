/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  eslint: {
    // Disable ESLint during builds to avoid blocking production on lint errors
    ignoreDuringBuilds: true,
  },
};

const isDev = process.env.NODE_ENV === "development";

const withPWA = require("next-pwa")({
  dest: "public",
  disable: isDev && process.env.NEXT_PUBLIC_ENABLE_PWA !== "true",
  register: true,
  skipWaiting: true,
});

module.exports = withPWA(nextConfig);
