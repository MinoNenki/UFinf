/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  async rewrites() {
    return [
      { source: '/dashboard', destination: '/' },
      { source: '/dashboard/:path*', destination: '/' },
    ];
  },
};
export default nextConfig;
