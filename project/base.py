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

# subtle finishing pass for footage that is already colour graded:
# lift the mids a touch, soft contrast, keep skin natural, light vignette to focus the face
lx = np.arange(256) / 255.
lcurve = np.clip(lx + .035 * np.sin(np.pi * lx) + .045 * (lx - .5) * (1 - np.abs(2 * lx - 1)), 0, 1)
llut = (lcurve * 255).astype(np.uint8)
lvign = (1 - .13 * np.clip(d - .5, 0, 1) ** 1.5)[..., None].astype(np.float32)

def light_grade(img):
    img = cv2.LUT(img, llut)
    hsv = cv2.cvtColor(img, cv2.COLOR_RGB2HSV).astype(np.float32)
    hsv[..., 1] = np.clip(hsv[..., 1] * 1.04, 0, 255)
    img = cv2.cvtColor(hsv.astype(np.uint8), cv2.COLOR_HSV2RGB).astype(np.float32) * lvign
    return np.clip(img, 0, 255).astype(np.uint8)

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

# ---- optional motion-graphics cutaways (B-roll) with transitions ----
# argv: SRC OUT face.json [--no-grade] [--mg mg.mp4]
GRADE = '--no-grade' not in sys.argv
LIGHT = '--light-grade' in sys.argv

MG = sys.argv[sys.argv.index('--mg') + 1] if '--mg' in sys.argv else None
MG_OFFSET = .04   # mg render lags the voice by ~40ms (audio cross-correlation)
TD = .30          # transition length (s)
# (start, end, transition in, transition out)
CUTAWAYS = [
    (10.47, 16.10, 'push', 'zoomout'), # years-of-experience bars + AI resets the counter
    (22.95, 25.067, 'zoom', 'whip'),   # everyone experimenting from the starting line (exits on the location change)
    (35.00, 37.75, 'push', 'zoomout'), # ride the AI wave -> "you'll regret it"; out-transition runs 37.6-37.9 so it lands on the next clip
] if MG else []

def mblur(img, k, axis):
    k = int(k)
    if k < 3: return img
    return cv2.blur(img, (k, 1) if axis == 'x' else (1, k))

def scale_about(img, s):
    if abs(s - 1) < 1e-3: return img
    m = cv2.getRotationMatrix2D((OW / 2, OH * .42), 0, s)
    return cv2.warpAffine(img, m, (OW, OH), flags=cv2.INTER_LINEAR, borderMode=cv2.BORDER_REFLECT)

def shift(img, dx, dy):
    m = np.float32([[1, 0, dx], [0, 1, dy]])
    return cv2.warpAffine(img, m, (OW, OH), flags=cv2.INTER_LINEAR, borderMode=cv2.BORDER_REFLECT)

def ease_io(x):
    x = min(max(x, 0), 1)
    return 4 * x ** 3 if x < .5 else 1 - (-2 * x + 2) ** 3 / 2

yy2, xx2 = np.mgrid[0:OH, 0:OW].astype(np.float32)
RR = np.sqrt((xx2 - OW / 2) ** 2 + (yy2 - OH * .45) ** 2)
RMAX = float(RR.max())

