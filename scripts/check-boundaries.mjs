import { readFile, readdir } from "node:fs/promises"
import { join, relative, sep } from "node:path"

const root = process.cwd()
const violations = []

async function walk(dir) {
  const entries = await readdir(dir, { withFileTypes: true })
  const files = []
  for (const entry of entries) {
    if (entry.name === "node_modules" || entry.name === ".next") continue
    const path = join(dir, entry.name)
    if (entry.isDirectory()) files.push(...(await walk(path)))
    else if (/\.(ts|tsx|js|mjs)$/.test(entry.name)) files.push(path)
  }
  return files
}

function add(file, message) {
  violations.push(`${relative(root, file)}: ${message}`)
}

const apiFiles = await walk(join(root, "packages", "api"))
for (const file of apiFiles) {
  const source = await readFile(file, "utf8")
  if (/from ["'](?:next|react)(?:\/|["'])/.test(source))
    add(file, "packages/api must not import Next.js or React")
  if (source.includes("@workspace/db/schema"))
    add(file, "packages/api must not import Drizzle schemas")
}

const webFiles = await walk(join(root, "apps", "web"))
for (const file of webFiles) {
  const source = await readFile(file, "utf8")
  if (source.includes("apps/web/domains") || source.includes("@/domains/"))
    add(file, "legacy domains import")
  if (/['"`]\/admin(?:\/|['"`])/.test(source))
    add(file, "customer code must not reference /admin")
  if (
    /(db\.|from ["']@workspace\/db(?:["'/]))/.test(source) &&
    file.includes(`${sep}app${sep}`) &&
    !file.includes(`${sep}api${sep}`)
  )
    add(file, "database access belongs in repositories/core, not route pages")
}

const routeFiles = (await walk(join(root, "apps", "web", "app"))).filter(
  (file) => file.endsWith(`${sep}actions.ts`)
)
const allowed = new Set([
  join(root, "apps", "web", "app", "invite", "[token]", "actions.ts"),
  join(root, "apps", "web", "app", "onboarding", "actions.ts"),
])
for (const file of routeFiles)
  if (!allowed.has(file))
    add(file, "route-owned Server Action; move it to apps/web/core")

const adminRouteActions = (
  await walk(join(root, "apps", "admin", "app"))
).filter((file) => file.endsWith(`${sep}actions.ts`))
for (const file of adminRouteActions)
  add(file, "route-owned admin Server Action; move it to apps/admin/core")

const oversizedExceptions = new Set([
  "receipt-detail-page.tsx",
  "project-expense-create-page.tsx",
  "project-detail-page.tsx",
  "project-allocation-create-page.tsx",
  "supplier-table.tsx",
  "supplier-detail-page.tsx",
  "allocation-table.tsx",
  "projects-page.tsx",
  "project-files-page.tsx",
  "project-expenses-table.tsx",
])
for (const file of await walk(join(root, "apps", "web", "components"))) {
  if (!file.endsWith(".tsx")) continue
  const lineCount = (await readFile(file, "utf8")).split("\n").length
  if (lineCount > 300 && !oversizedExceptions.has(file.split(sep).pop()))
    add(
      file,
      "oversized component regression; extract a cohesive responsibility or add an explicit exception"
    )
}

if (violations.length) {
  console.error("Architectural boundary check failed:")
  for (const violation of violations) console.error(`- ${violation}`)
  process.exit(1)
}
console.log("Architectural boundary check passed.")
