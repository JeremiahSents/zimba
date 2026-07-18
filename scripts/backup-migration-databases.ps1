$ErrorActionPreference = 'Stop'

$config = @{}
Get-Content -LiteralPath 'apps/web/.env.local' | ForEach-Object {
    if ($_ -match '^(DATABASE_URL|DEV_DATABASE_URL)=(.*)$') {
        $config[$matches[1]] = $matches[2].Trim().Trim('"').Replace('postgresql+psycopg://', 'postgresql://')
    }
}

$backupRoot = Join-Path ([Environment]::GetFolderPath('Desktop')) 'zimba-db-backups'
$resolvedDesktop = [IO.Path]::GetFullPath([Environment]::GetFolderPath('Desktop'))
$resolvedBackup = [IO.Path]::GetFullPath($backupRoot)
if (-not $resolvedBackup.StartsWith($resolvedDesktop, [StringComparison]::OrdinalIgnoreCase)) {
    throw "Backup path is outside Desktop: $resolvedBackup"
}

New-Item -ItemType Directory -Path $resolvedBackup -Force | Out-Null
$stamp = Get-Date -Format 'yyyyMMdd-HHmmss'
$targets = @(
    @{ Name = 'legacy-production'; Url = $config['DATABASE_URL'] },
    @{ Name = 'dev-before-import'; Url = $config['DEV_DATABASE_URL'] }
)

foreach ($target in $targets) {
    if (-not $target.Url) { throw "Missing URL for $($target.Name)" }
    $destination = Join-Path $resolvedBackup "$($target.Name)-$stamp.dump"
    $containerDestination = "/backups/$([IO.Path]::GetFileName($destination))"
    & docker run --rm --volume "${resolvedBackup}:/backups" postgres:18 `
        pg_dump $target.Url --format=custom --no-owner --no-privileges --file=$containerDestination
    if ($LASTEXITCODE -ne 0 -or -not (Test-Path -LiteralPath $destination)) {
        throw "Backup failed: $($target.Name)"
    }
    $size = (Get-Item -LiteralPath $destination).Length
    if ($size -le 0) { throw "Backup is empty: $destination" }
    Write-Output "$($target.Name)|$destination|$size bytes"
}
