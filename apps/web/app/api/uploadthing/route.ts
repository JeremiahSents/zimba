import { createRouteHandler } from "uploadthing/next"
import { env } from "@/core/shared/env"
import { ourFileRouter } from "./core"

export const { GET, POST } = createRouteHandler({
  router: ourFileRouter,
  config: {
    token: env.UPLOADTHING_TOKEN,
  },
})
