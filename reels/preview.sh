#!/usr/bin/env bash
# Quick look: preview.sh <reel_dir> <t1,t2,...>  -> contact sheet at $BUILD_ROOT/<name>/pv_sheet.jpg
set -euo pipefail
R=$(cd "$1" && pwd); NAME=$(basename "$R"); E=$(cd "$(dirname "$0")/engine" && pwd)
B=${BUILD_ROOT:-/tmp/reels_build}/$NAME; mkdir -p "$B"
python3 "$E/prep.py" "$R/spec.json" "$B" >/dev/null
if [ ! -f "$B/base.mp4" ] || [ "$R/spec.json" -nt "$B/base.mp4" ] || [ "$E/base.py" -nt "$B/base.mp4" ]; then
  python3 "$E/base.py" "$R/spec.json" "$B/base.mp4" | tail -1
  rm -rf "$B/base"; mkdir -p "$B/base"; ffmpeg -v error -y -i "$B/base.mp4" -q:v 2 "$B/base/b_%05d.jpg"
  if [ -f "$B/base_alpha.mp4" ]; then rm -rf "$B/alpha"; mkdir -p "$B/alpha"; ffmpeg -v error -y -i "$B/base_alpha.mp4" -q:v 2 "$B/alpha/a_%05d.jpg"; fi
fi
if grep -q '"matte"' "$R/spec.json"; then export STAGE=stage_calm.html ALPHA="$B/alpha"; elif grep -q 'stage_calm' "$R/spec.json"; then export STAGE=stage_calm.html; fi
rm -rf "$B/pv"; TIMES=$2 node "$E/render.js" "$B/spec.json" "$B/words.json" "$B/base" "$B/pv" 4 2>&1 | grep -E "ERR" || true
python3 - "$B" <<'PY'
import sys, glob
from PIL import Image
b = sys.argv[1]; fs = sorted(glob.glob(b + '/pv/f_*.jpg')); n = len(fs); cols = min(n, 11); rows = (n + cols - 1) // cols
o = Image.new('RGB', (270 * cols, 480 * rows))
for i, f in enumerate(fs): o.paste(Image.open(f).resize((270, 480)), ((i % cols) * 270, (i // cols) * 480))
o.save(b + '/pv_sheet.jpg'); print(b + '/pv_sheet.jpg')
PY
