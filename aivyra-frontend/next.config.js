/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Output export for Capacitor static builds
  output: "export",
  images: {
    unoptimized: true,
  },
  // Disable linting/type-checking during build for faster deploys
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
};

module.exports = nextConfig;
