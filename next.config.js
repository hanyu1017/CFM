/** @type {import('next').NextConfig} */
const nextConfig = {
<<<<<<< HEAD
  // Railway 需要監聽 0.0.0.0
  // 並且使用環境變數中的 PORT
  experimental: {
    serverActions: {
      allowedOrigins: ['*'],
    },
  },
  // 輸出配置
  output: 'standalone',
}

module.exports = nextConfig
=======
  experimental: {
    serverComponentsExternalPackages: ['@prisma/client', '@prisma/engines'],
    serverActions: {
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
    ignoreBuildErrors: false,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  // 使用 standalone 输出模式
  output: 'standalone',
};

module.exports = nextConfig;
>>>>>>> 4f39a8f20331644b02e01938e7a5447b7abd172a