def transition(kind, A, B, p):
    """A = outgoing frame, B = incoming frame, p in [0,1]."""
    e = ease_io(p); sp = np.sin(np.pi * p)   # speed proxy, peaks mid-transition
    if kind in ('zoom', 'zoomout'):
        a = scale_about(A, 1 + .45 * e); b = scale_about(B, 1.25 - .25 * e)
        a = cv2.GaussianBlur(a, (0, 0), 1 + 12 * sp); b = cv2.GaussianBlur(b, (0, 0), 1 + 12 * sp)
        return cv2.addWeighted(a, 1 - e, b, e, 0)
    if kind in ('push', 'pushdown'):
        d = -1 if kind == 'push' else 1
        off = e * OH
        a = mblur(shift(A, 0, d * off), 2 + 90 * sp, 'y'); b = mblur(shift(B, 0, d * (off - OH)), 2 + 90 * sp, 'y')
        out = a.copy()
        if d < 0: out[int(OH - off):] = b[int(OH - off):]
        else:     out[:int(off)] = b[:int(off)]
        return out
    if kind == 'whip':
        off = e * OW
        a = mblur(shift(A, off, 0), 2 + 160 * sp, 'x'); b = mblur(shift(B, off - OW, 0), 2 + 160 * sp, 'x')
        out = a.copy(); out[:, :int(off)] = b[:, :int(off)]
        return out
    if kind == 'iris':
        r = e * RMAX * 1.02
        m = np.clip((r - RR) / 6 + .5, 0, 1)[..., None]
        out = A * (1 - m) + B * m
        ring = np.clip(1 - np.abs(RR - r) / 9, 0, 1)[..., None] * (p < .98)
        out = out * (1 - ring) + np.array([255, 107, 26], np.float32) * ring
        return out.astype(np.uint8)
    if kind == 'flash':
        b = scale_about(B, 1.12 - .12 * e)
        out = A if p < .5 else b
        w = 1 - abs(p - .5) * 2
        return cv2.addWeighted(out, 1 - .55 * w, np.full_like(out, 255), .55 * w, 0)
    return B

def cutaway_state(t):
    """returns (kind, p, a_is_speaker) when in a transition, ('mg',) when fully on mg, None otherwise."""
    for s0, s1, kin, kout in CUTAWAYS:
        if s0 - TD / 2 <= t < s0 + TD / 2: return (kin, (t - s0 + TD / 2) / TD, True)
        if s1 - TD / 2 <= t < s1 + TD / 2: return (kout, (t - s1 + TD / 2) / TD, False)
        if s0 + TD / 2 <= t < s1 - TD / 2: return ('mg',)
    return None

dec = subprocess.Popen(["ffmpeg", "-v", "error", "-i", SRC, "-vf", f"scale={PW}:{PH}:flags=lanczos",
                        "-f", "rawvideo", "-pix_fmt", "rgb24", "-"], stdout=subprocess.PIPE)
mgdec = subprocess.Popen(["ffmpeg", "-v", "error", "-ss", str(MG_OFFSET), "-i", MG, "-vf", f"fps={FPS},scale={OW}:{OH}",
                          "-f", "rawvideo", "-pix_fmt", "rgb24", "-"], stdout=subprocess.PIPE) if MG else None
enc = subprocess.Popen(["ffmpeg", "-v", "error", "-y", "-f", "rawvideo", "-pix_fmt", "rgb24", "-s", f"{OW}x{OH}",
                        "-r", str(FPS), "-i", "-", "-c:v", "libx264", "-preset", "slow", "-crf", "12",
                        "-pix_fmt", "yuv420p", OUT], stdin=subprocess.PIPE)
mgf = None
for i in range(N):
    buf = dec.stdout.read(PW * PH * 3)
    if len(buf) < PW * PH * 3:
        break
    if mgdec:
        mb = mgdec.stdout.read(OW * OH * 3)
        if len(mb) == OW * OH * 3:
            mgf = np.frombuffer(mb, np.uint8).reshape(OH, OW, 3)
    src = np.frombuffer(buf, np.uint8).reshape(PH, PW, 3)
    t = i / FPS
    st = cutaway_state(t)
    if st and st[0] == 'mg':
        enc.stdin.write(mgf.tobytes()); continue
    # zoom-blur transition around big cuts
    cuts = [c for c in BIG_CUTS if not any(s0 - .5 < c < s1 + .5 for s0, s1, *_ in CUTAWAYS)]
    dist = min((abs(t - c) for c in cuts), default=9)
    if dist < .17:
        side = 1 if any(0 <= t - c < .17 for c in cuts) else -1
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
    spk = light_grade(out) if LIGHT else grade(out) if GRADE else out
    if st:
        kind, p, spk_first = st
        out = transition(kind, spk, mgf, p) if spk_first else transition(kind, mgf, spk, p)
    else:
        out = spk
    enc.stdin.write(np.ascontiguousarray(out).tobytes())
    if i % 150 == 0:
        print("frame", i, flush=True)
enc.stdin.close(); enc.wait()
