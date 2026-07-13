import { Button } from "@workspace/ui/components/button"

const trustedBy = [
  "Stonebridge",
  "AcreWorks",
  "BuildLedger",
  "Civic Homes",
  "Northline",
  "Keystone",
  "Terraform Co",
  "Brickline",
  "Summit Estates",
  "GroundWorks",
  "Ironbeam",
  "Meridian Build",
  "Castellan",
  "Rooted Realty",
  "Framework",
]

export function TrustedBy() {
  return (
    <section className="bg-background py-20 sm:py-24">
      <div className="mx-auto max-w-6xl px-5 text-center sm:px-8 lg:px-10">
        <h2 className="font-heading font-medium text-xl tracking-[-0.02em] sm:text-2xl">
          Leading builders succeed with Zimba
        </h2>

        <Button size="sm" className="mt-5 px-4">
          Customer stories
        </Button>

        <div className="mt-14 grid grid-cols-2 gap-x-6 gap-y-12 sm:grid-cols-3 lg:grid-cols-5">
          {trustedBy.map((name) => (
            <div
              key={name}
              className="flex items-center justify-center font-heading font-semibold text-base text-muted-foreground/70 tracking-[-0.02em]"
            >
              {name}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
