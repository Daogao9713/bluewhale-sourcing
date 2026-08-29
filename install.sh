#!/usr/bin/env bash
set -euo pipefail
TARGET="${1:-}"
if [[ -z "$TARGET" ]]; then echo "Usage: ./install.sh /path/to/bluewhale-sourcing"; exit 1; fi
if [[ ! -d "$TARGET" ]]; then echo "Target directory does not exist: $TARGET"; exit 1; fi
SOURCE="$(cd "$(dirname "$0")" && pwd)"
FILES=(
  "lib/database/server.ts"
  "lib/ai/server.ts"
  "lib/news/server.ts"
  "lib/supabase.ts"
  "lib/supabase-admin.ts"
  "app/api/news/route.ts"
  "app/api/workspace/news/route.ts"
  "app/api/workspace/news/translate/route.ts"
  "app/api/site-assistant/route.ts"
  "app/api/health/route.ts"
  "components/site/HomeNewsStrip.tsx"
  "components/site/NewsList.tsx"
  "app/globals.css"
  "CHANGELOG.md"
  "INSTALL.md"
  "VERSIONING.md"
)
for file in "${FILES[@]}"; do
  mkdir -p "$(dirname "$TARGET/$file")"
  cp "$SOURCE/$file" "$TARGET/$file"
  echo "Installed $file"
done
echo
echo "Blue Whale V0.20 Platform Foundation installed."
echo "IMPORTANT: restart the application after environment-variable changes."
