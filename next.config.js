/** @type {import('next').NextConfig} */
const nextConfig = {
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
