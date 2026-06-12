/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  allowedDevOrigins: ['127.0.0.1', 'localhost'],
  webpack(config, { dev }) {
    // Avoid flaky filesystem cache errors in local Windows dev sessions.
    if (dev) {
      config.cache = false;
    }
    return config;
  },
  async rewrites() {
    return [
      { source: '/dashboard', destination: '/' },
      { source: '/dashboard/:path*', destination: '/' },
    ];
  },
};
export default nextConfig;
