#!/usr/bin/env bash
set -euo pipefail

TARGET="${1:-}"

if [[ -z "$TARGET" ]]; then
  echo "Usage: ./install.sh /path/to/bluewhale-sourcing"
  exit 1
fi

if [[ ! -d "$TARGET" ]]; then
  echo "Target directory does not exist: $TARGET"
  exit 1
fi

SOURCE="$(cd "$(dirname "$0")" && pwd)"

FILES=(
  "app/layout.tsx"
  "app/globals.css"
  "app/about/page.tsx"
  "app/business/page.tsx"
  "app/business/sourcing/page.tsx"
  "app/technology/page.tsx"
  "app/contact/page.tsx"
  "app/inquiry/page.tsx"
  "components/HomeContent.tsx"
  "components/site/SiteHeader.tsx"
  "components/site/SiteFooter.tsx"
  "components/site/CompanySiteLayout.tsx"
  "VERSIONING.md"
  "CHANGELOG.md"
  "INSTALL.md"
)

for file in "${FILES[@]}"; do
  mkdir -p "$(dirname "$TARGET/$file")"
  cp "$SOURCE/$file" "$TARGET/$file"
  echo "Installed $file"
done

echo
echo "Blue Whale V0.12 frontend installed."
echo "Run: npm run build"
