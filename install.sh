#!/bin/sh
# Install crest into Herdr: copy the mod, then use it in a layout cloned from yours.
# Shipped mods and layouts are never changed, so Herdr updates leave crest alone.
set -eu
APP="${HERDR_APP_HOME:-$HOME/.config/herdr-app}"
HERE="$(cd "$(dirname "$0")" && pwd)"
BASE="${1:-main}"

command -v herdr-app >/dev/null 2>&1 || { echo "herdr-app not found. Open Herdr once, then run this again." >&2; exit 1; }

mkdir -p "$APP/mods"
rm -rf "$APP/mods/crest"
cp -R "$HERE/mods/crest" "$APP/mods/crest"
herdr-app check "$APP/mods/crest"

if [ ! -f "$APP/layouts/crest.json" ]; then
  herdr-app "do" layout.clone "{\"name\":\"$BASE\",\"as\":\"crest\"}" >/dev/null
fi
# Point the cloned layout's spaces list at crest.
sed 's/"mod": "spaces"/"mod": "crest"/' "$APP/layouts/crest.json" > "$APP/layouts/crest.json.tmp"
mv "$APP/layouts/crest.json.tmp" "$APP/layouts/crest.json"
herdr-app "do" layout.switch '{"name":"crest"}' >/dev/null

echo "crest is installed. Cmd+Shift+L switches layouts; your old one is still there."
