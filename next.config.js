/** @type {import('next').NextConfig} */
const nextConfig = {
  basePath: '/libraries',
  reactStrictMode: true,
  images: {
    domains: ['api.mapbox.com'],
  },
}

module.exports = nextConfig
