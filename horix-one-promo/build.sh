#!/usr/bin/env bash
# Full build: cup stills -> 4 parallel video chunks -> audio -> final mp4.
# usage: ./build.sh out.mp4 [music.wav]
set -euo pipefail
cd "$(dirname "$0")"
OUT=$(realpath -m "${1:-horix-one-promo.mp4}"); MUSIC=${2:-}
TMP=$(mktemp -d)
[ -f assets/cup/full.png ] || { node cup/render_cup.cjs && python3 cup/outline.py; }
DUR=58.2; N=4
for i in $(seq 0 $((N-1))); do
  T0=$(python3 -c "print($DUR*$i/$N)"); T1=$(python3 -c "print($DUR*($i+1)/$N)")
  PORT=$((8820+i)) node render.cjs 60 "$TMP/part$i.mp4" "$T0" "$T1" > "$TMP/log$i.txt" 2>&1 &
done
wait
for i in $(seq 0 $((N-1))); do echo "file '$TMP/part$i.mp4'"; done > "$TMP/list.txt"
ffmpeg -v error -y -f concat -safe 0 -i "$TMP/list.txt" -c copy "$TMP/video.mp4"
python3 sfx.py "$TMP/audio.wav" $MUSIC
ffmpeg -v error -y -i "$TMP/video.mp4" -i "$TMP/audio.wav" -c:v copy -c:a aac -b:a 256k -shortest "$OUT"
rm -rf "$TMP"
echo "wrote $OUT"
