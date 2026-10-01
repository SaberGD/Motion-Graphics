"""Reframe + grade the raw footage into a 1080x1920 base plate.

Smart reframing follows the speaker's face (smoothed per shot), applies a
per-shot zoom plan (alternating wide/tight to hide jump cuts, plus punch-ins
on emphasis words) and a zoom-blur transition on the scene changes.
"""
import json, subprocess, sys
import numpy as np, cv2

SRC = sys.argv[1]
OUT = sys.argv[2]
FPS = 30
OW, OH = 1080, 1920
PW, PH = 1440, 2560          # pre-scaled working plate (keeps detail up to ~1.33x zoom)
N = 1364

CUTS = [0, 4.567, 9.2, 10.467, 14.233, 25.067, 34.1, 37.6, 45.47]
BIG_CUTS = [25.067, 34.1]     # scene changes that get a zoom-blur transition

def ease(x):
    x = min(max(x, 0), 1)
    return 1 - (1 - x) ** 3

def punch(t, t0, t1, amt, din=.14, dout=.3):
    if t < t0 or t > t1 + dout:
        return 0
    return amt * ease((t - t0) / din) * (1 - ease((t - t1) / dout))

def zoom_at(t):
    if t < 4.567:   z = 1.0 + .10 * ease(t / 4.5)
    elif t < 9.2:   z = 1.16
    elif t < 10.467: z = 1.0 + punch(t, 9.86, 10.4, .12)
    elif t < 14.233: z = 1.0
    elif t < 25.067: z = 1.10 + punch(t, 14.98, 16.05, .12) + punch(t, 24.30, 24.95, .10)
    elif t < 34.1:  z = 1.0 + .08 * ease((t - 25.067) / 6) + punch(t, 31.90, 34.0, .12)
    elif t < 37.6:  z = 1.0 + punch(t, 35.96, 37.5, .10)
    else:           z = 1.04 + .08 * ease((t - 37.6) / 7.8)
    return z

# ---- face track, cleaned and smoothed per shot ----
face = json.load(open(sys.argv[3]))
fx = np.full(N, np.nan); fy = np.full(N, np.nan)
for i, x, y, w in face[:N]:
    if x is not None and w >= .2 and y < .5:
        fx[i], fy[i] = x, y
shot_id = np.array([sum(i / FPS >= c for c in CUTS[1:-1]) for i in range(N)])
sx = np.zeros(N); sy = np.zeros(N)
for s in np.unique(shot_id):
    idx = np.where(shot_id == s)[0]
    vx, vy = fx[idx], fy[idx]
    ok = ~np.isnan(vx)
    if ok.sum() == 0:
        vx[:] = .5; vy[:] = .15
    else:
        vx = np.interp(np.arange(len(idx)), np.where(ok)[0], vx[ok])
        vy = np.interp(np.arange(len(idx)), np.where(ok)[0], vy[ok])
    k = 31  # ~1s gaussian
    pad = lambda v: np.pad(v, k, mode='edge')
    g = cv2.getGaussianKernel(2 * k + 1, 9).ravel()
    sx[idx] = np.convolve(pad(vx), g, 'same')[k:-k]
    sy[idx] = np.convolve(pad(vy), g, 'same')[k:-k]
# first second: speaker walks in from the right
sx[:40] = np.linspace(.62, sx[40], 40)

# ---- grade: gentle S-curve, warmth, saturation, vignette ----
xs = np.arange(256) / 255.
curve = np.clip(.02 + .97 * (xs + .08 * (xs - .5) * (1 - np.abs(2 * xs - 1))), 0, 1)
lut_r = np.clip(curve * 1.015 * 255, 0, 255).astype(np.uint8)
lut_g = np.clip(curve * 255, 0, 255).astype(np.uint8)
lut_b = np.clip((curve * .975 + .01) * 255, 0, 255).astype(np.uint8)
yy, xx = np.mgrid[0:OH, 0:OW]
d = np.sqrt(((xx - OW / 2) / (OW * .75)) ** 2 + ((yy - OH * .42) / (OH * .72)) ** 2)
vign = (1 - .22 * np.clip(d - .45, 0, 1) ** 1.6)[..., None].astype(np.float32)

def grade(img):
    img = cv2.merge([cv2.LUT(img[..., 0], lut_r), cv2.LUT(img[..., 1], lut_g), cv2.LUT(img[..., 2], lut_b)])
    hsv = cv2.cvtColor(img, cv2.COLOR_RGB2HSV).astype(np.float32)
    hsv[..., 1] = np.clip(hsv[..., 1] * 1.08, 0, 255)
    img = cv2.cvtColor(hsv.astype(np.uint8), cv2.COLOR_HSV2RGB).astype(np.float32) * vign
    return np.clip(img, 0, 255).astype(np.uint8)

def frame_xform(i, extra=1.0):
    t = i / FPS
    z = zoom_at(t) * extra
    cw, ch = PW / z, PH / z
    cx = np.clip(sx[i] * PW, cw / 2, PW - cw / 2)
    eye = (sy[i] - .01) * PH
    top = np.clip(eye - .36 * ch, 0, PH - ch)
    s = OW / cw
    return np.float32([[s, 0, -(cx - cw / 2) * s], [0, s, -top * s]])

dec = subprocess.Popen(["ffmpeg", "-v", "error", "-i", SRC, "-vf", f"scale={PW}:{PH}:flags=lanczos",
                        "-f", "rawvideo", "-pix_fmt", "rgb24", "-"], stdout=subprocess.PIPE)
enc = subprocess.Popen(["ffmpeg", "-v", "error", "-y", "-f", "rawvideo", "-pix_fmt", "rgb24", "-s", f"{OW}x{OH}",
                        "-r", str(FPS), "-i", "-", "-c:v", "libx264", "-preset", "slow", "-crf", "12",
                        "-pix_fmt", "yuv420p", OUT], stdin=subprocess.PIPE)
for i in range(N):
    buf = dec.stdout.read(PW * PH * 3)
    if len(buf) < PW * PH * 3:
        break
    src = np.frombuffer(buf, np.uint8).reshape(PH, PW, 3)
    t = i / FPS
    # zoom-blur transition around big cuts
    dist = min((abs(t - c) for c in BIG_CUTS))
    if dist < .17:
        side = 1 if any(0 <= t - c < .17 for c in BIG_CUTS) else -1
        k = 1 - dist / .17
        base = 1 + .22 * k
        acc = np.zeros((OH, OW, 3), np.float32)
        taps = 7
        for j in range(taps):
            m = frame_xform(i, base + .06 * k * j / taps * side)
            acc += cv2.warpAffine(src, m, (OW, OH), flags=cv2.INTER_LINEAR, borderMode=cv2.BORDER_REFLECT)
        out = (acc / taps).astype(np.uint8)
        if dist < .04:  # 1-frame light flash on the cut
            out = cv2.addWeighted(out, .7, np.full_like(out, 255), .3, 0)
    else:
        out = cv2.warpAffine(src, frame_xform(i), (OW, OH), flags=cv2.INTER_CUBIC, borderMode=cv2.BORDER_REFLECT)
    enc.stdin.write(grade(out).tobytes())
    if i % 150 == 0:
        print("frame", i, flush=True)
enc.stdin.close(); enc.wait()
