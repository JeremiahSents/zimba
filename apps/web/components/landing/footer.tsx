import Image from "next/image"
import Link from "next/link"

const links = [
  { label: "Product", href: "#product" },
  { label: "Book a demo", href: "#book-demo" },
  { label: "Privacy Policy", href: "/privacy" },
  { label: "Terms & Conditions", href: "/terms" },
]

export function Footer() {
  return (
    <footer className="border-border border-t bg-background px-5 py-10 sm:px-8 lg:px-10">
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-6 sm:flex-row sm:justify-between">
        <Link
          href="/"
          className="flex items-center gap-2 text-primary"
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

        <nav className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2">
          {links.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              className="text-muted-foreground text-sm transition hover:text-foreground"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <p className="text-muted-foreground text-sm">
          &copy; {new Date().getFullYear()} Zimba Group Ltd.
        </p>
      </div>
    </footer>
  )
}
