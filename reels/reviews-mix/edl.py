"""Student reviews mix (SG EDIT, Academy): 3 student review reels → one ~60 s montage, «نفس الأسئلة… 3 إجابات».

Writes edl.json: every clip (source, in/out refined so no cut lands inside a word) and every chapter card,
with their times on the output timeline. The burned-in captions of the sources stay (the client asked not to add captions).
usage: python3 edl.py   (needs raw/reviews/r1..3.mp4 and words_r*.json from Whisper)
"""
import json, os, subprocess
import numpy as np

HERE = os.path.dirname(os.path.abspath(__file__)); RAW = os.path.join(HERE, '..', '..', 'raw', 'reviews')
SR = 16000
NAMES = {'r1': 'خلود خالد', 'r2': 'رحمة', 'r3': 'دينا'}

# (source, first word start, last word end, chapter): the client's order (v2). Every clip holds a whole sentence.
EDL = [
    ('r2', 0.00, 4.58, 'open'),      # اشتغلت بعد شهرين من الكورس، اشتغلت بقى في شركة Eagle Eye من شهر أربعة تقريباً
    ('r1', 19.60, 21.78, 'open'),    # معظم الكورسات أنا ضيّعت وقتي فيها فعلاً
    ('r2', 38.84, 43.97, 'open'),    # لما جيت هنا في صابر جروب… كنت بحس إنها في بيتي، ومش مبالغة (client: drop «هي أنا في بيتي»)
    ('r1', 45.44, 51.00, 'open'),    # مش جاية كورس مهندس بقى قافل ويدوب آخد المعلومة، لا أنا جاية مكان مرتاحة فيه جداً
    ('r3', 41.52, 44.94, 'open'),    # هو عايزنا نكون شاطرين وعايزنا نكون زيه وأحسن منه طول الوقت
    ('card', 'work'),
    ('r1', 69.30, 76.68, 'work'),    # اشتغلت على بروجيكت، كان أول بروجيكت أطلعه، ونزّلته على البيهانس وفرق معايا جداً في البورتفوليو
    ('r3', 9.88, 16.90, 'work'),     # بيجيلي على الـ Behance الشغل، والـ Recommendations من صابر جروب. بتمنى أكون Art Director شاطر
    ('card', 'tip'),
    ('r2', 67.52, 74.54, 'tip'),     # بنصح أي حد حابب يدخل مجال الجرافيك لازم ياخد كورس مبتدئين الأول، أدوات والتولز المهمة جداً في المجال
    ('r3', 66.24, 70.30, 'tip'),     # أول حاجة يبقى متمكن من أدواته كويس أوي أوي، يعمل تغذية بصرية كتير أوي
    ('r1', 85.60, 88.96, 'tip'),     # بيعلّمك فعلاً إزاي تكون جرافيك ديزاينر شاطر
    ('outro',),
]
CARD = {'work': .8, 'tip': .8}
OUTRO = 3.0


def load(src):
    out = subprocess.run(['ffmpeg', '-v', 'error', '-i', os.path.join(RAW, src + '.mp4'), '-ac', '1', '-ar', str(SR), '-f', 'f32le', '-'], capture_output=True).stdout
    return np.frombuffer(out, np.float32)


AUD = {s: load(s) for s in ('r1', 'r2', 'r3')}


def env(src):
    y = AUD[src]; hop = SR // 100
    return np.array([20 * np.log10(np.sqrt(np.mean(y[i:i + hop] ** 2)) + 1e-9) for i in range(0, len(y) - hop, hop)])


ENV = {s: env(s) for s in AUD}


WORDS = {s: json.load(open(os.path.join(HERE, f'words_{s}.json'))) for s in AUD}


