/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // We can turn off linting during build for faster setup
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  }
};

module.exports = nextConfig;
