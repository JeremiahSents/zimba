import { createRouteHandler } from "uploadthing/next"
import { ourFileRouter } from "./core"
import { env } from "@/core/shared/env"

export const { GET, POST } = createRouteHandler({
  router: ourFileRouter,
  config: {
    token: env.UPLOADTHING_TOKEN,
  },
})
