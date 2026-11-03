#!/usr/bin/env bash
# Render an SG MOTION piece: frames (Chromium) + mix (VO + music + SFX) -> <piece>/out/<name>.mp4
# usage: motion/render.sh motion/<piece>        (reads <piece>/piece.json: {"fps":25,"dur":71.04,"name":"..."})
set -euo pipefail
P=$(cd "$1" && pwd); E=$(cd "$(dirname "$0")/engine" && pwd); NAME=$(python3 -c "import json;print(json.load(open('$P/piece.json'))['name'])")
FPS=$(python3 -c "import json;print(json.load(open('$P/piece.json'))['fps'])"); DUR=$(python3 -c "import json;print(json.load(open('$P/piece.json'))['dur'])")
B=${BUILD_ROOT:-/tmp/motion_build}/$NAME; mkdir -p "$B" "$P/out"
[ -f "$P/build_mix.py" ] && python3 "$P/build_mix.py"
python3 "$E/mix.py" "$P/mix.json" "$B/mix.wav"
rm -rf "${B:?}/frames"; node "$E/render.js" "$P/comp.html" "$B/frames" "$FPS" "$DUR" ${WORKERS:-4} | grep -E "ERR" || true
ffmpeg -v error -y -framerate "$FPS" -i "$B/frames/f_%05d.jpg" -i "$B/mix.wav" -c:v libx264 -preset slow -crf 16 -tune animation -profile:v high \
  -pix_fmt yuv420p -r "$FPS" -color_primaries bt709 -color_trc bt709 -colorspace bt709 -c:a aac -b:a 320k -ar 48000 -shortest -movflags +faststart "$P/out/$NAME.mp4"
echo "built $P/out/$NAME.mp4"
