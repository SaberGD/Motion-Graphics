"""Base plate: jump-cut edit + face-following reframe + camera moves + in-camera transitions.

usage: base.py <spec.json> <out.mp4>
Spec keys used: src, keep, face, cam, punch, fx, grade.
  cam   : [[t, zoom], ...] keyframes (output time), eased between; default = alternate per jump cut
  punch : [[t0, t1, amt], ...] snappy punch-ins on emphasis
  fx    : [{"t":, "type": "zoomblur"|"whip"|"flash"|"shake", "d":, "dir":}]
"""
import json, os, subprocess, sys
import numpy as np, cv2
sys.path.insert(0, os.path.dirname(__file__))
from timeline import FPS, load_spec, keeps, speech_duration, out_to_src, cut_points

OW, OH = 1080, 1920
spec = load_spec(sys.argv[1]); OUT = sys.argv[2]
D = spec['_dir']
src = os.path.join(D, spec['src'])
cap = cv2.VideoCapture(src)
SW, SH = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH)), int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
SN = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
# base 9:16 window inside the source
BW = min(SW, SH * 9 / 16); BH = BW * 16 / 9
N = int(round((speech_duration(spec) + (spec.get('outro', {}).get('dur', 0) if spec.get('outro', {}).get('freeze') else 0)) * FPS))


def ease(x):
    x = min(max(x, 0), 1)
    return x * x * (3 - 2 * x)


def ease_out(x):
    x = min(max(x, 0), 1)
    return 1 - (1 - x) ** 3


# ---------- camera zoom ----------
cuts = [0] + cut_points(spec) + [speech_duration(spec)]
if spec.get('cam'):
    cam = spec['cam']
else:  # alternate wide / medium per segment with a slow push to hide jump cuts
    cam = []
    for i in range(len(cuts) - 1):
        z = 1.0 if i % 2 == 0 else 1.22
        cam += [[cuts[i], z], [cuts[i + 1] - .001, z + .05]]


def cam_zoom(t):
    if t <= cam[0][0]: return cam[0][1]
    for (t0, z0), (t1, z1) in zip(cam, cam[1:]):
        if t0 <= t <= t1:
            if t1 - t0 < .01: return z1
            # hard step when keyframes are at a cut (within 1 frame), else eased
            return z0 + (z1 - z0) * ease((t - t0) / (t1 - t0))
    return cam[-1][1]


def punch(t):
    z = 0
    for p in spec.get('punch', []):
        t0, t1, amt = p[:3]
        if t0 <= t <= t1 + .35:
            z += amt * ease_out((t - t0) / .12) * (1 - ease((t - t1) / .35))
    return z


# ---------- face track, smoothed per segment ----------
face = json.load(open(os.path.join(D, spec['face'])))
ft = np.array([f[0] for f in face]); fx = np.array([f[1] for f in face]); fy = np.array([f[2] for f in face])
ts = np.array([out_to_src(spec, i / FPS) for i in range(N)])
sx = np.interp(ts, ft, fx); sy = np.interp(ts, ft, fy)
seg = np.searchsorted(np.array(cuts[1:-1]), np.arange(N) / FPS, side='right')
g = cv2.getGaussianKernel(61, 14).ravel()
for s in np.unique(seg):
    idx = np.where(seg == s)[0]
    for arr in (sx, sy):
        v = np.pad(arr[idx], 30, mode='edge')
        arr[idx] = np.convolve(v, g, 'same')[30:-30]

# ---------- optional person matte (alpha video of the source's 9:16 window at 1080x1920) ----------
MATTE = spec.get('matte'); acap = None
if MATTE:
    acap = cv2.VideoCapture(MATTE if os.path.isabs(MATTE) else os.path.join(D, MATTE))
    AK = BW / 1080.0; AX0 = (SW - BW) / 2; AY0 = (SH - BH) / 2
    aout = subprocess.Popen(['ffmpeg', '-v', 'error', '-y', '-f', 'rawvideo', '-pix_fmt', 'gray', '-s', f'{OW}x{OH}', '-r', str(FPS), '-i', '-',
                             '-c:v', 'libx264', '-preset', 'medium', '-crf', '12', '-pix_fmt', 'yuv420p', OUT.replace('.mp4', '_alpha.mp4')], stdin=subprocess.PIPE)
G = spec.get('look', {})


