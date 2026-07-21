export default function Home() {
  return (
    <main className="flex min-h-dvh items-center justify-center bg-muted/30 px-6 py-16">
      <section className="w-full max-w-3xl rounded-lg border bg-background p-8 shadow-sm">
        <p className="font-medium text-muted-foreground text-sm uppercase tracking-wide">
          Zimba Internal
        </p>
        <h1 className="mt-3 font-heading font-semibold text-3xl text-foreground tracking-tight">
          Super Admin app is ready.
        </h1>
        <p className="mt-4 max-w-2xl text-muted-foreground">
          This workspace app is configured for the monorepo and ready for the
          internal operations dashboard build-out.
        </p>
      </section>
    </main>
  )
}
