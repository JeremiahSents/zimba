import type { NextConfig } from "next"

const nextConfig: NextConfig = {
  allowedDevOrigins: ["harmonically-carpetless-janna.ngrok-free.dev"],
  transpilePackages: ["@workspace/ui", "@workspace/transactional"],
}

export default nextConfig
