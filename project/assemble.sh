#!/usr/bin/env bash
# Composite base plate + motion-graphics overlay + cleaned voice + SFX into the final reel.
# usage: assemble.sh <raw.mp4> <base.mp4> <overlay_dir> <sfx.wav> <out.mp4>
set -euo pipefail
RAW=$1 BASE=$2 OV=$3 SFX=$4 OUT=$5
ffmpeg -v error -stats -y \
  -i "$BASE" -framerate 30 -start_number 0 -i "$OV/ov_%05d.png" -i "$RAW" -i "$SFX" \
  -filter_complex "
    [0:v][1:v]overlay=format=auto:shortest=1,setsar=1,format=yuv420p[v];
    [2:a]aresample=48000,highpass=f=80,afftdn=nr=10:nf=-42,
         equalizer=f=220:t=q:w=1.2:g=-1.5,equalizer=f=3200:t=q:w=1.4:g=2.5,equalizer=f=7000:t=q:w=2:g=-1.5,
         acompressor=threshold=-21dB:ratio=3:attack=5:release=90:makeup=2,asplit=2[voice][key];
    [3:a]aresample=48000,aformat=channel_layouts=stereo[sfx];
    [sfx][key]sidechaincompress=threshold=0.04:ratio=5:attack=4:release=180[sfxd];
    [voice][sfxd]amix=inputs=2:duration=first:normalize=0,
         loudnorm=I=-14:TP=-1.5:LRA=7,afade=t=in:d=0.05,afade=t=out:st=45.25:d=0.2[a]" \
  -map "[v]" -map "[a]" -c:v libx264 -preset slow -crf 19 -profile:v high -r 30 \
  -c:a aac -b:a 256k -ar 48000 -movflags +faststart "$OUT"
