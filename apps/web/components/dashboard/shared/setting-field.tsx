export function SettingField({
  label,
  value,
}: {
  label: string
  value: string
}) {
  return (
    <div className="py-2">
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="mt-1 font-medium">{value}</p>
    </div>
  )
}
