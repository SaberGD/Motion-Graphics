#!/usr/bin/env python3
"""Breakdown ad soundtrack: voice edits + synthesised music (150 BPM) + SFX. Writes ../output/ad_mix.wav"""
import importlib.util, pathlib, wave, numpy as np
HERE = pathlib.Path(__file__).resolve().parent
spec = importlib.util.spec_from_file_location("lf", HERE.parents[2] / "lip-filler/project/scripts/audio.py")
lf = importlib.util.module_from_spec(spec); spec.loader.exec_module(lf)   # reuse synth helpers + the voice
SR, place, whoosh, pop, impact, bell, riser, mtof, lowpass_fft, highpass_fft = (lf.SR, lf.place, lf.whoosh, lf.pop, lf.impact,
                                                                                lf.bell, lf.riser, lf.mtof, lf.lowpass_fft, lf.highpass_fft)
rng = np.random.default_rng(5)
DUR = 17.4; N = int(DUR * SR)
A_END, B_END, C_END = 9.1, 13.2, 99
BEAT = 0.4  # 150 BPM: a flash cut lands on every beat

def voice():
    v = lf.VOICE.astype(np.float64) / 32768
    out = np.zeros((N, 2))
    def seg(at, s0, s1):
        x = v[int(s0 * SR):int(s1 * SR)].copy(); f = int(0.012 * SR)
        x[:f] *= np.linspace(0, 1, f)[:, None]; x[-f:] *= np.linspace(1, 0, f)[:, None]
        out[int(at * SR):int(at * SR) + len(x)] += x
    seg(0, 0, A_END)          # breakdown section: the real-time voice
    seg(A_END, 0, 4.08)       # 5-up grid restarts at the hook, all versions in sync
    return out

CH = [[57, 60, 64, 67], [53, 57, 60, 65], [48, 52, 55, 60], [55, 59, 62, 67]]
def music():
    out = np.zeros((N, 2)); nb = int(DUR / BEAT) + 2
    for b in range(nb):
        t0 = b * BEAT; ch = CH[(b // 8) % 4]; sec = 'A' if t0 < A_END else 'B' if t0 < B_END else 'C' if t0 < C_END else 'D'
        if sec == 'D':
            continue
        if b % 8 == 0:   # pad, one chord per 2 bars
            L = int(8 * BEAT * SR * 1.2); tt = np.arange(L) / SR
            pad = sum(np.sin(2 * np.pi * mtof(m) * (1 + d) * tt) for m in ch for d in (-.003, .003)) / 8
            place(out, pad * np.minimum(tt / .3, 1) * np.minimum(1, (L / SR - tt) / .4), t0, .5)
        pt = np.arange(int(.35 * SR)) / SR   # pluck 8ths
        for h in (0, 1):
            m = ch[(b * 2 + h) % 4] + 12; f = mtof(m)
            pl = (np.sin(2 * np.pi * f * pt) + .3 * np.sin(4 * np.pi * f * pt) * np.exp(-pt / .04)) * np.exp(-pt / .12)
            place(out, pl, t0 + h * BEAT / 2, .18 if sec != 'C' else .24, pan=-.3 if h else .3)
        kt = np.arange(int(.25 * SR)) / SR
        kick = np.sin(2 * np.pi * (46 + 80 * np.exp(-kt / .025)) * kt) * np.exp(-kt / .1)
        if sec == 'C' or (sec in 'AB' and b % 2 == 0 and t0 >= 1.4):
            place(out, kick, t0, .7 if sec == 'C' else .45)
        if sec in 'BC':
            hat = highpass_fft(rng.standard_normal(int(.05 * SR)), 7000) * np.exp(-np.arange(int(.05 * SR)) / SR / .012)
            place(out, hat, t0 + BEAT / 2, .14)
        if sec == 'C':
            bt = np.arange(int(BEAT * SR)) / SR
            place(out, np.tanh(2 * np.sin(2 * np.pi * mtof(ch[0] - 24) * bt)) * np.exp(-bt / .25), t0, .35)
            if b % 2 == 1:
                cl = lowpass_fft(highpass_fft(rng.standard_normal(int(.15 * SR)), 900), 6000) * np.exp(-np.arange(int(.15 * SR)) / SR / .04)
                place(out, cl / np.abs(cl).max(), t0, .25)
    for c in range(2):
        out[:, c] = lowpass_fft(out[:, c], 7000)
    return out / np.abs(out).max()

def sfx():
    out = np.zeros((N, 2))
    for a in (1.45, 3.35, 5.85):     # slider wipes: soft swish + a light tick
        place(out, whoosh(.9, True, .7), a, .08); place(out, pop(1200, 1600, .05), a + .45, .05)
    place(out, whoosh(.6, True, .9), A_END - .2, .12)
    for k in range(4):
        place(out, pop(700 + 90 * k, 1300 + 120 * k), A_END + .15 + k * .09, .07)
    place(out, riser(.6), B_END - .6, .12)
    for k in range(9):                # one hit per flash cut
        place(out, impact(.35), B_END + k * BEAT, .10)
    place(out, bell(1318.5, 1.6), DUR - 1.0, .08)   # soft button on the last shot
    return out

def main():
    v, m, fx = voice(), music(), sfx()
    t = np.arange(N) / SR
    talk = np.clip(lf.envelope((np.clip(v, -1, 1) * 32767).astype(np.int16)) / .08, 0, 1)
    lvl = np.where(t < B_END, 10 ** (-15 / 20), 10 ** (-7 / 20))        # bed under the voice, louder in the flashes
    lvl = lvl * np.clip((DUR - t) / 0.9, 0, 1)   # music fades out on the last shot
    mix = v + m * (lvl * (1 - .5 * talk))[:, None] + fx
    pk = np.abs(mix).max()
    if pk > .98:
        mix *= .98 / pk
    with wave.open(str(HERE.parents[1] / "output/ad_mix.wav"), "wb") as w:
        w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes((mix * 32767).astype("<i2").tobytes())
    print("ad mix peak scale", round(min(1, .98 / pk), 3))

if __name__ == "__main__":
    main()
