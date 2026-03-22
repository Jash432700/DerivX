/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ['react-plotly.js', 'plotly.js-dist-min'],
}

module.exports = nextConfig
