import Link from "next/link"
import Image from "next/image"
import { Button } from "@workspace/ui/components/button"

const navItems = ["Product", "Industries", "Customers", "Company"]

export function Header() {
  return (
    <header className="relative z-10 mx-3 mt-3 flex items-center justify-between rounded-full border border-white/10 bg-black/20 px-4 py-3 shadow-[0_18px_60px_rgba(0,0,0,0.18)] backdrop-blur-md sm:mx-6 sm:px-5 lg:mx-8">
      <Link href="/" className="flex items-center gap-2 text-white" aria-label="Zimba home">
        <Image src="/logo-landing.png" alt="Zimba logo" width={28} height={28} className="size-7" />
        <span className="font-heading text-base font-semibold uppercase tracking-[0.14em]">
          zimba
        </span>
      </Link>

      <nav className="absolute left-1/2 hidden -translate-x-1/2 items-center gap-8 text-sm font-medium text-white/80 md:flex">
        {navItems.map((item) => (
          <Link key={item} href="#" className="transition hover:text-white">
            {item}
          </Link>
        ))}
      </nav>

      <div className="flex items-center gap-5">
        <Link
          href="#"
          className="hidden text-sm font-medium text-white/80 transition hover:text-white sm:inline-flex"
        >
          Sign in
        </Link>
        <Button size="sm" className="px-4 text-white">
          Learn more
        </Button>
      </div>
    </header>
  )
}
