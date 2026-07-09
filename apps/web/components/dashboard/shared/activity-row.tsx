export function ActivityRow({
  detail,
  title,
  value,
}: {
  detail: string
  title: string
  value: string
}) {
  return (
    <div className="flex items-center justify-between gap-4 py-2">
      <div className="min-w-0">
        <p className="truncate font-medium">{title}</p>
        <p className="text-sm text-muted-foreground">{detail}</p>
      </div>
      <p className="shrink-0 text-sm font-semibold">{value}</p>
    </div>
  )
}
