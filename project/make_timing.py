"""Beat-sync the edit: snap punch-ins and mid-shot cutaway transitions to the nearest beat.

usage: make_timing.py <variant 1|2> <beats.json> <A|B> <out.json>
Times tied to a clip change (cuts in the footage) stay put; only moves of <= half a beat are made.
"""
import json, sys

variant, beats_file, key, out = sys.argv[1], sys.argv[2], sys.argv[3], sys.argv[4]
beats = json.load(open(beats_file))[key]['beats']
# extend the detected grid backwards to t=0 so early events can snap too
ibi = (beats[-1] - beats[0]) / (len(beats) - 1)
grid = [beats[0] - k * ibi for k in range(1, 4)][::-1] + beats

def snap(t, lo, hi):
    """nearest beat to t inside [lo, hi] and within half a beat; otherwise t."""
    c = [b for b in grid if lo <= b <= hi and abs(b - t) <= ibi / 2]
    return round(min(c, key=lambda b: abs(b - t)), 3) if c else t

V2 = variant == '2'
to_new = (lambda o: o - 4.5667 if 4.5667 <= o < 14.2333 else o + 9.6667 if o < 4.5667 else o) if V2 else (lambda o: o)
to_old = (lambda n: n + 4.5667 if n < 9.6667 else n - 9.6667 if n < 14.2333 else n) if V2 else (lambda n: n)

# punch-in starts (old timeline) and the shot each one must stay inside (old timeline)
punches = {9.86: (9.25, 10.15), 14.98: (14.5, 15.5), 24.30: (23.9, 24.6), 31.90: (31.4, 32.4), 35.96: (35.5, 36.4)}
punch = {}
for o, (lo, hi) in punches.items():
    n = snap(to_new(o), to_new(lo), to_new(hi))
    punch[str(o)] = round(to_old(n), 3)

if V2:
    cut = [[5.90, 9.667, 'push', 'whip'], [14.233, 16.10, 'zoom', 'zoomout'],
           [22.95, 25.067, 'zoom', 'whip'], [35.00, 37.75, 'push', 'zoomout']]
else:
    cut = [[10.47, 16.10, 'push', 'zoomout'], [22.95, 25.067, 'zoom', 'whip'], [35.00, 37.75, 'push', 'zoomout']]
for c in cut:
    if c[1] == 16.10: c[1] = snap(16.10, 15.6, 16.6)      # mid-shot: free to move
    if c[0] == 22.95: c[0] = snap(22.95, 22.5, 23.4)
    if c[0] == 35.00: c[0] = snap(35.00, 34.6, 35.4)      # keep the sit-down visible before the wave
# music "hits": a quick zoom bump on the frame when the track lifts.
# Beat A is full-energy from the first bar -> one bump at the 8-bar phrase change.
# Beat B builds from a quiet intro -> bump where it opens up and a bigger one on the drop.
hits = [[snap(16.75, 16.3, 17.2), .035]] if key == 'A' else [[snap(3.68, 3.4, 3.9), .03], [snap(7.86, 7.6, 8.1), .06]]
# clip changes that get a zoom-blur ("zoom seka") transition instead of a hard cut
big_cuts = [4.567] if not V2 else []
json.dump({'punch': punch, 'cutaways': cut, 'hits': hits, 'big_cuts': big_cuts, 'ibi': ibi}, open(out, 'w'), indent=1)
print(json.dumps({'punch': punch, 'cutaways': cut, 'hits': hits}))
