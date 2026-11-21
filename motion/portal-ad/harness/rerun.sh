#!/usr/bin/env bash
# Rebuilds the demo harness in a scratch copy of the training repo and recaptures the screens.
# The training repo itself is never modified. Usage: motion/portal-ad/harness/rerun.sh [mobile|desktop|all]
set -euo pipefail
HERE="$(cd "$(dirname "$0")" && pwd)"
SRC=/home/user/training-sys-updated-august-2026
WORK="${WORK:-/tmp/portal-demo}"
OUT="$HERE/../assets/screens"
mkdir -p "$WORK"
(cd "$SRC" && tar --exclude=./.git --exclude=./functions --exclude=./docs --exclude=./video-server \
  --exclude=./extension --exclude=./telegram-uploader --exclude=./telegram-worker -cf - .) | (cd "$WORK" && tar xf -)
cp -r "$HERE/demo" "$WORK/"
sed -e 's#/index.tsx#/demo/entry.tsx#' -e "s#navigator.serviceWorker.register('/sw.js').catch(() => {});#/* demo */#" \
  "$WORK/index.html" > "$WORK/demo.html"
cd "$WORK"
[ -d node_modules ] || npm install --no-audit --no-fund
npx vite --config demo/vite.demo.config.ts > vite.log 2>&1 &
VITE=$!; trap 'kill $VITE' EXIT
sleep 3
node "$HERE/capture.cjs" "$OUT" "${1:-all}"
