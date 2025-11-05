/** @type {import('next').NextConfig} */
const nextConfig = {
  // Railway 需要監聽 0.0.0.0
  // 並且使用環境變數中的 PORT
  experimental: {
    serverComponentsExternalPackages: ['@prisma/client', '@prisma/engines'],
    serverActions: {
      allowedOrigins: ['*'],
      bodySizeLimit: '2mb',
    },
  },
  webpack: (config, { isServer }) => {
    if (isServer) {
      config.externals.push('@prisma/client', '@prisma/engines');
    }
    return config;
  },
  typescript: {
    ignoreBuildErrors: true, // Temporary: until prisma generate is run
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  // 使用 standalone 輸出模式
  output: 'standalone',
};

module.exports = nextConfig;
