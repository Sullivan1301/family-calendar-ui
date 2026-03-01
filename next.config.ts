import type { NextConfig } from "next";
import path from "node:path";

const LOADER = path.resolve(process.cwd(), 'src/visual-edits/component-tagger-loader.js');

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
      {
        protocol: 'http',
        hostname: '**',
      },
    ],
  },
  outputFileTracingRoot: path.resolve(__dirname, '../../'),
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  webpack: (config) => {
    config.module.rules.push({
      test: /\.(jsx|tsx)$/,
      use: [
        {
          loader: LOADER,
        },
      ],
    });
    return config;
  },
};

export default nextConfig;
// Orchids restart: 1772367862927
