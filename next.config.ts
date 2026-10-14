import type { NextConfig } from "next";

// "/" (or empty) means the site is served from the domain root.
const basePath = (process.env.NEXT_PUBLIC_BASE_PATH ?? "").replace(/\/+$/, "");

const nextConfig: NextConfig = {
  // Fully static site: `next build` writes plain HTML/JS/CSS to ./out.
  output: "export",
  // GitHub Pages serves project sites from /<repo>; the workflow sets this.
  basePath: basePath || undefined,
  env: { NEXT_PUBLIC_BASE_PATH: basePath },
  images: { unoptimized: true },
  trailingSlash: true,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
