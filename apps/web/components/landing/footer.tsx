import Image from "next/image"
import Link from "next/link"

const footerColumns = [
  {
    heading: "Product",
    links: [
      "Product overview",
      "Expense tracking",
      "Budgets",
      "Approvals",
      "Reports",
      "Cash flow",
    ],
  },
  {
    heading: "Industries",
    links: [
      "Industries overview",
      "Construction",
      "Real estate",
      "Property management",
      "Development",
    ],
  },
  {
    heading: "Customers",
    links: ["Customer stories"],
  },
  {
    heading: "Company",
    links: ["About", "Blog", "Resources", "Careers", "Trust Center"],
  },
]

const legalLinks = [
  { label: "Privacy Policy", href: "/privacy" },
  { label: "Terms & Conditions", href: "/terms" },
  { label: "Cookie Preferences", href: "#" },
]

export function Footer() {
  return (
    <footer className="border-border border-t bg-muted/40 px-5 py-14 sm:px-8 lg:px-10">
      <div className="mx-auto max-w-7xl">
        <div className="grid gap-12 lg:grid-cols-[1fr_2.5fr]">
          <Link
            href="/"
            className="flex h-fit items-center gap-2 text-primary"
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

          <div className="grid grid-cols-2 gap-10 sm:grid-cols-4">
            {footerColumns.map((column) => (
              <div key={column.heading}>
                <h3 className="font-normal text-[10px] uppercase tracking-[0.12em]">
                  {column.heading}
                </h3>
                <ul className="mt-5 space-y-3">
                  {column.links.map((link) => (
                    <li key={link}>
                      <Link
                        href="#"
                        className="text-muted-foreground text-sm transition hover:text-foreground"
                      >
                        {link}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-16 flex flex-col gap-4 border-border border-t pt-6 text-muted-foreground text-sm sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
            <span>&copy; {new Date().getFullYear()} Zimba</span>
            {legalLinks.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                className="transition hover:text-foreground"
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  )
}
