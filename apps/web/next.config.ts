import { resolve } from "node:path"
import { config } from "dotenv"
import type { NextConfig } from "next"

config({ path: resolve(__dirname, "../../.env") })

const nextConfig: NextConfig = {
  allowedDevOrigins: ["harmonically-carpetless-janna.ngrok-free.dev"],
  transpilePackages: ["@workspace/ui", "@workspace/transactional"],
  /**
   * pdfkit resolves its font-metric (.afm) files from disk at runtime. Bundling
   * them yields `ENOENT … Helvetica.afm` the first time a PDF is rendered, so
   * @react-pdf/renderer has to stay an external require on the server.
   */
  serverExternalPackages: ["@react-pdf/renderer"],
}

export default nextConfig
