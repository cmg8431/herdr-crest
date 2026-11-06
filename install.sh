#!/bin/sh
# Install spaces-pretty into your Herdr and switch to a cloned layout that uses it.
# Never touches shipped mods or layouts: it adds mods/spaces-pretty and layouts/pretty.json.
set -eu
HOME_DIR="${HERDR_APP_HOME:-$HOME/.config/herdr-app}"
HERE="$(cd "$(dirname "$0")" && pwd)"
BASE="${1:-main}"

mkdir -p "$HOME_DIR/mods"
rm -rf "$HOME_DIR/mods/spaces-pretty"
cp -R "$HERE/mods/spaces-pretty" "$HOME_DIR/mods/spaces-pretty"
herdr-app check "$HOME_DIR/mods/spaces-pretty"

if [ ! -f "$HOME_DIR/layouts/pretty.json" ]; then
  herdr-app do layout.clone "{\"name\":\"$BASE\",\"as\":\"pretty\"}" >/dev/null
fi
python3 - "$HOME_DIR/layouts/pretty.json" <<'PY'
import sys
p = sys.argv[1]
s = open(p).read().replace('"mod": "spaces"', '"mod": "spaces-pretty"')
open(p, "w").write(s)
PY
herdr-app do layout.switch '{"name":"pretty"}' >/dev/null
echo "spaces-pretty installed. Switch layouts with Cmd+Shift+L."
