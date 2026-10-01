"""Synthesise a subtle SFX bed (whooshes, pops, ticks, typing) synced to the motion graphics."""
import numpy as np, wave, sys

SR = 48000
DUR = 45.47
out = np.zeros((int(SR * DUR) + SR, 2), np.float32)
rng = np.random.default_rng(7)

def env(n, a, r):
    e = np.ones(n)
    na, nr = int(a * SR), int(r * SR)
    e[:na] = np.linspace(0, 1, na) ** 2
    e[-nr:] *= np.linspace(1, 0, nr) ** 2
    return e

def bandsweep(noise, f0, f1):
    # cheap swept band-pass: one-pole lowpass minus a lower lowpass, cutoffs swept
    n = len(noise); y = np.zeros(n); lo = hi = 0.0
    fc_hi = np.geomspace(f0, f1, n); fc_lo = fc_hi * .35
    a_hi = 1 - np.exp(-2 * np.pi * fc_hi / SR); a_lo = 1 - np.exp(-2 * np.pi * fc_lo / SR)
    for i in range(n):
        hi += a_hi[i] * (noise[i] - hi); lo += a_lo[i] * (noise[i] - lo); y[i] = hi - lo
    return y / (np.abs(y).max() + 1e-9)

def whoosh(dur=.38, f0=300, f1=4000, rev=False):
    n = int(dur * SR)
    y = bandsweep(rng.standard_normal(n), f0, f1) * env(n, dur * .55, dur * .4)
    return y[::-1] if rev else y

def pop(f0=1100, f1=380, dur=.09):
    n = int(dur * SR); t = np.arange(n) / SR
    ph = 2 * np.pi * np.cumsum(np.geomspace(f0, f1, n)) / SR
    return np.sin(ph) * np.exp(-t * 38)

def tick(f=2600, dur=.03):
    n = int(dur * SR); t = np.arange(n) / SR
    return (np.sin(2 * np.pi * f * t) + .4 * rng.standard_normal(n)) * np.exp(-t * 180)

V2 = len(sys.argv) > 2 and sys.argv[2] == 'v2'
def remap(t):
    # alternate-hook edit: old 0-4.567 -> new 9.667-14.233, old 4.567-14.233 -> new 0-9.667
    if not V2: return t
    return t + 9.6667 if t < 4.5667 else t - 4.5667 if t < 14.2333 else t

def place(sig, t, gain=.25, pan=0., raw=False):
    t = t if raw else remap(t)
    if t < 0: return
    i = int(t * SR); sig = sig * gain
    L, R = np.cos((pan + 1) * np.pi / 4), np.sin((pan + 1) * np.pi / 4)
    out[i:i + len(sig), 0] += sig * L * 1.41
    out[i:i + len(sig), 1] += sig * R * 1.41

W = lambda t, g=.16, **k: place(whoosh(**k), t - .2, g)
Pp = lambda t, g=.2: place(pop(), t, g)
# hook
Pp(.05, .14); W(.84, .14); Pp(1.66, .12); Pp(2.40, .2)
# transitions into / out of the motion-graphics cutaways
TR = ((5.90, .2), (9.667, .2), (14.233, .2), (16.10, .17), (22.95, .18), (35.00, .2), (37.60, .17)) if V2 else \
     ((10.47, .2), (16.10, .17), (22.95, .18), (35.00, .2), (37.60, .17))
for tt, g in TR:
    place(whoosh(), tt + .15 - .2, g, raw=True)
place(pop(420, 200, .18), 35.93, .24)        # "هتندم كتير" lands in the wave cutaway
# skills panel
W(5.62, .12); [Pp(t, .15) for t in (7.30, 7.72, 8.30)]
Pp(9.80, .2)                                 # dragons
[place(tick(), t, .2) for t in (11.18, 11.38, 11.78)]   # bars grow (cutaway)
W(14.98, .18, f0=4000, f1=250)               # counter reset (down sweep)
W(16.40, .12); [Pp(t, .13) for t in (18.14, 18.64, 19.30)]  # lanes on the START line card
Pp(21.25, .2); Pp(32.70, .2)
W(25.067, .24, dur=.5, f0=200, f1=6000)      # whip out of the cutaway into the new location
Pp(25.30, .14); place(pop(500, 160, .16), 25.64, .26); Pp(26.30, .16)
W(28.42, .12); [Pp(t, .14) for t in (29.02, 29.52, 30.12, 31.34)]
for k in range(9): place(tick(3800, .02), 39.22 + k * .06, .09 + .03 * (k % 2))
Pp(39.96, .2); place(pop(800, 1500, .1), 40.18, .14)
W(40.88, .14); [Pp(t, .12) for t in (41.50, 43.12, 43.92)]

out = np.clip(out, -1, 1)
with wave.open(sys.argv[1], 'wb') as w:
    w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR)
    w.writeframes((out * 32767).astype(np.int16).tobytes())
