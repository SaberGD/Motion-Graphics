#!/usr/bin/env bash
# Render the Mariam success-story options on the shared mix: out/mariam_story_option_{a,b,c}.mp4 (1080x1920, 25 fps, 30 s)
set -euo pipefail
P=$(cd "$(dirname "$0")" && pwd); E=$(cd "$P/../engine" && pwd); B=${BUILD_ROOT:-/tmp/motion_build}/mariam; mkdir -p "$B" "$P/out"
python3 "$P/build_mix.py"; python3 "$E/mix.py" "$P/mix.json" "$B/mix.wav"
for O in ${@:-a b c}; do
  rm -rf "${B:?}/opt_$O"; (cd "$P" && node "$E/render.js" "opt_$O.html" "$B/opt_$O" 25 $(python3 -c "import json;s=open('story.js').read();print(json.loads(s[s.index('= ')+2:s.rindex(';')])['DUR'])") ${WORKERS:-4} | grep -E "ERR" || true)
  ffmpeg -v error -y -framerate 25 -i "$B/opt_$O/f_%05d.jpg" -i "$B/mix.wav" -c:v libx264 -preset slow -crf 16 -tune animation -profile:v high -pix_fmt yuv420p -r 25 \
    -color_primaries bt709 -color_trc bt709 -colorspace bt709 -c:a aac -b:a 320k -ar 48000 -shortest -movflags +faststart "$P/out/mariam_story_option_$O.mp4"
  echo "built $P/out/mariam_story_option_$O.mp4"
done
