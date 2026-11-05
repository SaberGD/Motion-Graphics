"""Print pauses (>=150 ms) in a clip's audio, energy-based. usage: silences.py <media>"""
import json, subprocess, sys
import numpy as np
a = np.frombuffer(subprocess.run(['ffmpeg', '-v', 'error', '-i', sys.argv[1], '-vn', '-ac', '1', '-ar', '48000', '-f', 'f32le', '-'], capture_output=True).stdout, np.float32)
hop, win = 240, 480
db = 20 * np.log10(np.array([np.sqrt((a[i:i + win] ** 2).mean()) for i in range(0, len(a) - win, hop)]) + 1e-9)
sil = db < np.percentile(db, 5) + 12; runs = []; i = 0
while i < len(sil):
    if sil[i]:
        j = i
        while j < len(sil) and sil[j]: j += 1
        if (j - i) * hop / 48000 >= .15: runs.append((round(i * hop / 48000, 2), round(j * hop / 48000, 2)))
        i = j
    else: i += 1
print(json.dumps(runs))
