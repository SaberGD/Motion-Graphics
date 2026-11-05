#!/usr/bin/env bash
# Start a new reel in the Saber Group × Mushroom motion system.
# usage: reels/new_reel.sh <name> <video.mp4> <music.wav|mp3> ["CTA html"]
#   - video and music should live under raw/<name>/ (raw/ is not in git)
# Creates reels/<name>/ from reels/_template and runs the analysis:
#   words.json (Whisper large-v3, Egyptian-primed) · face.json (YuNet) · beats.json (tempo/grid/sections)
#   cuts.txt (audio-measured pauses + proposed KEEP that never cuts inside a word) · analysis.md (summary)
set -euo pipefail
NAME=$1; VIDEO=$(cd "$(dirname "$2")" && pwd)/$(basename "$2"); MUSIC=$(cd "$(dirname "$3")" && pwd)/$(basename "$3")
CTA=${4:-"الملف في أول كومنت ⬇"}
H=$(cd "$(dirname "$0")" && pwd); REPO=$(cd "$H/.." && pwd); R=$H/$NAME
B=${BUILD_ROOT:-/tmp/reels_build}/$NAME; mkdir -p "$B"
[ -e "$R" ] && { echo "reels/$NAME already exists"; exit 1; }
mkdir -p "$R/assets" "$R/out"
rel() { python3 -c "import os,sys;print(os.path.relpath(sys.argv[1],sys.argv[2]))" "$1" "$R"; }

echo "== probe"; ffprobe -v error -show_entries stream=codec_type,width,height,r_frame_rate -of compact "$VIDEO"
echo "== transcribe (Whisper large-v3, CPU: a few minutes)"
ffmpeg -v error -y -i "$VIDEO" -vn -ac 1 -ar 16000 "$B/a16.wav"
python3 "$H/tools/transcribe.py" "$B/a16.wav" "$R/words.json" | tail -1
echo "== face track"; python3 "$H/tools/facetrack.py" "$VIDEO" "$R/face.json" 2>/dev/null | tail -1
echo "== music grid"; python3 "$H/tools/beats.py" "$MUSIC" "$R/beats.json" 2>&1 | grep -v Warn | tee "$B/beats.txt"
echo "== cuts"; python3 "$H/tools/cuts.py" "$VIDEO" "$R/words.json" | tee "$R/cuts.txt"
KEEP=$(grep '^KEEP =' "$R/cuts.txt" | sed 's/^KEEP = //')

python3 - "$H/_template/build_spec.py" "$R/build_spec.py" "$(rel "$VIDEO")" "$(rel "$MUSIC")" "$KEEP" "$NAME" "$CTA" <<'PY'
import sys
src, dst, video, music, keep, name, cta = sys.argv[1:]
s = open(src).read().replace('__SRC__', video).replace('__MUSIC__', music).replace('__KEEP__', keep).replace('__TITLE__', name).replace('__CTA__', cta)
open(dst, 'w').write(s)
PY
cp "$H/_template/SCRIPT.md" "$R/SCRIPT.md"
{ echo "# $NAME: analysis"; echo; echo '## Transcript (word index:word)'; echo
  python3 -c "import json;w=json.load(open('$R/words.json'));print(' '.join(f\"{i}:{x['w']}\" for i,x in enumerate(w)))"
  echo; echo '## Music'; echo '```'; cat "$B/beats.txt"; echo '```'; echo; echo '## Pauses / proposed cuts'; echo '```'; cat "$R/cuts.txt"; echo '```'; } > "$R/analysis.md"
python3 "$R/build_spec.py"
echo
echo "reels/$NAME is ready. Next (reels/SYSTEM.md §7):"
echo "  1. fix the transcript in cap.fix, write caption chunks (cap.starts) + one highlight per chunk (cap.hl)"
echo "  2. check every cut in cuts.txt by ear; add graphics to ELS; place SFX per motion"
echo "  3. BUILD_ROOT=$B/.. reels/preview.sh reels/$NAME t1,t2,...   -> send screenshots BEFORE rendering"
echo "  4. reels/render.sh reels/$NAME   -> out/${NAME}_original_colors.mp4 + out/${NAME}_graded.mp4"
