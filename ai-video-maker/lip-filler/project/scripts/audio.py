#!/usr/bin/env python3
"""Music bed + SFX, synthesised (no third-party samples, nothing to license),
mixed UNDER the original voice. The voice samples are added untouched:
no gain, EQ, fades or speed change. Music/SFX are ducked while she talks and
are pulled down locally wherever voice+bed would clip.

Outputs (../output/stems): voice.wav, music.wav, sfx.wav, mix.wav (48 kHz / 16-bit stereo)
"""
import numpy as np, subprocess, pathlib, wave

ROOT = pathlib.Path(__file__).resolve().parent.parent
STEMS = ROOT.parent / "output" / "stems"
SR = 48000
rng = np.random.default_rng(11)


def read_voice():
    with wave.open(str(ROOT / "cache" / "voice.wav")) as w:
        assert w.getframerate() == SR and w.getsampwidth() == 2
        x = np.frombuffer(w.readframes(w.getnframes()), np.int16).reshape(-1, w.getnchannels())
    return x


VOICE = read_voice()
N = max(len(VOICE), int(round(826 / 30 * SR)))
VOICE = np.vstack([VOICE, np.zeros((N - len(VOICE), VOICE.shape[1]), np.int16)])
t = np.arange(N) / SR


def lowpass_fft(x, fc, q=0.0):
    X = np.fft.rfft(x)
    f = np.fft.rfftfreq(len(x), 1 / SR)
    X *= 1 / np.sqrt(1 + (f / fc) ** 4)
    return np.fft.irfft(X, len(x))


def highpass_fft(x, fc):
    X = np.fft.rfft(x)
    f = np.fft.rfftfreq(len(x), 1 / SR)
    X *= 1 / np.sqrt(1 + (fc / np.maximum(f, 1)) ** 4)
    return np.fft.irfft(X, len(x))


def mtof(m):
    return 440 * 2 ** ((m - 69) / 12)


def place(buf, sig, at, gain=1.0, pan=0.0):
    i = int(at * SR)
    n = min(len(sig), len(buf) - i)
    if n <= 0:
        return
    l, r = np.cos((pan + 1) * np.pi / 4), np.sin((pan + 1) * np.pi / 4)
    buf[i:i + n, 0] += sig[:n] * gain * l * 1.414
    buf[i:i + n, 1] += sig[:n] * gain * r * 1.414


# ------------------------------------------------------------------ music
BPM = 100
BEAT = 60 / BPM
CHORDS = [  # A minor -> F -> C -> G, soft and airy
    [57, 60, 64, 67, 71], [53, 57, 60, 64, 69], [48, 55, 60, 64, 67], [55, 59, 62, 67, 69]]
BASS = [45, 41, 48, 43]
START = 0.40  # music hits with the hook


def music():
    out = np.zeros((N, 2))
    bar = 4 * BEAT
    nb = int((N / SR - START) / bar) + 2
    for b in range(nb):
        t0 = START + b * bar
        ch = CHORDS[b % 4]
        L = int(bar * SR * 1.25)
        tt = np.arange(L) / SR
        env = np.minimum(tt / 0.35, 1) * np.exp(-tt / 6) * np.minimum(1, np.maximum(0, (bar * 1.25 - tt) / 0.5))
        pad = sum(np.sin(2 * np.pi * mtof(m) * (1 + d) * tt + rng.random() * 6)
                  for m in ch for d in (-0.003, 0.003)) / (len(ch) * 2)
        place(out, pad * env, t0, 0.55, pan=-0.2)
        place(out, pad * env, t0 + 0.012, 0.55, pan=0.2)
        # bass
        bl = int(bar * SR)
        bt = np.arange(bl) / SR
        bass = np.sin(2 * np.pi * mtof(BASS[b % 4]) * bt) * np.minimum(bt / 0.02, 1) * np.exp(-bt / 1.2)
        place(out, bass, t0, 0.5)
        # pluck arpeggio on 8th notes (sparse in the hook, fuller after)
        for k in range(8):
            if b == 0 and k % 2:
                continue
            m = ch[[0, 2, 4, 3, 1, 2, 4, 3][k]] + 12
            pt = np.arange(int(0.5 * SR)) / SR
            f = mtof(m)
            pl = (np.sin(2 * np.pi * f * pt) + 0.3 * np.sin(4 * np.pi * f * pt) * np.exp(-pt / 0.05)) * np.exp(-pt / 0.16)
            pl *= np.minimum(pt / 0.003, 1)
            place(out, pl, t0 + k * BEAT / 2, 0.22, pan=0.35 if k % 2 else -0.35)
        # soft kick + hat from the list section on
        if t0 >= 4.0:
            for k in range(4):
                kt = np.arange(int(0.22 * SR)) / SR
                kick = np.sin(2 * np.pi * (48 + 70 * np.exp(-kt / 0.03)) * kt) * np.exp(-kt / 0.09)
                place(out, kick, t0 + k * BEAT, 0.55 if k in (0, 2) else 0.3)
                hat = highpass_fft(rng.standard_normal(int(0.05 * SR)), 7000) * np.exp(-np.arange(int(0.05 * SR)) / SR / 0.012)
                place(out, hat, t0 + k * BEAT + BEAT / 2, 0.12, pan=0.3)
    out[:, 0] = lowpass_fft(out[:, 0], 5500)
    out[:, 1] = lowpass_fft(out[:, 1], 5500)
    # nothing before the hook, gentle tail at the end
    out[: int(START * SR)] = 0
    tail = np.clip((N / SR - t) / 0.6, 0, 1)
    return out * tail[:, None]


