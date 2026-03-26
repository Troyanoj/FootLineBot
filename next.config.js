/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  typescript: {
    ignoreBuildErrors: true,
  },
  // Disable static page generation to avoid timeout issues
  output: 'standalone',
  // Increase timeout for static page generation
  staticPageGenerationTimeout: 180,
};

module.exports = nextConfig;
