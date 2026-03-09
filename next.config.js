const path = require('path')

/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config) => {
    // Bypass the package exports field — resolves 'unicornstudio-react/next'
    // on Vercel where subpath exports in the exports map fail to resolve
    config.resolve.alias['unicornstudio-react/next'] =
      path.resolve(__dirname, 'node_modules/unicornstudio-react/dist/next.js')
    return config
  },
}

module.exports = nextConfig
