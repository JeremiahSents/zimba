import Link from "next/link"
import Image from "next/image"
import { Button } from "@workspace/ui/components/button"

const navItems = ["Product", "Industries", "Customers", "Company"]

export function Header() {
  return (
    <header className="relative z-10 border-b border-white/10 bg-transparent px-5 py-4 sm:px-8 lg:px-10">
      <div className="mx-auto flex max-w-7xl items-center justify-between">
      <Link href="/" className="flex items-center gap-2 text-white" aria-label="Zimba home">
        <Image src="/logo-landing.png" alt="Zimba logo" width={28} height={28} className="size-7" />
        <span className="font-heading text-base font-normal uppercase tracking-[0.14em]">
          zimba
        </span>
      </Link>

      <nav className="absolute left-1/2 hidden -translate-x-1/2 items-center gap-8 text-sm font-normal text-white/75 md:flex">
        {navItems.map((item) => (
          <Link key={item} href="#" className="transition hover:text-white">
            {item}
          </Link>
        ))}
      </nav>

      <div className="flex items-center gap-5">
        <Link
          href="/login"
          className="hidden text-sm font-normal text-white/75 transition hover:text-white sm:inline-flex"
        >
          Sign in
        </Link>
        <Button size="sm" className="px-4">
          Learn more
        </Button>
      </div>
      </div>
    </header>
  )
}
