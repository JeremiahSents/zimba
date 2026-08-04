import { ImageResponse } from "next/og"

import { SITE_DESCRIPTION, SITE_NAME } from "@/lib/site"

export const size = { width: 1200, height: 630 }
export const contentType = "image/png"
export const alt = `${SITE_NAME} — expense tracking for construction teams`

/**
 * Generated rather than a static asset so the card never drifts from the
 * copy, and so there is no 1200x630 PNG to keep in sync by hand.
 */
export default function OpengraphImage() {
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        background: "#0d2a22",
        padding: 80,
        fontFamily: "sans-serif",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 16,
          color: "#8fe0bf",
          fontSize: 30,
          letterSpacing: 8,
          textTransform: "uppercase",
        }}
      >
        {SITE_NAME}
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
        <div
          style={{
            color: "#ffffff",
            fontSize: 76,
            lineHeight: 1.05,
            letterSpacing: -2,
          }}
        >
          Every project shilling, accounted for.
        </div>
        <div style={{ color: "#a9c6bc", fontSize: 30, lineHeight: 1.4 }}>
          {SITE_DESCRIPTION}
        </div>
      </div>
    </div>,
    size
  )
}
