/** @type {import('next').NextConfig} */
const nextConfig = {
  // Remove or comment out the 'export' option
  // output: 'export',
  
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: { unoptimized: true },
};

module.exports = nextConfig;
