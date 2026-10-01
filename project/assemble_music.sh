#!/usr/bin/env bash
# Composite base + overlay and mix: untouched voice (gain only) + SFX + music bed ducked under the voice.
# usage: assemble_music.sh <raw.mp4> <base.mp4> <overlay_dir> <sfx.wav> <music.mp3> <music_start_s> <music_gain_db> <out.mp4> [master_gain_db]
set -euo pipefail
RAW=$1 BASE=$2 OV=$3 SFX=$4 MUSIC=$5 MSTART=$6 MGAIN=$7 OUT=$8 MASTER=${9:-1.5}
VOICE_GAIN=3.5   # raw voice is ~-19 LUFS; lift it to ~-15.5 LUFS, no EQ / compression / denoise
SFX_GAIN=8
ffmpeg -v error -stats -y \
  -i "$BASE" -framerate 30 -start_number 0 -i "$OV/ov_%05d.png" -i "$RAW" -i "$SFX" -ss "$MSTART" -t 46 -i "$MUSIC" \
  -filter_complex "
    [0:v][1:v]overlay=format=auto:shortest=1,setsar=1,format=yuv420p[v];
    [2:a]aresample=48000,aformat=channel_layouts=stereo,volume=${VOICE_GAIN}dB,asplit=2[voice][key];
    [4:a]aresample=48000,aformat=channel_layouts=stereo,volume=${MGAIN}dB,afade=t=in:d=0.03,afade=t=out:st=44.0:d=1.5[mus];
    [mus][key]sidechaincompress=threshold=0.06:ratio=2.5:attack=15:release=400:knee=6[musd];
    [3:a]aresample=48000,aformat=channel_layouts=stereo,volume=${SFX_GAIN}dB[sfx];
    [voice][musd][sfx]amix=inputs=3:duration=first:normalize=0,volume=${MASTER}dB,
         alimiter=limit=0.84:attack=3:release=60:level=false,afade=t=out:st=45.25:d=0.2[a]" \
  -map "[v]" -map "[a]" -c:v libx264 -preset slow -crf 19 -profile:v high -r 30 \
  -c:a aac -b:a 256k -ar 48000 -movflags +faststart "$OUT"
