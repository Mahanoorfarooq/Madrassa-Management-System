/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  eslint: {
    // Disable ESLint during builds to avoid blocking production on lint errors
    ignoreDuringBuilds: true,
  },
};

module.exports = nextConfig;
