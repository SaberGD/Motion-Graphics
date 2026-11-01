"""Propose jump cuts that remove dead air WITHOUT eating word endings.

usage: python3 cuts.py <media> <words.json> [min_gap=0.30]
Prints every pause with its exact speech end / restart (from the audio, not Whisper) and a ready KEEP list.

Lesson learned (saber7, "Perfect"): Whisper word ends are approximate, and words can have a held catch
mid-word (Per…fect) followed by an unvoiced tail (-ct, s, t, f). A cut placed on a Whisper time or on the
first quiet frame clipped the end of the word. So:
  * speech end   = last 10 ms frame louder than floor + 12 dB before the gap, then + 100 ms of air (unvoiced tails sit under the threshold)
  * speech start = first 10 ms frame louder than floor + 12 dB after the gap, minus 40 ms
  * a quiet stretch shorter than 0.30 s inside a word is never cut
Always listen/check the result; this only proposes.
"""
import json, subprocess, sys
import numpy as np

media, wpath = sys.argv[1], sys.argv[2]
MIN_GAP = float(sys.argv[3]) if len(sys.argv) > 3 else .30
SR = 16000; HOP = 160          # 10 ms
a = np.frombuffer(subprocess.run(['ffmpeg', '-v', 'error', '-i', media, '-vn', '-ac', '1', '-ar', str(SR), '-f', 'f32le', '-'],
                                 capture_output=True, check=True).stdout, np.float32)
rms = np.array([np.sqrt((a[i:i + 320] ** 2).mean()) for i in range(0, len(a) - 320, HOP)])
db = 20 * np.log10(rms + 1e-9)
floor = np.percentile(db, 5); thr = floor + 12
loud = db > thr
words = json.load(open(wpath))
dur = len(a) / SR
keep, cur = [], None
first = np.argmax(loud) * .01
cur = max(0, round(first - .10, 2))
print(f'noise floor {floor:.1f} dB, speech threshold {thr:.1f} dB')
print('pauses >= %.2fs (audio-measured):' % MIN_GAP)
i = 0; n = len(loud)
fi = int(first * 100)
while fi < n:
    # find next quiet run
    j = fi
    while j < n and loud[j]: j += 1
    k = j
    while k < n and not loud[k]: k += 1
    if k >= n: break
    gap = (k - j) * .01
    mid = (j + k) * .005
    # held catch inside ONE word (Per…fect): the word has >=50 ms of speech both before and after the pause -> never cut.
    # (Whisper often starts the next word early and swallows the pause; that alone does not make it 'inside'.)
    def voiced(a_, b_): return loud[max(0, int(a_ * 100)):max(0, int(b_ * 100))].sum() >= 5
    inside = any(w['s'] < mid < w['e'] and voiced(w['s'], j * .01) and voiced(k * .01, w['e']) for w in words)
    if gap >= MIN_GAP and not inside:
        end = round(j * .01 + .10, 2); start = round(k * .01 - .04, 2)
        before = [w['w'] for w in words if w['s'] < j * .01][-1:] or ['']
        after = [w['w'] for w in words if w['s'] >= j * .01 - .05][:1] or ['']
        print(f'  {j * .01:6.2f} -> {k * .01:6.2f}  ({gap:.2f}s)  after "{before[0]}" / before "{after[0]}"  => cut {end:.2f}-{start:.2f}')
        if start - end >= .17:         # shorter removals read as stutters; keep the natural breath
            keep.append([cur, end]); cur = start
    fi = k
last = (np.where(loud)[0][-1] + 1) * .01
keep.append([cur, round(min(dur, last + .25), 2)])
# drop short tail segments with no real word in them (clicks, breaths, Whisper hallucinations like a final "سلام")
mids = [(w['s'] + w['e']) / 2 for w in words if w['e'] - w['s'] < 1.0]
keep = [kp for kp in keep if kp[1] - kp[0] >= .6 or any(kp[0] <= m <= kp[1] for m in mids)]
keep = [kp for kp in keep if any(kp[0] <= m <= kp[1] for m in mids)]
keep[-1][1] = round(min(keep[-1][1], max(m for m in mids if m <= keep[-1][1]) + .6), 2) if keep else None
print('\nKEEP =', json.dumps(keep))
print('speech kept: %.2fs of %.2fs' % (sum(e - s for s, e in keep), dur))
