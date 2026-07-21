import { Button } from "@workspace/ui/components/button"
import Image from "next/image"
import Link from "next/link"
import { getLoginHref } from "./urls"

const navItems = ["Product", "Industries", "Customers", "Company"]
const loginHref = getLoginHref()

export function Header() {
  return (
    <header className="relative z-10 border-white/10 border-b bg-transparent px-5 py-4 sm:px-8 lg:px-10">
      <div className="mx-auto flex max-w-7xl items-center justify-between">
        <Link
          href="/"
          className="flex items-center gap-2 text-white"
          aria-label="Zimba home"
        >
          <Image
            src="/logo-landing.png"
            alt="Zimba logo"
            width={28}
            height={28}
            className="size-7"
          />
          <span className="font-heading font-normal text-base uppercase tracking-[0.14em]">
            zimba
          </span>
        </Link>

        <nav className="absolute left-1/2 hidden -translate-x-1/2 items-center gap-8 font-normal text-sm text-white/75 md:flex">
          {navItems.map((item) => (
            <Link key={item} href="#" className="transition hover:text-white">
              {item}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-5">
          <Button
            size="sm"
            nativeButton={false}
            render={<Link href={loginHref} />}
          >
            Sign in
          </Button>
          <Button size="sm" className="hidden px-4 sm:inline-flex">
            Learn more
          </Button>
        </div>
      </div>
    </header>
  )
}
