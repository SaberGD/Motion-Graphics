#!/usr/bin/env bash
# Re-run only the audio mix and re-mux with already-rendered frames: remix.sh <reel_dir>
set -euo pipefail
R=$(cd "$1" && pwd); NAME=$(basename "$R"); E=$(cd "$(dirname "$0")/engine" && pwd)
B=${BUILD_ROOT:-/tmp/reels_build}/$NAME
python3 "$E/audio.py" "$R/spec.json" "$B/mix.wav"
ffmpeg -v error -y -framerate 30 -i "$B/frames/f_%05d.jpg" -i "$B/mix.wav" -c:v libx264 -preset slow -crf 18 -profile:v high \
  -pix_fmt yuv420p -r 30 -c:a aac -b:a 256k -shortest -movflags +faststart "$R/out/$NAME.mp4"
echo "remixed $R/out/$NAME.mp4"