def events(src):
    """the sources are edited reels: their own shot cuts AND their burned caption changes (a new caption chunk).
    Measured on 108x192 grey frames: full-frame mean diff > 25 = a cut; caption band (y 1380-1620) diff > 6 on a still frame = a new caption."""
    raw = subprocess.run(['ffmpeg', '-v', 'error', '-i', os.path.join(RAW, src + '.mp4'), '-vf', 'scale=108:192,format=gray', '-f', 'rawvideo', '-'], capture_output=True).stdout
    F = np.frombuffer(raw, np.uint8).reshape(-1, 192, 108).astype(np.float32)
    full = np.abs(np.diff(F, axis=0)).mean(axis=(1, 2)); cap = np.abs(np.diff(F[:, 138:162, :], axis=0)).mean(axis=(1, 2))
    # a cut (or the source's own flash/transition frames around it): full diff > 25; a caption-only change: band diff > 6 with a still frame
    return [((k + 1) / 30, 'cut' if full[k] > 25 else 'cap') for k in range(len(full)) if full[k] > 25 or (cap[k] > 6 and full[k] < 10)]


EV = {s: events(s) for s in AUD}


def snap(src, i, o, a, b, win=.40):
    """no frame of another shot / another caption at our cut.
    A shot cut of the source just inside our clip is the source editor's own speech boundary: always start after it / end before it.
    A caption change is only used when the audio between it and our cut is quiet (no word is lost)."""
    e = ENV[src]; quiet = lambda x, y: e[max(0, int(x * 100)):max(int(x * 100) + 1, int(y * 100))].max() < -27
    for c, kind in EV[src]:
        if i < c <= i + win and (kind == 'cut' or quiet(i, c)): i = c - .001   # the change's own first frame (rounded up below)
    for c, kind in sorted(EV[src], reverse=True):
        if o - win <= c < o and (kind == 'cut' or quiet(c, o) or c >= b - .03): o = c - .004
    # whole frames only (no drift between picture, sound and graphics)
    i = round(np.ceil(i * 30 - 1e-6) / 30 + .001, 4); n = max(1, int(np.floor((o - i) * 30 + 1e-6)))
    return i, round(i + n / 30, 4)


def refine(src, t, kind):
    """start: the quietest 10 ms in [t-.15, t-.01] (never before the previous word's end);
    end: the quietest in [t-.02, t+.16], never past the next word's start - 30 ms"""
    e = ENV[src]; a, b = (t - .15, t - .01) if kind == 'in' else (t - .02, t + .16)
    W = WORDS[src]
    if kind == 'out':
        nxt = [w['s'] for w in W if w['s'] > t + .01]
        if nxt: b = min(b, nxt[0] - .03)
    else:
        prv = [w['e'] for w in W if w['e'] <= t + .01 and w['s'] < t - .01]
        if prv: a = max(a, prv[-1] + .02)
    i0, i1 = max(0, int(a * 100)), min(len(e) - 1, int(b * 100))
    if i1 < i0: return round(max(0.0, t), 2)
    k = i0 + int(np.argmin(e[i0:i1 + 1]))
    return round(max(0.0, k / 100), 2)


tl, t = [], 0.0
for row in EDL:
    if row[0] == 'card':
        d = CARD[row[1]]; tl.append(dict(kind='card', ch=row[1], t0=round(t, 3), t1=round(t + d, 3))); t += d
    elif row[0] == 'outro':
        tl.append(dict(kind='outro', t0=round(t, 3), t1=round(t + OUTRO, 3))); t += OUTRO
    else:
        src, a, b, ch = row; i, o = snap(src, refine(src, a, 'in'), refine(src, b, 'out'), a, b)
        tl.append(dict(kind='clip', src=src, name=NAMES[src], ch=ch, i=i, o=o, t0=round(t, 3), t1=round(t + o - i, 3))); t += o - i
E = dict(dur=round(t, 3), fps=30, tl=tl)
json.dump(E, open(os.path.join(HERE, 'edl.json'), 'w'), ensure_ascii=False, indent=1)
open(os.path.join(HERE, 'edl.js'), 'w').write('window.EDL = ' + json.dumps(E, ensure_ascii=False) + ';\n')   # for overlay.html (file:// cannot fetch)
for r in tl: print(r)
print('total', round(t, 2))
