#!/usr/bin/env bash
# Render a reel in both looks (house rule: always deliver both):
#   <reel>/out/<name>_original_colors.mp4   (footage colours untouched)
#   <reel>/out/<name>_graded.mp4            (GRADE=cine)
# usage: reels/render.sh reels/<name> [none|cine ...]
#   FRAMES_ONLY=1  re-render graphics + audio on the existing base plates (caption / graphics / mix changes)
set -euo pipefail
R=$(cd "$1" && pwd); shift; NAME=$(basename "$R"); E=$(cd "$(dirname "$0")/engine" && pwd)
ROOT=${BUILD_ROOT:-/tmp/reels_build}/$NAME; mkdir -p "$ROOT" "$R/out"
python3 "$R/build_spec.py"
python3 "$E/prep.py" "$R/spec.json" "$ROOT"
python3 "$E/audio.py" "$R/spec.json" "$ROOT/mix.wav"
for G in ${@:-none cine}; do
  B=$ROOT/$G; mkdir -p "$B"
  if [ -z "${FRAMES_ONLY:-}" ] || [ ! -d "$B/base" ]; then
    GRADE=$G python3 "$E/base.py" "$R/spec.json" "$B/base.mp4" | tail -1
    rm -rf "${B:?}/base"; mkdir -p "$B/base"
    ffmpeg -v error -y -i "$B/base.mp4" -q:v 1 -qmin 1 "$B/base/b_%05d.jpg"
  fi
  rm -rf "${B:?}/frames"
  node "$E/render.js" "$ROOT/spec.json" "$ROOT/words.json" "$B/base" "$B/frames" ${WORKERS:-4} | grep -E "ERR" || true
  OUT=$([ "$G" = none ] && echo "${NAME}_original_colors" || echo "${NAME}_graded")
  ffmpeg -v error -y -framerate 30 -i "$B/frames/f_%05d.jpg" -i "$ROOT/mix.wav" \
    -c:v libx264 -preset slow -crf 15 -tune film -profile:v high -pix_fmt yuv420p -r 30 \
    -c:a aac -b:a 320k -ar 48000 -shortest -movflags +faststart "$R/out/$OUT.mp4"
  echo "built $R/out/$OUT.mp4"
done
