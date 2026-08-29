param(
  [Parameter(Mandatory=$true)]
  [string]$Target
)

$ErrorActionPreference = "Stop"

if (-not (Test-Path $Target)) {
  throw "Target directory does not exist: $Target"
}

$Source = Split-Path -Parent $MyInvocation.MyCommand.Path

$Files = @(
  "app/layout.tsx",
  "app/globals.css",
  "app/about/page.tsx",
  "app/business/page.tsx",
  "app/business/sourcing/page.tsx",
  "app/technology/page.tsx",
  "app/contact/page.tsx",
  "app/inquiry/page.tsx",
  "components/HomeContent.tsx",
  "components/site/SiteHeader.tsx",
  "components/site/SiteFooter.tsx",
  "components/site/CompanySiteLayout.tsx",
  "VERSIONING.md",
  "CHANGELOG.md",
  "INSTALL.md"
)

foreach ($File in $Files) {
  $From = Join-Path $Source $File
  $To = Join-Path $Target $File
  $Dir = Split-Path -Parent $To

  if (-not (Test-Path $Dir)) {
    New-Item -ItemType Directory -Force -Path $Dir | Out-Null
  }

  Copy-Item -Force $From $To
  Write-Host "Installed $File"
}

Write-Host ""
Write-Host "Blue Whale V0.12 frontend installed."
Write-Host "Run: npm run build"
