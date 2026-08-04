const trustedBy = [
  "Stonebridge",
  "Keystone",
  "Meridian Build",
  "AcreWorks",
  "Civic Homes",
  "Northline",
  "Brickline",
  "Summit Estates",
  "GroundWorks",
  "Ironbeam",
  "Castellan",
  "Rooted Realty",
]

export function TrustedBy() {
  return (
    <section className="overflow-hidden bg-background py-14 sm:py-16">
      <p className="text-center text-muted-foreground text-sm">
        Trusted by builders across the region
      </p>

      <div className="relative mt-8 [mask-image:linear-gradient(to_right,transparent,black_10%,black_90%,transparent)]">
        <div className="flex w-max animate-marquee gap-14 pr-14 hover:[animation-play-state:paused] motion-reduce:animate-none">
          {/* Rendered twice so the track can loop without a visible seam. */}
          {[...trustedBy, ...trustedBy].map((name, index) => (
            <span
              key={`${name}-${index}`}
              aria-hidden={index >= trustedBy.length}
              className="whitespace-nowrap font-heading font-semibold text-base text-muted-foreground/70 tracking-[-0.02em]"
            >
              {name}
            </span>
          ))}
        </div>
      </div>
    </section>
  )
}
