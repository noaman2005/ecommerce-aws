import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "ui-avatars.com",
      },
    ],
    // Allow loading images from the S3 bucket used for product images
    domains: [
      'ecommerce-product-images-420.s3.us-east-1.amazonaws.com',
    ],
  },
};

export default nextConfig;
