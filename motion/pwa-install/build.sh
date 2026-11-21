#!/usr/bin/env bash
# Render the 4 PWA-install variants: VO (Fatima) + Funky Fusion + UI SFX → out/pwa_install_<variant>_9x16.mp4
set -euo pipefail
P=$(cd "$(dirname "$0")" && pwd); E=$(cd "$P/../engine" && pwd); B=${BUILD_ROOT:-/tmp/motion_build}/pwa; mkdir -p "$B" "$P/out"
for V in ${@:-ios_ar ios_en android_ar android_en}; do
  DUR=$(python3 -c "import json;s=open('$P/timing.js').read();T=json.loads(s[s.index('=')+1:s.rindex(';')])['$V'];print(round(T['end']+.25+3.2,2))")
  python3 "$P/build_mix.py" "$V" "$DUR" && python3 "$E/mix.py" "$P/mix_$V.json" "$B/mix_$V.wav"
  rm -rf "${B:?}/f_$V"; (cd "$P" && QUERY="v=$V" node "$E/render.js" comp.html "$B/f_$V" 25 "$DUR" ${WORKERS:-4} | grep -E "ERR" || true)
  ffmpeg -v error -y -framerate 25 -i "$B/f_$V/f_%05d.jpg" -i "$B/mix_$V.wav" -c:v libx264 -preset slow -crf 16 -tune animation -pix_fmt yuv420p -r 25 \
    -color_primaries bt709 -color_trc bt709 -colorspace bt709 -c:a aac -b:a 320k -ar 48000 -shortest -movflags +faststart "$P/out/pwa_install_${V}_9x16.mp4"
  echo "built out/pwa_install_${V}_9x16.mp4 ($DUR s)"
done
