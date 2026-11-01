"""Analyse a music bed: tempo, beat grid, downbeats, per-bar energy and section changes.

usage: python3 beats.py <music.wav|mp3> <out.json>
Writes {bpm, beat0, beat, downbeats[], bars[{t, low, hi, all}], sections[{t, change_db, kind}]} and prints a summary.
The output time of a beat is beat0 + k * beat. When the music starts at 0:00 of the reel (the house rule),
those are also reel times, so build_spec.snap() can put free visual events on the beat.
"""
import json, sys
import numpy as np, librosa

src, out = sys.argv[1], sys.argv[2]
y, sr = librosa.load(src, sr=22050, mono=True); H = 128
dur = len(y) / sr
oenv = librosa.onset.onset_strength(y=y, sr=sr, hop_length=H)
S = np.abs(librosa.stft(y, n_fft=2048, hop_length=H)); fr = librosa.fft_frequencies(sr=sr, n_fft=2048)
low = librosa.onset.onset_strength(S=librosa.amplitude_to_db(S[fr < 110], ref=np.max), sr=sr, hop_length=H)


def env_at(e, ts):
    f = np.round(ts * sr / H).astype(int); f = f[(f >= 0) & (f < len(e))]; return e[f]


# 1) tempo: librosa's estimate on the standard hop (reliable for full-band mixes), folded into 100-180 BPM,
#    then a fine (bpm, offset) search around it maximising onset strength on the grid
bpm0 = float(np.atleast_1d(librosa.feature.tempo(y=y, sr=sr))[0])
while bpm0 < 100: bpm0 *= 2
while bpm0 > 180: bpm0 /= 2
best = (-1e9, bpm0, 0)
for bpm in np.arange(bpm0 - 3, bpm0 + 3, .02):
    p = 60 / bpm
    for off in np.arange(0, p, .004):
        sc = env_at(oenv, off + p * np.arange(int(dur / p) - 1)).mean()
        if sc > best[0]: best = (sc, bpm, off)
_, bpm, beat0 = best; beat = 60 / bpm
ts = beat0 + beat * np.arange(int((dur - beat0) / beat))
# 2) downbeat phase: the phase (of 4) with the strongest kick
ph = int(np.argmax([env_at(low, ts[k::4]).mean() for k in range(4)]))
db = ts[ph::4]
# 3) per-bar energy and section changes
lowE = S[fr < 150].sum(0); hiE = S[fr > 5000].sum(0); allE = S.sum(0)
seg = lambda e, a, b: float(20 * np.log10(e[int(a * sr / H):int(b * sr / H)].mean() + 1e-9))
bars = [dict(t=round(float(a), 3), low=round(seg(lowE, a, b), 1), hi=round(seg(hiE, a, b), 1), all=round(seg(allE, a, b), 1))
        for a, b in zip(db[:-1], db[1:])]
secs = []
for i in range(1, len(bars)):
    d = bars[i]['all'] - bars[i - 1]['all']; dl = bars[i]['low'] - bars[i - 1]['low']
    if abs(d) >= 2.5 or abs(dl) >= 4:
        kind = 'lift/drop' if d > 0 else ('stop/breakdown' if dl < 0 else 'dip')
        secs.append(dict(t=bars[i]['t'], change_db=round(d, 1), low_change_db=round(dl, 1), kind=kind))
res = dict(file=src, duration=round(dur, 3), bpm=round(bpm, 2), beat0=round(float(beat0), 3), beat=round(beat, 5),
           bar=round(4 * beat, 4), downbeats=[round(float(x), 3) for x in db], bars=bars, sections=secs)
json.dump(res, open(out, 'w'), indent=1)
print(f'{src}: {dur:.1f}s  {bpm:.2f} BPM  beat {beat:.4f}s  bar {4 * beat:.3f}s  first beat {beat0:.3f}s  downbeat phase {ph}')
for s in secs: print(f"  section change at {s['t']:7.3f}s  {s['kind']:15s} (all {s['change_db']:+.1f} dB, low {s['low_change_db']:+.1f} dB)")