def pro_grade(img, a):
    """Subject-aware grade. img uint8 BGR, a float32 0..1 (person)."""
    x = img.astype(np.float32) / 255.
    # edge clean-up: the source has a 1-px oversharpening line along the speaker's outline that zooming makes
    # visible; in a thin band around the matte edge, take a morphological opening (removes thin bright lines)
    if G.get('edge_clean', 4):
        k = int(G.get('edge_clean', 4))
        band = (cv2.dilate(a, np.ones((2 * k + 1, 2 * k + 1), np.uint8)) - cv2.erode(a, np.ones((2 * k + 1, 2 * k + 1), np.uint8)))
        band = cv2.GaussianBlur(np.clip(band * 1.5, 0, 1), (0, 0), 1.5)[..., None]
        ker = np.ones((5, 5), np.uint8)
        opened = cv2.dilate(cv2.erode(x, ker), ker)
        x = x * (1 - band) + cv2.GaussianBlur(opened, (0, 0), .8) * band
    a3 = cv2.GaussianBlur(a, (0, 0), 1.6)[..., None]
    # background: premultiplied blur (no halo from the subject), darker, a touch cooler and less saturated
    sig = G.get('bg_blur', 5.0)
    a2 = a3[..., 0]
    if sig > 0:
        # gather background only from pixels clearly outside the speaker (dilated matte) so the bright shirt
        # never bleeds into the blurred room as a halo
        ad = cv2.dilate(a2, np.ones((9, 9), np.uint8), iterations=2)
        inv = np.clip(1 - ad * 1.5, 0, 1)
        num = cv2.GaussianBlur(x * inv[..., None], (0, 0), sig)
        den = cv2.GaussianBlur(inv, (0, 0), sig)[..., None]
        # where the speaker hides the room, fill from a much wider blur instead of the original (bright) pixel
        num2 = cv2.GaussianBlur(x * inv[..., None], (0, 0), sig * 6); den2 = cv2.GaussianBlur(inv, (0, 0), sig * 6)[..., None]
        fill = num2 / np.maximum(den2, 1e-4)
        w = np.clip(den / .08, 0, 1)
        bg = (num / np.maximum(den, 1e-4)) * w + fill * (1 - w)
    else:
        bg = x
    bg = bg * G.get('bg_gain', .80)
    gray = bg.mean(2, keepdims=True); bg = gray + (bg - gray) * G.get('bg_sat', .92)
    # subject: lift mids, gentle warmth, protect highlights (white shirt)
    sb = np.power(np.clip(x, 0, 1), G.get('subj_gamma', .90)) * G.get('subj_gain', 1.04)
    sb = sb * np.array(G.get('subj_tint', [0.985, 1.0, 1.02]), np.float32)  # BGR
    gray = sb.mean(2, keepdims=True); sb = gray + (sb - gray) * G.get('subj_sat', 1.03)
    o = bg * (1 - a3) + sb * a3
    # global filmic curve: soft toe, highlight shoulder
    o = np.clip(o, 0, None)
    o = o / (1 + .18 * o) * 1.18                       # shoulder (roll highlights)
    o = o + .045 * np.sin(np.pi * np.clip(o, 0, 1)) * (np.clip(o, 0, 1) - .5) * 2  # mild S
    o = .012 + o * (1 - .012)                           # lifted black point (no crush)
    o = o * vig
    return np.clip(o * 255, 0, 255).astype(np.uint8)


# ---------- grade ----------
GRADE = spec.get('grade', 'light')
xs = np.arange(256) / 255.
lut_curve = np.clip(xs - .03 * np.sin(2 * np.pi * xs), 0, 1)  # gentle S
lut = np.stack([np.clip(lut_curve * 1.0 + .006, 0, 1), lut_curve, np.clip(lut_curve * .985, 0, 1)], 1)  # BGR: tiny warm
lut = (lut * 255).astype(np.uint8)
yy, xx = np.mgrid[0:OH, 0:OW]
vig = 1 - .28 * (((xx - OW / 2) / (OW * .62)) ** 2 + ((yy - OH * .45) / (OH * .62)) ** 2)
vig = np.clip(vig, .62, 1).astype(np.float32)[..., None]
if spec.get('grade') == 'pro':
    vig = (1 - (1 - vig) * .55).astype(np.float32)


def grade(img):
    if GRADE == 'none': return img
    out = np.empty_like(img)
    for c in range(3): out[..., c] = cv2.LUT(img[..., c], lut[:, c].copy())
    return (out.astype(np.float32) * vig).astype(np.uint8)


# ---------- transitions ----------
FX = spec.get('fx', [])


def zoom_img(img, s, cx=OW / 2, cy=OH / 2):
    M = np.float32([[s, 0, cx - s * cx], [0, s, cy - s * cy]])
    return cv2.warpAffine(img, M, (OW, OH), flags=cv2.INTER_LINEAR, borderMode=cv2.BORDER_REFLECT)


