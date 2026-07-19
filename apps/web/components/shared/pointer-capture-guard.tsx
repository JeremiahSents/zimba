"use client"

import { useEffect } from "react"

/** Prevents stale pointer-up events from throwing after a navigation unmounts a control. */
export function PointerCaptureGuard() {
  useEffect(() => {
    const element = Element.prototype
    const release = element.releasePointerCapture
    if (!release) return

    element.releasePointerCapture = function safeReleasePointerCapture(pointerId: number) {
      if (typeof this.hasPointerCapture === "function" && !this.hasPointerCapture(pointerId)) return
      try {
        release.call(this, pointerId)
      } catch (error) {
        if (!(error instanceof DOMException) || error.name !== "NotFoundError") throw error
      }
    }

    return () => {
      element.releasePointerCapture = release
    }
  }, [])

  return null
}