# ------------------------------------------------------------------ sfx
def whoosh(dur=0.45, up=True, bright=1.0):
    n = int(dur * SR)
    x = rng.standard_normal(n)
    p = np.linspace(0, 1, n)
    fc = (300 + 4200 * bright * (p if up else 1 - p) ** 1.5)
    a = np.exp(-2 * np.pi * fc / SR)
    y = np.zeros(n)
    acc = 0.0
    for i in range(n):  # time-varying one-pole low-pass
        acc = a[i] * acc + (1 - a[i]) * x[i]
        y[i] = acc
    env = np.sin(np.pi * p ** (0.7 if up else 1.3)) ** 2
    return y * env / (np.abs(y).max() + 1e-9)


def pop(f0=700, f1=1300, dur=0.09):
    pt = np.arange(int(dur * SR)) / SR
    f = f0 + (f1 - f0) * np.minimum(pt / dur, 1)
    return np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-pt / (dur / 3.5)) * np.minimum(pt / 0.002, 1)


def impact(dur=0.8):
    pt = np.arange(int(dur * SR)) / SR
    boom = np.sin(2 * np.pi * (42 + 60 * np.exp(-pt / 0.05)) * pt) * np.exp(-pt / 0.22)
    nz = lowpass_fft(rng.standard_normal(len(pt)), 1800) * np.exp(-pt / 0.04)
    s = boom + 0.6 * nz / np.abs(nz).max()
    return s / np.abs(s).max()


def bell(f=1318.5, dur=1.6):
    pt = np.arange(int(dur * SR)) / SR
    s = sum(a * np.sin(2 * np.pi * f * r * pt) * np.exp(-pt / d) for r, a, d in [(1, 1, .6), (2.76, .4, .25), (5.4, .2, .12), (2, .3, .4)])
    return s * np.minimum(pt / 0.002, 1) / 1.9


def shimmer(dur=1.2):
    out = np.zeros(int(dur * SR))
    for k, m in enumerate([88, 91, 95, 100, 96, 103]):
        b = bell(mtof(m), 0.6) * 0.5
        i = int(k * 0.09 * SR)
        out[i:i + len(b)] += b[: len(out) - i]
    return out


def riser(dur=0.6):
    n = int(dur * SR)
    p = np.linspace(0, 1, n)
    s = np.sin(2 * np.pi * np.cumsum(400 + 1600 * p ** 2) / SR) * 0.4 + whoosh(dur, True, 1.2) * 0.8
    return s * p ** 2