def apply_fx(img, t):
    for f in FX:
        d = f.get('d', .3); k = (t - f['t']) / d  # -1..1 around the event
        if abs(k) >= 1: continue
        a = 1 - abs(k)
        typ = f['type']
        if typ == 'zoomblur':
            acc = img.astype(np.float32); n = 6
            for i in range(1, n):
                acc += zoom_img(img, 1 + .045 * a * i)
            img = (acc / n).astype(np.uint8)
            img = zoom_img(img, 1 + .12 * a * a)
        elif typ == 'whip':
            dx = int(f.get('dir', 1) * 140 * a * a * np.sign(k or 1))
            ksz = max(3, int(90 * a)) | 1
            kern = np.zeros((1, ksz), np.float32); kern[0, :] = 1 / ksz
            img = cv2.filter2D(img, -1, kern)
            img = np.roll(img, dx, axis=1)
        elif typ == 'flash':
            img = cv2.addWeighted(img, 1, np.full_like(img, 255), f.get('amt', .5) * a ** 2, 0)
        elif typ == 'shake':
            r = np.random.RandomState(int(t * 1000))
            img = np.roll(img, (int(r.randn() * 14 * a), int(r.randn() * 10 * a)), axis=(0, 1))
        elif typ == 'blur':
            sgm = 18 * a * a
            if sgm > .3: img = cv2.GaussianBlur(img, (0, 0), sgm)
    return img


# ---------- render ----------
FACE_Y = spec.get('face_y', .30)  # where the face sits (fraction of frame height) when zoomed
ff = subprocess.Popen(['ffmpeg', '-v', 'error', '-y', '-f', 'rawvideo', '-pix_fmt', 'bgr24', '-s', f'{OW}x{OH}', '-r', str(FPS),
                       '-i', '-', '-c:v', 'libx264', '-preset', 'medium', '-crf', '14', '-pix_fmt', 'yuv420p', OUT],
                      stdin=subprocess.PIPE)
cur = -1; frame = None
for i in range(N):
    t = i / FPS
    si = min(int(round(ts[i] * FPS)), SN - 1)
    if si != cur + 1 or frame is None:
        cap.set(cv2.CAP_PROP_POS_FRAMES, si)
        if acap is not None: acap.set(cv2.CAP_PROP_POS_FRAMES, si)
    ok, f2 = cap.read()
    if ok: frame = f2
    if acap is not None:
        ok2, a2 = acap.read()
        if ok2: aframe = a2[..., 0]
    cur = si
    z = cam_zoom(t) + punch(t)
    w = BW / z; h = BH / z
    cx = sx[i] * SW; cy = sy[i] * SH
    # keep the face centred-ish horizontally (weighted toward centre at low zoom)
    k = min(1, (z - 1) / .35)
    cx = (SW / 2) * (1 - k) + cx * k
    # vertical: at z=1 use the full height, when zoomed put the face at FACE_Y
    cy_target = cy - (FACE_Y - .5) * h
    cy = (SH / 2) * (1 - k) + cy_target * k
    x0 = np.clip(cx - w / 2, 0, SW - w); y0 = np.clip(cy - h / 2, 0, SH - h)
    s = OW / w
    M = np.float32([[s, 0, -x0 * s], [0, s, -y0 * s]])
    img = cv2.warpAffine(frame, M, (OW, OH), flags=cv2.INTER_CUBIC if s > 1 else cv2.INTER_AREA)
    if s > 1.15:  # recover a little crispness on upscaled punch-ins
        amt = spec.get('sharpen', .35)  # gentle on big upscales: strong unsharp rings on shirt/background edges
        bl = cv2.GaussianBlur(img, (0, 0), 1.0)
        img = cv2.addWeighted(img, 1 + amt, bl, -amt, 0)
    if acap is not None:
        MA = np.float32([[s * AK, 0, s * (AX0 - x0)], [0, s * AK, s * (AY0 - y0)]])
        al = cv2.warpAffine(aframe, MA, (OW, OH), flags=cv2.INTER_LINEAR).astype(np.float32) / 255.
        img = pro_grade(img, al)
        aout.stdin.write((al * 255).astype(np.uint8).tobytes())
        img = apply_fx(img, t)
    elif GRADE == 'spot':
        # no matte: a soft, wide 'spotlight' that follows the face lifts the speaker gently out of the room
        # (very feathered, never touches hair edges), then the same filmic grade as 'pro' without background blur
        fxo = (sx[i] * SW - x0) * s; fyo = (sy[i] * SH - y0) * s
        sm = np.zeros((OH // 8, OW // 8), np.float32)
        cv2.ellipse(sm, (int(fxo / 8), int((fyo + G.get('spot_dy', 420)) / 8)), (int(G.get('spot_rx', 470) / 8), int(G.get('spot_ry', 980) / 8)), 0, 0, 360, 1, -1)
        sm = cv2.GaussianBlur(sm, (0, 0), G.get('spot_feather', 22))
        al = cv2.resize(sm, (OW, OH), interpolation=cv2.INTER_LINEAR)
        img = apply_fx(pro_grade(img, al), t)
    else:
        img = apply_fx(grade(img), t)
    ff.stdin.write(img.tobytes())
    if i % 150 == 0: print('base', i, '/', N, flush=True)
ff.stdin.close(); ff.wait()
if acap is not None: aout.stdin.close(); aout.wait()
print('done', OUT, N, 'frames')
