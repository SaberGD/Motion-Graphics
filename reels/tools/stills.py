"""Thumbnail stills from a reel's source footage.

usage:
  python3 stills.py <reel_dir> sheet            -> <BUILD_ROOT>/<reel>/stills_candidates.jpg (sharpest frames, numbered)
  python3 stills.py <reel_dir> 63,234,792,...   -> <reel_dir>/thumbnail/stills/still_NN_original.png + _graded.png

The graded stills use the same 'cine' grade as the graded video. They are built from a tiny clip of exactly
those frames, because OpenCV seeking in long-GOP h264 is not frame-accurate.
"""
import json, os, subprocess, sys
import numpy as np, cv2

R = os.path.abspath(sys.argv[1]); NAME = os.path.basename(R)
E = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'engine')
B = os.path.join(os.environ.get('BUILD_ROOT', '/tmp/reels_build'), NAME); os.makedirs(B, exist_ok=True)
spec = json.load(open(os.path.join(R, 'spec.json')))
src = os.path.join(R, spec['src']); face = json.load(open(os.path.join(R, spec['face'])))
ft = np.array([f[0] for f in face])

if sys.argv[2] == 'sheet':
    from PIL import Image, ImageDraw
    cap = cv2.VideoCapture(src); res = []; i = 0
    while True:
        ok, fr = cap.read()
        if not ok: break
        if i % 3 == 0 and i > 3:
            _, cx, cy, h = face[int(np.argmin(abs(ft - i / 30)))]; Hh, W = fr.shape[:2]
            crop = fr[max(0, int(cy * Hh - h * Hh)):int(cy * Hh + h * Hh * 2.5), max(0, int(cx * W - h * Hh * 1.2)):int(cx * W + h * Hh * 1.2)]
            res.append((cv2.Laplacian(cv2.cvtColor(crop, cv2.COLOR_BGR2GRAY), cv2.CV_64F).var(), i))
        i += 1
    res.sort(reverse=True); pick = []
    for _, f in res:
        if all(abs(f - p) > 24 for p in pick): pick.append(f)
        if len(pick) >= 33: break
    pick.sort(); cap = cv2.VideoCapture(src); W, H = 180, 320
    o = Image.new('RGB', (W * 11, (H + 24) * 3)); d = ImageDraw.Draw(o)
    for n, f in enumerate(pick):
        cap.set(cv2.CAP_PROP_POS_FRAMES, f); ok, fr = cap.read()
        im = Image.fromarray(cv2.cvtColor(fr, cv2.COLOR_BGR2RGB)).resize((W, H))
        o.paste(im, ((n % 11) * W, (n // 11) * (H + 24))); d.text(((n % 11) * W + 4, (n // 11) * (H + 24) + H + 4), f'frame {f}', fill=(255, 140, 30))
    o.save(os.path.join(B, 'stills_candidates.jpg')); print(os.path.join(B, 'stills_candidates.jpg')); print('frames:', pick)
    sys.exit()

F = [int(x) for x in sys.argv[2].split(',')]
D = os.path.join(R, 'thumbnail', 'stills'); os.makedirs(D, exist_ok=True)
sel = '+'.join(f'eq(n\\,{f})' for f in F)
clip = os.path.join(B, 'stills_clip.mp4')
subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', src, '-vf', f"select='{sel}',setpts=N/30/TB", '-r', '30', '-c:v', 'libx264', '-crf', '4',
                '-pix_fmt', 'yuv420p', '-an', clip], check=True)
json.dump([[k / 30, *face[int(np.argmin(abs(ft - f / 30)))][1:]] for k, f in enumerate(F)], open(os.path.join(B, 'stills_face.json'), 'w'))
s = dict(spec, src=clip, face=os.path.join(B, 'stills_face.json'), keep=[[0, len(F) / 30]], cam=[[0, 1.0], [1, 1.0]], punch=[], fx=[],
         outro={'dur': 0}, sharpen=0)
sp = os.path.join(B, 'stills_spec.json'); json.dump(s, open(sp, 'w'), ensure_ascii=False)
graded = os.path.join(B, 'stills_graded.mp4')
subprocess.run(['python3', os.path.join(E, 'base.py'), sp, graded], env=dict(os.environ, GRADE='cine'), check=True, capture_output=True)
for k, f in enumerate(F):
    subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', src, '-vf', f'select=eq(n\\,{f})', '-frames:v', '1', os.path.join(D, f'still_{k + 1:02d}_original.png')], check=True)
    subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', graded, '-vf', f'select=eq(n\\,{k})', '-frames:v', '1', os.path.join(D, f'still_{k + 1:02d}_graded.png')], check=True)
print('wrote', len(F) * 2, 'stills to', D)
