#!/usr/bin/env python3
"""Breakdown ad soundtrack. The original voice runs once, start to finish, untouched (no gain/EQ/fades);
synthesised 150 BPM music + SFX sit under it, ducked while she talks, and are pulled down wherever voice+bed would clip.
Writes ../output/ad_mix.wav"""
import importlib.util, pathlib, wave, numpy as np
HERE = pathlib.Path(__file__).resolve().parent
spec = importlib.util.spec_from_file_location("lf", HERE.parents[2] / "lip-filler/project/scripts/audio.py")
lf = importlib.util.module_from_spec(spec); spec.loader.exec_module(lf)   # synth helpers + the voice
SR, place, whoosh, pop, impact, bell, riser, mtof, lowpass_fft, highpass_fft = (lf.SR, lf.place, lf.whoosh, lf.pop, lf.impact,
                                                                                lf.bell, lf.riser, lf.mtof, lf.lowpass_fft, lf.highpass_fft)
rng = np.random.default_rng(5)
VOICE = lf.VOICE; N = len(VOICE); DUR = N / SR
A_END, B_END, C_END = 11.45, 16.3, 25.9   # breakdown | 6-up grid | flash cuts | CTA shot
WIPES = (1.20, 2.75, 4.07, 8.55)
BEAT = 0.4                                # 150 BPM; flash cuts every 2 beats from 16.3

CH = [[57, 60, 64, 67], [53, 57, 60, 65], [48, 52, 55, 60], [55, 59, 62, 67]]
def music():
    out = np.zeros((N, 2))
    for b in range(int(DUR / BEAT) + 2):
        t0 = b * BEAT; ch = CH[(b // 8) % 4]
        sec = 'A' if t0 < A_END else 'B' if t0 < B_END else 'C' if t0 < C_END else 'D'
        if b % 8 == 0:
            L = int(8 * BEAT * SR * 1.2); tt = np.arange(L) / SR
            pad = sum(np.sin(2 * np.pi * mtof(m) * (1 + d) * tt) for m in ch for d in (-.003, .003)) / 8
            place(out, pad * np.minimum(tt / .3, 1) * np.minimum(1, (L / SR - tt) / .4), t0, .5)
        if sec == 'D':
            continue
        pt = np.arange(int(.35 * SR)) / SR
        for h in (0, 1):
            f = mtof(ch[(b * 2 + h) % 4] + 12)
            pl = (np.sin(2 * np.pi * f * pt) + .3 * np.sin(4 * np.pi * f * pt) * np.exp(-pt / .04)) * np.exp(-pt / .12)
            place(out, pl, t0 + h * BEAT / 2, .18 if sec == 'A' else .22, pan=-.3 if h else .3)
        kt = np.arange(int(.25 * SR)) / SR
        kick = np.sin(2 * np.pi * (46 + 80 * np.exp(-kt / .025)) * kt) * np.exp(-kt / .1)
        if sec == 'C' or (b % 2 == 0 and t0 >= 1.4):
            place(out, kick, t0, .6 if sec == 'C' else .45)
        if sec in 'BC':
            n = int(.05 * SR); hat = highpass_fft(rng.standard_normal(n), 7000) * np.exp(-np.arange(n) / SR / .012)
            place(out, hat, t0 + BEAT / 2, .13)
        if sec == 'C':
            bt = np.arange(int(BEAT * SR)) / SR
            place(out, np.tanh(2 * np.sin(2 * np.pi * mtof(ch[0] - 24) * bt)) * np.exp(-bt / .25), t0, .3)
    for c in range(2):
        out[:, c] = lowpass_fft(out[:, c], 7000)
    return out / np.abs(out).max()

def sfx():
    out = np.zeros((N, 2))
    for a in WIPES:
        place(out, whoosh(.9, True, .7), a, .07); place(out, pop(1200, 1600, .05), a + .45, .04)
    place(out, whoosh(.6, True, .9), A_END - .2, .1)
    for k in range(5):
        place(out, pop(700 + 80 * k, 1300 + 100 * k), A_END + .15 + k * .09, .06)
    place(out, riser(.6), B_END - .6, .09)
    k = 0
    while B_END + k * 2 * BEAT < C_END + .01:
        place(out, impact(.35), B_END + k * 2 * BEAT, .07); k += 1
    place(out, bell(1318.5, 1.6), C_END, .07)
    return out

def main():
    t = np.arange(N) / SR
    m, fx = music(), sfx()
    talk = np.clip(lf.envelope(VOICE) / .08, 0, 1)
    lvl = np.where(t < A_END, 10 ** (-13 / 20), np.where(t < B_END, 10 ** (-11 / 20), 10 ** (-9 / 20)))
    lvl = lvl * np.clip((DUR - t) / 1.2, 0, 1)
    bed = m * (lvl * (1 - .5 * talk))[:, None] + fx * (1 - .3 * talk)[:, None]
    v = VOICE.astype(np.float64) / 32768
    lim = 10 ** (-.3 / 20)
    need = np.where(np.abs(bed) > 1e-9, np.minimum(1, np.clip(lim - np.abs(v), 0, None) / np.maximum(np.abs(bed), 1e-9)), 1).min(1)
    k = int(.01 * SR)
    g = np.minimum(need, np.convolve(np.pad(need, k, mode="edge"), np.ones(2 * k + 1) / (2 * k + 1), mode="valid"))
    bed_i = np.round(bed * g[:, None] * 32768).astype(np.int64)
    mix = VOICE.astype(np.int64) + bed_i
    assert mix.max() <= 32767 and mix.min() >= -32768
    assert np.array_equal(mix - bed_i, VOICE.astype(np.int64))   # voice is bit-exact inside the mix
    with wave.open(str(HERE.parents[1] / "output/ad_mix.wav"), "wb") as w:
        w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes(mix.astype("<i2").tobytes())
    print("ok, voice untouched; bed guard min gain", round(float(g.min()), 2))

if __name__ == "__main__":
    main()
