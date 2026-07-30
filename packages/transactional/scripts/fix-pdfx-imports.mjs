/**
 * Post-processes the files pdfx-cli generates. Re-run after every
 * `pdfx-cli add` / `pdfx-cli block add`: `pnpm pdfx:fix`.
 *
 * Two fixes, both mechanical, because these files get overwritten whenever a
 * component is re-added and hand-edits would not survive:
 *
 * 1. Import separators. pdfx-cli resolves theme and component imports with
 *    `path.relative()` and writes the result straight into the source. On
 *    Windows that yields `'..\..\..\lib\pdfx-theme-context'` — backslashes,
 *    which a JavaScript string literal reads as escape sequences, so nothing
 *    resolves and every generated file fails to compile.
 *
 * 2. `@ts-nocheck`. The generated components are written against a looser
 *    tsconfig than this repo's, which sets `noUncheckedIndexedAccess`. They
 *    index into `Record<string, number>` theme scales without guarding, so
 *    roughly fifteen errors surface in vendored code we do not own. Suppressing
 *    per-file keeps the strict flag on for everything we *do* write — the
 *    documents in `pdf/documents/` and `render.ts` stay fully checked, and the
 *    components' exported prop types still type our usage of them.
 *
 * 3. The unexported `PdfxTheme` interface. `pdfx-theme.ts` declares it without
 *    `export`, yet the generated blocks import it by name and the theme context
 *    exports a value typed by it. With `declaration: true` that is a TS4023,
 *    which `@ts-nocheck` does not suppress because it is a declaration-emit
 *    error rather than a checking one.
 *
 * 4. The theme context. The generated `pdfx-theme-context.tsx` calls
 *    `createContext`, which is client-only under React Server Components and
 *    breaks `next build` (though not `next dev`). We keep our own context-free
 *    version at that path; this restores it if the CLI writes over it. The
 *    reasoning is in the header of that file.
 */
import { copyFile, readdir, readFile, writeFile } from "node:fs/promises"
import { basename, dirname, join } from "node:path"
import { fileURLToPath } from "node:url"

const scriptDir = dirname(fileURLToPath(import.meta.url))
const pdfRoot = join(scriptDir, "..", "pdf")

// Our replacement for the generated theme context, kept beside this script so
// the CLI cannot overwrite the master copy along with the file it replaces.
// The `.template` suffix keeps it out of tsconfig's globs and the formatter —
// it does not compile where it sits, only where it is copied to.
const THEME_CONTEXT = "pdfx-theme-context.tsx"
const themeContextSource = join(scriptDir, `${THEME_CONTEXT}.template`)

// Only the relative specifier of an import/export, so a backslash inside real
// string content is left alone.
const specifier = /(\bfrom\s*['"])([^'"]*\\[^'"]*)(['"])/g

async function walk(dir) {
  const entries = await readdir(dir, { withFileTypes: true })
  const files = []
  for (const entry of entries) {
    const path = join(dir, entry.name)
    if (entry.isDirectory()) files.push(...(await walk(path)))
    else if (/\.tsx?$/.test(entry.name)) files.push(path)
  }
  return files
}

const NOCHECK =
  "// @ts-nocheck -- vendored pdfx component, see scripts/fix-pdfx-imports.mjs\n"

// Only the trees pdfx-cli owns. `pdf/documents`, `pdf/render.ts`, `pdf/types.ts`
// and `pdf/format.ts` are ours and must stay strictly checked.
const generated = ["components", "lib", "blocks"].map((dir) =>
  join(pdfRoot, dir)
)

const fixed = []
for (const dir of generated) {
  let files
  try {
    files = await walk(dir)
  } catch {
    continue // tree not installed
  }
  for (const file of files) {
    // Restored wholesale rather than patched: the generated version's whole
    // design is the context we are removing.
    if (basename(file) === THEME_CONTEXT) {
      // Compared against the template rather than sniffed for `createContext` —
      // the template explains createContext in its header, so a substring test
      // would rewrite the file on every run.
      const [current, replacement] = await Promise.all([
        readFile(file, "utf8"),
        readFile(themeContextSource, "utf8"),
      ])
      if (current !== replacement) {
        await copyFile(themeContextSource, file)
        fixed.push(file)
      }
      continue
    }
    const source = await readFile(file, "utf8")
    let next = source.replace(
      specifier,
      (_, open, path, close) => `${open}${path.replaceAll("\\", "/")}${close}`
    )
    next = next.replace(/^interface PdfxTheme\b/m, "export interface PdfxTheme")
    if (!next.startsWith("// @ts-nocheck")) next = NOCHECK + next
    if (next === source) continue
    await writeFile(file, next)
    fixed.push(file)
  }
}

console.log(
  fixed.length
    ? `Post-processed ${fixed.length} generated pdfx file(s).`
    : "Generated pdfx files already up to date."
)
