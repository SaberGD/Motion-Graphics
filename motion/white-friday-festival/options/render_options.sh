#!/usr/bin/env bash
# Render the three design options on the piece's existing mix: out/white_friday_option_{a,b,c}.mp4
set -euo pipefail
P=$(cd "$(dirname "$0")/.." && pwd); E=$(cd "$P/../engine" && pwd); B=${BUILD_ROOT:-/tmp/motion_build}/white_friday_festival_9x16
[ -f "$B/mix.wav" ] || python3 "$E/mix.py" "$P/mix.json" "$B/mix.wav"
for O in ${@:-a b c}; do
  rm -rf "${B:?}/opt_$O"; node "$E/render.js" "$P/options/opt_$O.html" "$B/opt_$O" 25 71.04 ${WORKERS:-4} | grep -E "ERR" || true
  ffmpeg -v error -y -framerate 25 -i "$B/opt_$O/f_%05d.jpg" -i "$B/mix.wav" -c:v libx264 -preset slow -crf 16 -tune animation -profile:v high -pix_fmt yuv420p -r 25 \
    -color_primaries bt709 -color_trc bt709 -colorspace bt709 -c:a aac -b:a 320k -ar 48000 -shortest -movflags +faststart "$P/out/white_friday_option_$O.mp4"
  echo "built $P/out/white_friday_option_$O.mp4"
done
