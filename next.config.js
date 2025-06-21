/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "export",
  reactStrictMode: true,
  images: {
    unoptimized: true,
  },
  // This helps with routing in Capacitor
  assetPrefix: "",
  trailingSlash: true,
};

module.exports = nextConfig;
