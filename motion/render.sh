#!/usr/bin/env bash
# Render an SG MOTION piece: frames (Chromium) + mix (VO + music + SFX) -> <piece>/out/<name>.mp4
# usage: motion/render.sh motion/<piece>        (reads <piece>/piece.json: {"fps":25,"dur":71.04,"name":"..."})
set -euo pipefail
P=$(cd "$1" && pwd); E=$(cd "$(dirname "$0")/engine" && pwd); NAME=$(python3 -c "import json;print(json.load(open('$P/piece.json'))['name'])")
FPS=$(python3 -c "import json;print(json.load(open('$P/piece.json'))['fps'])"); DUR=$(python3 -c "import json;print(json.load(open('$P/piece.json'))['dur'])")
B=${BUILD_ROOT:-/tmp/motion_build}/$NAME; mkdir -p "$B" "$P/out"
[ -f "$P/build_mix.py" ] && python3 "$P/build_mix.py"
python3 "$E/mix.py" "$P/mix.json" "$B/mix.wav"
# variants: piece.json "variants": ["text", "mix"] -> <name>_<v>.mp4 (comp.html reads ?v=<variant>); args override
VARS=${2:-$(python3 -c "import json;print(' '.join(json.load(open('$P/piece.json')).get('variants',[''])))")}
for V in ${VARS:-""}; do
  # "<v>-land" = the same variant recomposed for 16:9 (?land=1, 1920x1080, name 9x16 → 16x9)
  if [[ "$V" == *-land ]]; then Q="v=${V%-land}&land=1"; VP=1920x1080; OUTN=${NAME/9x16/16x9}_${V%-land}; else Q=${V:+v=$V}; VP=1080x1920; OUTN=$NAME${V:+_$V}; fi
  rm -rf "${B:?}/frames_$V"
  QUERY=$Q VIEWPORT=$VP node "$E/render.js" "$P/comp.html" "$B/frames_$V" "$FPS" "$DUR" ${WORKERS:-4} | grep -E "ERR" || true
  ffmpeg -v error -y -framerate "$FPS" -i "$B/frames_$V/f_%05d.jpg" -i "$B/mix.wav" -c:v libx264 -preset slow -crf 16 -tune animation -profile:v high \
    -pix_fmt yuv420p -r "$FPS" -color_primaries bt709 -color_trc bt709 -colorspace bt709 -c:a aac -b:a 320k -ar 48000 -shortest -movflags +faststart "$P/out/$OUTN.mp4"
  echo "built $P/out/$OUTN.mp4"
done
