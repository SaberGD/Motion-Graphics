# Synthesised sound for the HORIX One promo: SFX synced to scenes.js, plus a placeholder 88 BPM beat bed.
# usage: python3 sfx.py out.wav [music.wav]
#   With music.wav (e.g. the El Behery cut "music60.wav": same 88 BPM grid, 58.2 s) the beat bed is replaced by it.
import sys, wave
import numpy as np

SR = 48000
DUR = 58.2
BEAT = 60 / 88
BAR = BEAT * 4
OFF = -0.077
B = lambda n: OFF + n * BAR
hT, sT, cT = B(8) + BEAT * 2, B(12) + BEAT * 3, B(16) + 0.05
rng = np.random.default_rng(7)
out = np.zeros((int(SR * (DUR + 1)), 2))


def add(t, x, gain=1.0, pan=0.0):
    i = int(max(t, 0) * SR)
    if x.ndim == 1:
        x = np.stack([x * (1 - max(pan, 0)), x * (1 + min(pan, 0))], 1)
    n = min(len(x), len(out) - i)
    if n > 0:
        out[i:i + n] += x[:n] * gain


def env(n, a=0.002, d=0.2):
    t = np.arange(n) / SR
    return np.minimum(1, t / a) * np.exp(-t / d)


def lp(x, k):  # one-pole low-pass, k in (0, 1]
    y = np.empty_like(x); acc = 0.0
    for i, v in enumerate(x):
        acc += k * (v - acc); y[i] = acc
    return y


def noise(d):
    return rng.standard_normal(int(SR * d))


# ---------- sounds ----------
def kick():
    n = int(SR * 0.45); t = np.arange(n) / SR
    f = 48 + 110 * np.exp(-t / 0.035)
    return np.sin(2 * np.pi * np.cumsum(f) / SR) * env(n, 0.001, 0.16) * 0.9


def clap():
    x = noise(0.25)
    e = sum(env(len(x), 0.001, 0.012 if k < 3 else 0.09) * (k * 0.011 * SR <= np.arange(len(x))) for k in range(4))
    return (x - lp(x, 0.25)) * e * 0.35


def hat(open_=False):
    x = noise(0.2); x = x - lp(x, 0.6)
    return x * env(len(x), 0.001, 0.06 if open_ else 0.018) * 0.16


def bass(f, d):
    n = int(SR * d); t = np.arange(n) / SR
    x = np.sin(2 * np.pi * f * t) + 0.3 * np.sin(4 * np.pi * f * t)
    return x * env(n, 0.005, d * 0.6) * 0.35


def whoosh(d=0.5, up=True):
    x = noise(d); n = len(x)
    k = np.linspace(0.02, 0.35, n) if up else np.linspace(0.35, 0.02, n)
    y = np.empty(n); acc = 0.0
    for i in range(n):
        acc += k[i] * (x[i] - acc); y[i] = acc
    return y * np.sin(np.linspace(0, np.pi, n)) ** 2 * 0.55


def click():
    n = int(SR * 0.04); t = np.arange(n) / SR
    return (np.sin(2 * np.pi * 2400 * t) * 0.5 + noise(0.04)[:n] * 0.3) * env(n, 0.0005, 0.006) * 0.6


def pop(f=700):
    n = int(SR * 0.14); t = np.arange(n) / SR
    return np.sin(2 * np.pi * np.cumsum(f * (1 + 0.6 * np.exp(-t / 0.02))) / SR) * env(n, 0.001, 0.05) * 0.45


def tick():
    x = noise(0.03); x = x - lp(x, 0.5)
    return x * env(len(x), 0.0005, 0.004) * 0.35


