#!/usr/bin/env bash
# Full build: captions -> audio -> render frames -> encode deliverables.
# Usage: scripts/make.sh [/path/to/Saber_Motion_Pack]   (pack only needed if cache/ is missing)
set -euo pipefail
cd "$(dirname "$0")/.."
OUT=../output
[ -d cache/doctor_yellow ] || scripts/prep.sh "${1:?pass the Saber_Motion_Pack path on first run}"
python3 scripts/captions.py
python3 scripts/audio.py
for p in yellow green caps; do node scripts/render.mjs $p 4; done

X264=(-c:v libx264 -preset slow -crf 16 -pix_fmt yuv420p -profile:v high -r 30 -movflags +faststart)
AAC=(-c:a aac -b:a 320k -ar 48000)
for v in yellow green; do
  ffmpeg -v error -y -framerate 30 -i frames/$v/f%04d.jpg -i $OUT/stems/mix.wav \
    "${X264[@]}" "${AAC[@]}" -shortest $OUT/lip_filler_${v}_NO_captions.mp4
  ffmpeg -v error -y -framerate 30 -i frames/$v/f%04d.jpg -framerate 30 -i frames/caps/f%04d.png -i $OUT/stems/mix.wav \
    -filter_complex "[0:v][1:v]overlay=0:0:format=auto[v]" -map "[v]" -map 2:a \
    "${X264[@]}" "${AAC[@]}" -shortest $OUT/lip_filler_${v}_WITH_captions.mp4
done
# captions as a separate transparent layer (drop on top of the NO_captions video in any editor)
ffmpeg -v error -y -framerate 30 -i frames/caps/f%04d.png -c:v qtrle -pix_fmt argb $OUT/captions_layer_alpha.mov
ls -la $OUT
