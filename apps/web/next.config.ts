import { resolve } from "node:path"
import { config } from "dotenv"
import type { NextConfig } from "next"

config({ path: resolve(__dirname, "../../.env") })

const nextConfig: NextConfig = {
  allowedDevOrigins: ["harmonically-carpetless-janna.ngrok-free.dev"],
  transpilePackages: ["@workspace/ui", "@workspace/transactional"],
}

export default nextConfig
