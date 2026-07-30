"use client"
// Placeholder — `pnpm bones:web` overwrites this file with the captured bones.
// Committed so the registry import in app/layout.tsx resolves before the first
// capture run; until then every BoneSkeleton renders its own fallback.
import { registerBones } from "boneyard-js"

registerBones({})
