#!/usr/bin/env bash
# quick visual check: scripts/sheet.sh <variant> <frames,comma,list> <out.jpg>
set -e; cd "$(dirname "$0")/.."; V=$1; F=$2; OUT=$3; T=$(mktemp -d)
node scripts/render.mjs $V 4 $F >/dev/null; node scripts/render.mjs caps 4 $F >/dev/null
for f in ${F//,/ }; do n=$(printf %04d $f); ffmpeg -v error -y -i frames/$V/f$n.jpg -i frames/caps/f$n.png -filter_complex "overlay,scale=360:640,drawtext=text='$n':x=8:y=600:fontsize=26:fontcolor=yellow:box=1:boxcolor=black" $T/c_$n.jpg; done
ffmpeg -v error -y -pattern_type glob -i "$T/c_*.jpg" -vf tile=6x2 -frames:v 1 $OUT; rm -rf $T