def sfx():
    # calm pass: soft, sparse whooshes (about -8 dB vs v1), only on the elements that remain
    out = np.zeros((N, 2))
    W = lambda at, g=0.10, **k: place(out, whoosh(**k), at - 0.25, g)
    P = lambda at, g=0.08, pan=0.0, **k: place(out, pop(**k), at, g, pan)
    place(out, impact(), 0.50, 0.12); W(0.50, 0.08, dur=0.6)
    P(1.10, 0.08, f0=500, f1=1000); W(3.30, 0.05, dur=0.4, bright=0.8)
    for k, a in enumerate([4.35, 4.60, 4.85, 5.10]):
        P(a, 0.07, pan=-0.3 if k % 2 == 0 else 0.3, f0=700 + 60 * k, f1=1200 + 80 * k)
    W(6.35, 0.10, dur=0.6, bright=0.8)
    W(8.80, 0.05, dur=0.5, bright=0.6)
    W(11.20, 0.07, dur=0.6, up=False, bright=0.7)
    W(12.45, 0.06, dur=0.6, bright=0.7)
    W(14.45, 0.09, dur=0.6, bright=0.8)
    W(16.35, 0.08, dur=0.6, bright=0.8)
    W(20.58, 0.07, dur=0.6, up=False, bright=0.7)
    P(22.75, 0.08, f0=600, f1=1100)
    P(24.00, 0.07, pan=-0.35); P(24.25, 0.07, pan=0.35, f0=900, f1=1400)
    place(out, riser(0.8), 25.12, 0.08)
    place(out, impact(0.7), 25.92, 0.10); place(out, bell(1318.5), 25.92, 0.12); place(out, bell(1975.5), 26.05, 0.06)
    return out


# ------------------------------------------------------------------ mix
def envelope(x, win=0.06):
    k = int(win * SR)
    e = np.sqrt(np.convolve((x.astype(np.float64) / 32768).mean(1) ** 2, np.ones(k) / k, mode="same"))
    # smooth release so ducking does not pump
    out = np.empty_like(e)
    acc = 0.0
    att, rel = np.exp(-1 / (0.02 * SR)), np.exp(-1 / (0.35 * SR))
    for i, v in enumerate(e):
        acc = att * acc + (1 - att) * v if v > acc else rel * acc + (1 - rel) * v
        out[i] = acc
    return out


def main():
    STEMS.mkdir(parents=True, exist_ok=True)
    mus, fx = music(), sfx()
    mus /= np.abs(mus).max()
    env = envelope(VOICE)
    talk = np.clip(env / 0.08, 0, 1)
    mus *= (10 ** (-12 / 20)) * (1 - 0.5 * talk)[:, None]     # bed: ~-12 dBFS peak alone, ~-18 dB under speech
    fx *= (1 - 0.35 * talk)[:, None]
    bed = mus + fx
    v = VOICE.astype(np.float64) / 32768
    # clip guard: lower the bed (never the voice) wherever the sum would exceed -0.3 dBFS
    lim = 10 ** (-0.3 / 20)
    room = np.clip(lim - np.abs(v), 0, None)
    need = np.where(np.abs(bed) > 1e-9, np.minimum(1, room / np.maximum(np.abs(bed), 1e-9)), 1).min(1)
    k = int(0.01 * SR)
    g = np.minimum(need, np.convolve(np.pad(need, k, mode="edge"), np.ones(2 * k + 1) / (2 * k + 1), mode="valid"))
    bed *= g[:, None]
    bed_i = np.round(bed * 32768)
    mix = VOICE.astype(np.int64) + bed_i.astype(np.int64)
    assert mix.max() <= 32767 and mix.min() >= -32768, "clip"
    # the voice is bit-exact inside the mix: mix - bed == voice
    assert np.array_equal(mix - bed_i.astype(np.int64), VOICE.astype(np.int64))

    def wr(name, a):
        with wave.open(str(STEMS / name), "wb") as w:
            w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR)
            w.writeframes(np.clip(a, -32768, 32767).astype("<i2").tobytes())
    wr("voice.wav", VOICE)
    wr("music.wav", np.round(mus * g[:, None] * 32768))
    wr("sfx.wav", np.round(fx * g[:, None] * 32768))
    wr("mix.wav", mix)
    db = lambda a: 20 * np.log10(np.abs(a).max() + 1e-12)
    print(f"music peak {db(mus):.1f} dBFS  sfx peak {db(fx):.1f} dBFS  mix peak {db(mix / 32768):.2f} dBFS  guard min gain {g.min():.2f}")


if __name__ == "__main__":
    main()
