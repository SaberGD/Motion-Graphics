#!/usr/bin/env bash
# Build one reel: make.sh <reel_dir> [--preview]   (output: <reel_dir>/out/<name>.mp4)
set -euo pipefail
R=$(cd "$1" && pwd); NAME=$(basename "$R"); E=$(cd "$(dirname "$0")/engine" && pwd)
B=${BUILD_ROOT:-/tmp/reels_build}/$NAME; mkdir -p "$B" "$R/out"
python3 "$E/prep.py" "$R/spec.json" "$B"
if [ ! -f "$B/base.mp4" ] || [ "$R/spec.json" -nt "$B/base.mp4" ] || [ "$E/base.py" -nt "$B/base.mp4" ]; then
  python3 "$E/base.py" "$R/spec.json" "$B/base.mp4"
  rm -rf "$B/base"; mkdir -p "$B/base"
  ffmpeg -v error -y -i "$B/base.mp4" -q:v 2 "$B/base/b_%05d.jpg"
  if [ -f "$B/base_alpha.mp4" ]; then rm -rf "$B/alpha"; mkdir -p "$B/alpha"; ffmpeg -v error -y -i "$B/base_alpha.mp4" -q:v 2 "$B/alpha/a_%05d.jpg"; fi
fi
STAGE=stage.html; ALPHA=
if grep -q '"matte"' "$R/spec.json"; then STAGE=stage_calm.html; ALPHA="$B/alpha"; fi
export STAGE ALPHA
rm -rf "$B/frames"
node "$E/render.js" "$B/spec.json" "$B/words.json" "$B/base" "$B/frames" ${WORKERS:-3}
python3 "$E/audio.py" "$R/spec.json" "$B/mix.wav"
ffmpeg -v error -y -framerate 30 -i "$B/frames/f_%05d.jpg" -i "$B/mix.wav" -c:v libx264 -preset slow -crf 18 -profile:v high \
  -pix_fmt yuv420p -r 30 -c:a aac -b:a 256k -shortest -movflags +faststart "$R/out/$NAME.mp4"
echo "built $R/out/$NAME.mp4"
