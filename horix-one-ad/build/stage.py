# Renders the 1080x1920 "stage" video (no text): background + live app footage in a card with camera moves.
import json, os, subprocess, sys, shutil, math, tempfile
import numpy as np
from PIL import Image, ImageDraw, ImageFilter
sys.path.insert(0, os.path.dirname(__file__)); from timeline import *
FPS = 30; W, H = 1080, 1920
CARD = (30, 410, 1020, 1080)          # x, y, w, h
A = '../assets/'

def ease(t): return t * t * (3 - 2 * t)
def cam_at(keys, u):
    for (u0, *a), (u1, *b) in zip(keys, keys[1:]):
        if u <= u1:
            k = ease(min(1, max(0, (u - u0) / max(1e-6, u1 - u0)))); return [x + (y - x) * k for x, y in zip(a, b)]
    return list(keys[-1][1:])

def bg_image():
    bg = Image.open(A + 'backgrounds/bg_dark_red_02.png').convert('RGB')
    return bg

def card_mask():
    m = Image.new('L', (CARD[2], CARD[3]), 0); ImageDraw.Draw(m).rounded_rectangle((0, 0, CARD[2] - 1, CARD[3] - 1), 34, fill=255); return m

def crop_cam(src, cx, cy, z, sw, sh):
    bw, bh = sw / z, sh / z
    x0, y0 = cx - bw / 2, cy - bh / 2
    x0 = min(max(x0, 0), src.width - bw) if bw <= src.width else (src.width - bw) / 2
    y0 = min(max(y0, 0), src.height - bh) if bh <= src.height else (src.height - bh) / 2
    return src.resize((sw, sh), Image.LANCZOS, box=(x0, y0, x0 + bw, y0 + bh))

def extract(seg, tmp):
    """Write the sped-up source frames of a segment: tmp/p<i>_%05d.jpg ; returns list of frame paths in order."""
    out = []
    for i, (a, b, sp) in enumerate(seg['pieces']):
        d = os.path.join(tmp, f'p{i}'); os.makedirs(d, exist_ok=True)
        subprocess.run(['ffmpeg', '-v', 'error', '-y', '-ss', str(a), '-t', str(b - a), '-i', VID[seg['src']],
                        '-vf', f'setpts=(PTS-STARTPTS)/{sp},fps={FPS}', '-q:v', '2', os.path.join(d, 'f_%05d.jpg')], check=True)
        out += sorted(os.path.join(d, f) for f in os.listdir(d))
    return out

def run(only=None, step=1, small=False, out='stage.mp4'):
    bg = bg_image(); mask = card_mask(); n_total = round(FINAL['total'] * FPS)
    # border + glow, pre-rendered
    glow = Image.new('RGBA', (W, H), (0, 0, 0, 0)); gd = ImageDraw.Draw(glow)
    gd.rounded_rectangle((CARD[0] - 6, CARD[1] - 6, CARD[0] + CARD[2] + 6, CARD[1] + CARD[3] + 6), 40, outline=(214, 60, 50, 230), width=3)
    glow2 = glow.filter(ImageFilter.GaussianBlur(26))
    sz = (W // 3, H // 3) if small else (W, H)
    cmd = ['ffmpeg', '-v', 'error', '-y', '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-s', f'{sz[0]}x{sz[1]}', '-r', str(FPS), '-i', '-',
           '-c:v', 'libx264', '-crf', '14' if not small else '28', '-pix_fmt', 'yuv420p', out]
    ff = subprocess.Popen(cmd, stdin=subprocess.PIPE)
    frames_written = 0
    def push(img):
        nonlocal frames_written
        if small: img = img.resize(sz, Image.BILINEAR)
        ff.stdin.write(img.tobytes()); frames_written += 1
    for seg in SEGS:
        if only and seg['id'] not in only: continue
        tmp = tempfile.mkdtemp(dir='/tmp'); fr = extract(seg, tmp); n = round(seg['dur'] * FPS)
        # pad to the exact length (hold last frame / trim)
        fr = (fr + [fr[-1]] * n)[:n]
        for i in range(n):
            src = Image.open(fr[i]).convert('RGB')
            if seg.get('pad'):
                cv = Image.new('RGB', (1440, 1467), (20, 20, 21)); cv.paste(src, (0, (1467 - 900) // 2)); src = cv
                cx, cy, z = cam_at(seg['cam'], i / n); cy += (1467 - 900) // 2 - 450 + 0
            else:
                cx, cy, z = cam_at(seg['cam'], i / n)
            punch = 1 + 0.10 * max(0, 1 - i / 8) ** 2           # zoom punch on every cut
            view = crop_cam(src, cx, cy, z * punch, CARD[2], CARD[3])
            frame = bg.copy().convert('RGBA'); frame.alpha_composite(glow2); frame.alpha_composite(glow)
            frame.paste(view, (CARD[0], CARD[1]), mask)
            push(frame.convert('RGB'))
        shutil.rmtree(tmp, ignore_errors=True); print('seg', seg['id'], n, flush=True)
    ff.stdin.close(); ff.wait(); print('frames', frames_written)

if __name__ == '__main__':
    only = sys.argv[1].split(',') if len(sys.argv) > 1 and sys.argv[1] != 'all' else None
    run(only, small=('small' in sys.argv), out=('stage_small.mp4' if 'small' in sys.argv else 'stage.mp4'))
