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

def place(sig, t, gain=.25, pan=0.):
    i = int(t * SR); sig = sig * gain
    L, R = np.cos((pan + 1) * np.pi / 4), np.sin((pan + 1) * np.pi / 4)
    out[i:i + len(sig), 0] += sig * L * 1.41
    out[i:i + len(sig), 1] += sig * R * 1.41

W = lambda t, g=.16, **k: place(whoosh(**k), t - .2, g)
Pp = lambda t, g=.2: place(pop(), t, g)
# hook
Pp(.05, .14); W(.84, .14); Pp(1.66, .12); Pp(2.40, .22)
# skills panel
W(5.62, .13); [Pp(t, .15) for t in (7.30, 7.72, 8.30)]
Pp(9.80, .2)                                 # dragons
W(10.5, .15); [place(tick(), t, .22) for t in (11.18, 11.38, 11.78)]
W(14.98, .2, f0=4000, f1=250)                # counter reset (down sweep)
place(pop(600, 1400, .12), 15.55, .18)       # "same start" badge
W(16.2, .13); [Pp(t, .14) for t in (18.14, 18.64, 19.30)]
Pp(21.25, .2); Pp(23.0, .16); Pp(23.64, .16)
W(25.067, .3, dur=.55, f0=200, f1=6000)      # scene-change transition
Pp(25.30, .14); place(pop(500, 160, .16), 25.64, .3); Pp(26.30, .16)
W(28.25, .13); [Pp(t, .14) for t in (29.02, 29.52, 30.12, 31.34)]
Pp(32.70, .2)
W(34.1, .26, dur=.45, f0=250, f1=5000)
Pp(34.64, .16); place(pop(420, 200, .18), 35.96, .3)
W(37.55, .14)
for k in range(9): place(tick(3800, .02), 39.22 + k * .06, .09 + .03 * (k % 2))
Pp(39.96, .22); place(pop(800, 1500, .1), 40.18, .14)
W(40.70, .15); [Pp(t, .12) for t in (41.50, 43.12, 43.92)]

out = np.clip(out, -1, 1)
with wave.open(sys.argv[1], 'wb') as w:
    w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR)
    w.writeframes((out * 32767).astype(np.int16).tobytes())
