#!/usr/bin/env bash
# Extracts the frames the composition reads: doctor plates (AI corner mark removed) + B-roll frames at native 24fps.
# Usage: scripts/prep.sh /path/to/Saber_Motion_Pack
set -euo pipefail
PACK="${1:?path to Saber_Motion_Pack}"
cd "$(dirname "$0")/.."
mkdir -p cache
for v in yellow green; do
  mkdir -p cache/doctor_$v
  ffmpeg -v error -y -i "$PACK/01_videos_no_broll/doctor_${v}_blazer_no_broll_1080p.mp4" \
    -vf "delogo=x=12:y=14:w=74:h=56" -q:v 2 cache/doctor_$v/f%04d.jpg
done
for b in B1 B2 B3 B4; do
  mkdir -p cache/$b
  ffmpeg -v error -y -i "$(ls "$PACK"/02_brolls_ai/${b}_*.mp4)" -q:v 2 cache/$b/f%04d.jpg
done
cp "$PACK/03_audio_and_script/original_voice_27.5s.wav" cache/voice.wav
for d in cache/*/; do echo "$d $(ls $d | wc -l)"; done
