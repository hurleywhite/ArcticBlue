/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // typedRoutes disabled — re-enable once we're past scaffolding. It forces
  // every Link href to be a literal app route, which breaks generic reusable
  // components that take an href prop from data.
};

export default nextConfig;
