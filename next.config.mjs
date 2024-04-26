/** @type {import('next').NextConfig} */

const nextConfig = {
  images: {
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
      },
      {
        protocol: "https",
        hostname: "eu-west-1.storage.xata.sh",
      },
    ],
  },
};

export default nextConfig;
