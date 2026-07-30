"use client"

import { useTheme } from "next-themes"
import { useEffect } from "react"

const THEME_KEYBOARD_SHORTCUT = "d"

/**
 * Bare "D" toggles dark mode. Unmodified single-letter shortcuts are only safe
 * while the caret is not in a field, so typing "d" into the org search box has
 * to be ignored — hence the editable check below rather than a plain key
 * comparison.
 */
function isTypingInto(target: EventTarget | null) {
  if (!(target instanceof HTMLElement)) return false
  if (target.isContentEditable) return true
  const tag = target.tagName
  return tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT"
}

export function ThemeShortcut() {
  const { resolvedTheme, setTheme } = useTheme()

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key.toLowerCase() !== THEME_KEYBOARD_SHORTCUT) return
      // Leaves Ctrl/Cmd+D (bookmark) and Alt+D (address bar) to the browser.
      if (event.metaKey || event.ctrlKey || event.altKey) return
      if (event.repeat || isTypingInto(event.target)) return

      event.preventDefault()
      setTheme(resolvedTheme === "dark" ? "light" : "dark")
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [resolvedTheme, setTheme])

  return null
}