def glitch(d=0.6):
    n = int(SR * d); t = np.arange(n) / SR
    x = np.sign(np.sin(2 * np.pi * (300 + 900 * rng.random(n // 800 + 1).repeat(800)[:n]) * t))
    x = np.round(x * noise(d)[:n] * 3) / 3
    return x * np.exp(-t / (d * 0.4)) * 0.18


def shimmer(d=0.8):
    n = int(SR * d); t = np.arange(n) / SR
    x = sum(np.sin(2 * np.pi * f * t + p) for f, p in [(1760, 0), (2217, 1), (2637, 2), (3520, 3)])
    return x * np.sin(np.linspace(0, np.pi, n)) * 0.06


def slam():
    n = int(SR * 1.6); t = np.arange(n) / SR
    body = np.sin(2 * np.pi * np.cumsum(40 + 80 * np.exp(-t / 0.08)) / SR) * env(n, 0.002, 0.5)
    return (body + lp(noise(1.6), 0.05) * env(n, 0.001, 0.3) * 2) * 0.8


# ---------- beat bed ----------
def beat_bed(t0, t1, full=True):
    roots = [55, 55, 65.4, 49]
    n = 0
    t = t0
    while t < t1 - 0.01:
        b = n % 4
        if full or b == 0:
            add(t, kick(), 0.9 if b in (0, 2) else 0.0)
        if full and b in (1, 3):
            add(t, clap(), 0.8)
        add(t, hat(), 0.8, 0.3); add(t + BEAT / 2, hat(n % 8 == 7), 0.6, -0.3)
        if full and b in (0, 2):
            add(t, bass(roots[(n // 4) % 4], BEAT * 1.6), 0.9)
        n += 1; t += BEAT


# ---------- sound map (mirrors scenes.js) ----------
def sfx():
    for i, t in enumerate([0.45, 1.12, 1.72, 2.26, 2.76, 3.2, 3.6, 3.95, 4.27, 4.55]):  # files thrown between apps
        add(t, whoosh(0.5, i % 2 == 0), 0.6, 0.5 if i % 2 else -0.5)
    add(B(2) - 0.6, whoosh(0.55, True), 1.0)  # sucked into the dot
    add(B(2) - 0.02, slam(), 0.7)  # amber
    add(B(2) + BEAT * 3 - 0.05, whoosh(0.5, False), 0.9)  # window rises
    for k in (1, 2):
        add(B(3) + BEAT * k, click(), 0.8)  # pill flips
    for i in range(5):
        add(B(4) + 0.35 + i * BEAT, pop(650 + i * 60), 0.8)  # pen anchors
    add(B(5) + 0.42, pop(420), 0.9)  # fill
    for k in range(4):
        add(B(6) + 0.35 + k / 8, tick(), 1.0)  # typing «بُنّ»
    for k in range(10):
        add(B(6) + BEAT * 2 + 0.15 + k / 20, tick(), 0.8)
    add(B(7) + 0.05, whoosh(BEAT * 2.2, True), 0.7)  # zoom in
    add(B(8) - 0.5, whoosh(0.4, False), 0.6)  # zoom out
    add(hT, click(), 1.0); add(hT + 0.05, shimmer(0.6), 1.0)
    add(B(9) - 0.02, glitch(0.7), 1.0); add(B(9), whoosh(0.6, True), 0.7)  # breaks into pixels
    add(B(9) + BEAT * 1.6, whoosh(0.7, False), 0.8); add(B(10) - 0.05, pop(300), 1.0)  # lands
    for i in range(4):
        add(B(10) + 0.1 + i * BEAT * 0.6, pop(900), 0.5)  # layer rows
    for k in range(4):
        add(B(11) + k * BEAT, click(), 0.9); add(B(11) + k * BEAT, glitch(0.15), 0.6)  # ping-pong
    add(B(12) - 0.35, glitch(0.5), 0.8)  # pixel wipe
    add(sT, click(), 1.0); add(sT, shimmer(0.9), 1.4)  # AI select
    add(B(13) + BEAT * 2, glitch(0.5), 0.7)  # background drops out
    add(B(14) - 0.05, slam(), 0.35)  # new background
    add(B(14) + BEAT * 2, whoosh(0.7, False), 0.8); add(B(15) - 0.1, pop(500), 0.8)  # logo onto the cup
    for k in range(4):
        add(B(15) + k * BEAT, tick(), 1.2)  # sliders
    add(cT, click(), 1.0); add(cT + 0.3, whoosh(0.6, True), 0.8)
    add(B(16) + BEAT * 2, pop(800), 0.6); add(B(16) + BEAT * 2.5, pop(950), 0.6)
    for k in range(4):
        add(B(17) + k * BEAT, whoosh(0.4, True), 0.7, (-0.5, 0.5, -0.4, 0.4)[k])  # campaign pieces
    add(B(19) - 0.4, whoosh(0.4, True), 0.9)
    add(B(19) + 0.05, click(), 0.8); add(B(19) + BEAT, pop(700), 0.8)
    add(B(19) + BEAT * 2, slam(), 0.6)
    add(B(20) - 0.05, slam(), 0.9); add(B(20) + 0.6, shimmer(1.0), 1.0)


def main():
    path, music = sys.argv[1], (sys.argv[2] if len(sys.argv) > 2 else None)
    sfx()
    fx = out.copy(); out[:] = 0
    if music:
        with wave.open(music) as w:
            ch, sw, fr = w.getnchannels(), w.getsampwidth(), w.getframerate()
            a = np.frombuffer(w.readframes(w.getnframes()), dtype={2: np.int16, 4: np.int32}[sw]).astype(float) / (2 ** (8 * sw - 1))
        a = a.reshape(-1, ch)
        if ch == 1: a = np.repeat(a, 2, 1)
        if fr != SR: a = np.stack([np.interp(np.arange(0, len(a), fr / SR), np.arange(len(a)), a[:, c]) for c in range(2)], 1)
        add(0, a[:, :2], 0.8)
    else:
        beat_bed(OFF, B(2) - 0.6, full=False)  # just a pulse under the chaos
        beat_bed(B(2) + BEAT * 3, B(19) - 0.4)
        beat_bed(B(19), B(20))
    mix = out * 0.75 + fx * 0.9
    mix = mix[: int(SR * DUR)]
    fade = int(SR * 0.6); mix[-fade:] *= np.linspace(1, 0, fade)[:, None]
    mix = np.tanh(mix * 1.1) / np.tanh(1.1)
    mix /= max(1e-9, np.abs(mix).max()) / 0.89
    with wave.open(path, "w") as w:
        w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR)
        w.writeframes((mix * 32767).astype(np.int16).tobytes())
    print("wrote", path)


if __name__ == "__main__":
    main()
