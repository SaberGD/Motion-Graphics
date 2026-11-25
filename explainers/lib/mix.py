#!/usr/bin/env python3
"""Mix voice-over + synthesised UI sounds and mux with the silent render.

usage: python3 explainers/lib/mix.py explainers/<video>/ <out.mp4>
needs build/timeline.json, build/events.json, build/video_silent.mp4
"""
import json, os, subprocess, sys, wave
import numpy as np

SR = 48000
FFMPEG = os.path.expanduser("~/.local/bin/ffmpeg")
rng = np.random.default_rng(7)


def db(x):
    return 10 ** (x / 20)


def env(n, a, d):
    """attack a seconds, exponential decay d seconds"""
    t = np.arange(n) / SR
    e = np.exp(-np.maximum(t - a, 0) / d)
    if a > 0:
        e *= np.minimum(t / a, 1)
    return e


def lowpass(x, cut):
    """one-pole low-pass; cut may be an array (sweep)"""
    cut = np.broadcast_to(cut, x.shape)
    a = np.exp(-2 * np.pi * cut / SR)
    y = np.zeros_like(x)
    z = 0.0
    for i in range(len(x)):
        z = (1 - a[i]) * x[i] + a[i] * z
        y[i] = z
    return y


def sine(f, n):
    f = np.broadcast_to(np.asarray(f, float), (n,))
    return np.sin(2 * np.pi * np.cumsum(f) / SR)


def tap():
    n = int(0.06 * SR)
    click = rng.standard_normal(n) * env(n, 0, 0.004)
    blip = sine(2300, n) * env(n, 0.001, 0.012)
    return (0.5 * click + blip) * db(-17)


def whoosh(length=0.42):
    n = int(length * SR)
    t = np.linspace(0, 1, n)
    noise = rng.standard_normal(n)
    sweep = 300 + 3200 * np.sin(np.pi * t) ** 2
    shaped = lowpass(noise, sweep) - lowpass(noise, sweep * 0.25)
    e = np.sin(np.pi * t) ** 2
    return shaped * e * db(-14) / (np.abs(shaped).max() + 1e-9) * 1.0


def ding():
    n = int(0.7 * SR)
    s = sine(1318.5, n) * env(n, 0.002, 0.18) + 0.5 * sine(1975.5, n) * env(n, 0.002, 0.12) + 0.25 * sine(2637, n) * env(n, 0.002, 0.07)
    return s * db(-19)


def pop():
    n = int(0.08 * SR)
    f = np.linspace(950, 480, n)
    return sine(f, n) * env(n, 0.002, 0.02) * db(-19)


def success():
    out = np.zeros(int(0.9 * SR))
    for i, f in enumerate([1046.5, 1318.5, 1568, 2093]):
        n = int(0.6 * SR)
        s = (sine(f, n) + 0.3 * sine(2 * f, n)) * env(n, 0.003, 0.16)
        o = int(i * 0.075 * SR)
        out[o:o + n] += s
    return out * db(-21)


def logo():
    n = int(1.1 * SR)
    boom = sine(np.linspace(90, 48, n), n) * env(n, 0.005, 0.28)
    air = lowpass(rng.standard_normal(n), 2500) * env(n, 0.02, 0.25) * 0.6
    shimmer = sum(sine(f, n) * env(n, 0.01, 0.35) for f in (1568, 2093, 2637)) * 0.12
    return (boom + air + shimmer) * db(-15)


def key():
    n = int(0.04 * SR)
    return (rng.standard_normal(n) * env(n, 0, 0.003) * 0.6 + sine(3200, n) * env(n, 0.0005, 0.006) * 0.4) * db(-24)


SFX = {"key": key(), "tap": tap(), "whoosh": whoosh(), "swipe": whoosh(0.26) * db(-3), "ding": ding(), "pop": pop(), "success": success(), "logo": logo()}


def read_wav(p):
    with wave.open(p) as w:
        assert w.getframerate() == SR and w.getnchannels() == 1
        return np.frombuffer(w.readframes(w.getnframes()), np.int16).astype(np.float32) / 32768


def main(vdir, out):
    b = os.path.join(vdir, "build")
    tl = json.load(open(os.path.join(b, "timeline.json"), encoding="utf-8"))
    events = json.load(open(os.path.join(b, "events.json")))
    total = tl["total"] + 0.3
    voice = np.zeros(int(total * SR), np.float32)
    fx = np.zeros_like(voice)
    for line in tl["lines"]:
        v = read_wav(line["wav"])
        o = int(line["start"] * SR)
        voice[o:o + len(v)] += v[: len(voice) - o]
    for e in events:
        s = SFX[e["type"]]
        o = int(max(e["t"], 0) * SR)
        fx[o:o + len(s)] += s[: len(fx) - o]
    # duck the sound effects a little under the voice
    venv = lowpass(np.abs(voice), 8.0)
    fx *= 1 - 0.45 * np.clip(venv / (venv.max() + 1e-9) * 3, 0, 1)
    mix = voice * db(-1) + fx
    pcm = (np.clip(mix, -1, 1) * 32767).astype(np.int16)
    wav = os.path.join(b, "audio_raw.wav")
    with wave.open(wav, "wb") as w:
        w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR); w.writeframes(pcm.tobytes())
    os.makedirs(os.path.dirname(os.path.abspath(out)), exist_ok=True)
    af = "highpass=f=70,acompressor=threshold=-20dB:ratio=2.5:attack=8:release=120,loudnorm=I=-14:TP=-1.5:LRA=7,aformat=channel_layouts=stereo"
    subprocess.run([FFMPEG, "-loglevel", "error", "-y", "-i", os.path.join(b, "video_silent.mp4"), "-i", wav,
                    "-af", af, "-ar", "48000", "-c:v", "copy", "-c:a", "aac", "-b:a", "192k", "-shortest", "-movflags", "+faststart", out], check=True)
    print("wrote", out)


if __name__ == "__main__":
    main(sys.argv[1], sys.argv[2])
