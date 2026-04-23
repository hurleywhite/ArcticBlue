/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  async redirects() {
    return [
      // Old Lab-buyer framing → sales-team framing
      { source: "/dashboard", destination: "/workbench", permanent: false },
      { source: "/between-sessions", destination: "/showcase", permanent: false },
      { source: "/lab", destination: "/showcase/lab", permanent: false },
      { source: "/news", destination: "/workbench", permanent: false },

      // Old index pages → Library (keep detail routes working in place)
      { source: "/learning", destination: "/library", permanent: false },
      { source: "/learning/path", destination: "/library", permanent: false },
      { source: "/use-cases", destination: "/library", permanent: false },
      { source: "/tools", destination: "/library", permanent: false },
      { source: "/tools/prompts", destination: "/library", permanent: false },
      { source: "/tools/templates", destination: "/library", permanent: false },
      { source: "/resources", destination: "/library", permanent: false },

      // Practice sandbox now lives under Showcase (but the canonical
      // chat UI is /tools/practice, preserved for direct links).
      { source: "/canvas/next", destination: "/showcase/canvas", permanent: false },
    ];
  },
};

export default nextConfig;
