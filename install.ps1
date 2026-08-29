param([Parameter(Mandatory=$true)][string]$Target)
$ErrorActionPreference = "Stop"
if (-not (Test-Path $Target)) { throw "Target directory does not exist: $Target" }
$Source = Split-Path -Parent $MyInvocation.MyCommand.Path
$Files = @(
  "lib/workspace-auth.ts",
  "app/api/workspace/auth/route.ts",
  "components/WorkspaceShell.tsx",
  "components/NewsAdmin.tsx",
  "app/layout.tsx",
  "CHANGELOG.md",
  "INSTALL.md"
)
foreach ($File in $Files) {
  $From = Join-Path $Source $File
  $To = Join-Path $Target $File
  $Dir = Split-Path -Parent $To
  if (-not (Test-Path $Dir)) { New-Item -ItemType Directory -Force -Path $Dir | Out-Null }
  Copy-Item -Force $From $To
  Write-Host "Installed $File"
}
Write-Host ""
Write-Host "Blue Whale V0.21 Workspace Auth Stabilization installed."
Write-Host "Restart npm run dev before testing."
