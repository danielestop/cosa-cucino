/** @type {import('next').NextConfig} */
const nextConfig = {
  output: process.env.NODE_ENV === 'production' ? 'export' : undefined,
  basePath: process.env.NODE_ENV === 'production' ? '/cosa-cucino' : '',
  images: {
    unoptimized: true,
  },
  trailingSlash: true,
};

export default nextConfig;