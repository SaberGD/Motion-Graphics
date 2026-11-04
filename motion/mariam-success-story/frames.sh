#!/usr/bin/env bash
# style frames for one option: frames.sh a "1.5,4.8,..." -> scratch contact sheet
O=$1; T=$2; S=${BUILD_ROOT:-/tmp/motion_build}/mariam; mkdir -p "$S"; D=$S/sf_$O; rm -rf "$D"
TIMES=$T node ../engine/render.js opt_$O.html "$D" 25 30 3 | grep ERR
python3 - "$D" "$S/sheet_$O.jpg" <<'PY'
import sys, glob; from PIL import Image
fs = sorted(glob.glob(sys.argv[1] + '/*.jpg')); W, H = 270, 480; c = 6; r = (len(fs) + c - 1) // c
o = Image.new('RGB', (W * c, H * r), 'white')
for i, f in enumerate(fs): o.paste(Image.open(f).resize((W, H)), ((i % c) * W, (i // c) * H))
o.save(sys.argv[2], quality=88)
PY
