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

# (source, first word start, last word end, chapter) — times from words_r*.json, refined below
EDL = [
    ('r2', 0.00, 1.62, 'hook'),      # اشتغلت بعد شهرين من الكورس
    ('r3', 0.00, 3.86, 'hook'),      # أنا طول الوقت بشوف إن الناس اللي بيدّوا كورسات… دول نصابين
    ('r1', 19.60, 21.78, 'hook'),    # معظم الكورسات أنا ضاعت وقتي فيها فعلاً
    ('card', 'who'),
    ('r1', 8.26, 11.26, 'who'),      # أنا خلود خالد، 19 سنة، بدرس في كلية التجارة
    ('r2', 4.60, 6.80, 'who'),       # اسمي رحمة، عندي 21 سنة
    ('r3', 4.46, 7.32, 'who'),       # أنا اسمي دينا، اشتغلت designer في شركة دعاية وإعلان
    ('card', 'diff'),
    ('r3', 29.64, 33.38, 'diff'),    # القيمة مقابل السعر والحمد لله وزيادة
    ('r2', 38.84, 42.76, 'diff'),    # لما جيت هنا في صابر جروب… كنت بحس إنها في بيتي
    ('r1', 45.44, 51.00, 'diff'),    # مش جاية كورس… لا أنا جاية مكان مرتاحة فيه جداً
    ('r3', 41.52, 44.48, 'diff'),    # هو عايزنا نكون شاطرين وعايزنا نكون زيه وأحسن منه
    ('card', 'work'),
    ('r1', 72.58, 76.68, 'work'),    # نزلته على البيهانس بتاعي وفرق معايا جداً في البورتفوليو
    ('r3', 9.88, 14.50, 'work'),     # بيجيلي على الـ Behance الشغل، والـ Recommendations من صابر جروب
    ('card', 'tip'),
    ('r2', 67.52, 71.86, 'tip'),     # بنصح أي حد حابب يدخل مجال الجرافيك لازم ياخد كورس مبتدئين الأول
    ('r3', 66.24, 70.30, 'tip'),     # يبقى متمكن من أدواته كويس أوي أوي، يعمل تغذية بصرية كتير أوي
    ('r1', 85.60, 88.96, 'tip'),     # بيعلّمك فعلاً إزاي تكون جرافيك ديزاينر شاطر
    ('outro',),
]
CARD = {'who': .8, 'diff': .8, 'work': .8, 'tip': .8}
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


def refine(src, t, kind):
    """start: the quietest 10 ms in [t-.12, t+.04] (never before the previous word's end);
    end: the quietest in [t-.02, t+.16], never past the next word's start - 30 ms"""
    e = ENV[src]; a, b = (t - .15, t - .01) if kind == 'in' else (t - .02, t + .16)   # never start after the word's own start
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
        src, a, b, ch = row; i, o = refine(src, a, 'in'), refine(src, b, 'out')
        tl.append(dict(kind='clip', src=src, name=NAMES[src], ch=ch, i=i, o=o, t0=round(t, 3), t1=round(t + o - i, 3))); t += o - i
E = dict(dur=round(t, 3), fps=30, tl=tl)
json.dump(E, open(os.path.join(HERE, 'edl.json'), 'w'), ensure_ascii=False, indent=1)
open(os.path.join(HERE, 'edl.js'), 'w').write('window.EDL = ' + json.dumps(E, ensure_ascii=False) + ';\n')   # for overlay.html (file:// cannot fetch)
for r in tl: print(r)
print('total', round(t, 2))
