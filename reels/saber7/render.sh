#!/usr/bin/env bash
# Render the Visual Hierarchy reel in two looks:
#   out/saber7_original_colors.mp4   (footage colours untouched)
#   out/saber7_graded.mp4            (GRADE=cine colour grade)
# usage: reels/saber7/render.sh [none|cine ...]     (default: both)
set -euo pipefail
R=$(cd "$(dirname "$0")" && pwd); E=$(cd "$R/../engine" && pwd)
ROOT=${BUILD_ROOT:-/tmp/reels_build}/saber7; mkdir -p "$ROOT" "$R/out"
python3 "$R/build_spec.py"
python3 "$E/prep.py" "$R/spec.json" "$ROOT"
python3 "$E/audio.py" "$R/spec.json" "$ROOT/mix.wav"
for G in ${@:-none cine}; do
  B=$ROOT/$G; mkdir -p "$B"
  GRADE=$G python3 "$E/base.py" "$R/spec.json" "$B/base.mp4" | tail -1
  rm -rf "$B/base" "$B/frames"; mkdir -p "$B/base"
  ffmpeg -v error -y -i "$B/base.mp4" -q:v 1 -qmin 1 "$B/base/b_%05d.jpg"
  node "$E/render.js" "$ROOT/spec.json" "$ROOT/words.json" "$B/base" "$B/frames" ${WORKERS:-4} | grep -E "ERR|frame 0 " || true
  NAME=$([ "$G" = none ] && echo saber7_original_colors || echo saber7_graded)
  ffmpeg -v error -y -framerate 30 -i "$B/frames/f_%05d.jpg" -i "$ROOT/mix.wav" \
    -c:v libx264 -preset slow -crf 15 -tune film -profile:v high -pix_fmt yuv420p -r 30 \
    -c:a aac -b:a 320k -ar 48000 -shortest -movflags +faststart "$R/out/$NAME.mp4"
  echo "built $R/out/$NAME.mp4"
done
