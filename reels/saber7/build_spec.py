"""Build reels/saber7/spec.json (Visual Hierarchy reel).

All times below are written in SOURCE seconds (from words.json) and mapped to the edited
timeline with o(); the engine itself only sees output times.
usage: python3 reels/saber7/build_spec.py
"""
import json, os

HERE = os.path.dirname(os.path.abspath(__file__))
A = '../saber7/assets/'          # asset paths as seen from reels/engine/stage.html
BR = '../saber7/brand/'

# ---- edit: jump cuts remove the dead air (2.9-3.38, 18.24-18.5, 35.2-35.82) and the tail
KEEP = [[0.10, 2.90], [3.38, 18.24], [18.50, 35.20], [35.82, 41.95]]
OUTRO = 3.4


def o(t):
    acc = 0
    for s, e in KEEP:
        if s <= t <= e: return round(acc + t - s, 3)
        if t < s: return round(acc, 3)          # inside a removed gap -> the cut point
        acc += e - s
    return round(acc, 3)


SPEECH = round(sum(e - s for s, e in KEEP), 3)
C1, C2, C3 = o(2.90), o(18.24), o(35.20)        # cut points on the output timeline

# ---- restaurant ad mock-up: A = everything equally loud (2x2), B = visual hierarchy
ITEMS = [
    dict(html=f'<img src="{A}burger.png" style="width:86%;filter:drop-shadow(0 18px 30px rgba(0,0,0,.55))">',
         A=[440, 96, 360, 330], B=[60, 84, 720, 470], boxB=False),
    dict(html='<div style="text-align:center;line-height:.86"><div style="font-family:Bebas;font-size:1.25em;color:#FFC36B">99</div>'
              '<div style="font-family:Cairo;font-weight:900;font-size:.3em;color:#F6F3F2">جنيه بس!</div></div>',
         A=[40, 96, 360, 330], B=[450, 586, 330, 196], fs=.5),
    dict(html='<div style="display:grid;place-items:center;gap:.08em"><div style="width:1.1em;height:1.1em;border-radius:50%;background:#F6F3F2;'
              'display:grid;place-items:center;font-family:Bebas;color:#D83B25;font-size:1em;line-height:1;padding-top:.08em">BH</div>'
              '<div style="font-family:Poppins;font-weight:600;font-size:.2em;letter-spacing:.14em;color:#F6F3F2">BURGER HOUSE</div></div>',
         A=[440, 456, 360, 330], B=[250, 606, 170, 160], fs=.42),
    dict(html='<div style="transform:rotate(-6deg);background:linear-gradient(135deg,#E2462E,#B5301E);border-radius:.18em;padding:.06em .3em .14em;'
              'font-family:Cairo;font-weight:900;font-size:.62em;color:#fff;box-shadow:0 0 .4em rgba(216,59,37,.6);white-space:nowrap;direction:rtl">خصم 30%</div>',
         A=[40, 456, 360, 330], B=[60, 626, 160, 120], fs=.42),
]
cA = [[b[0] + b[2] / 2, b[1] + b[3] / 2] for b in (it['A'] for it in ITEMS)]
cB = [[b[0] + b[2] / 2, b[1] + b[3] / 2] for b in (it['B'] for it in ITEMS)]


def items(at):
    return [dict(it, at=o(t)) for it, t in zip(ITEMS, at)]


ad1 = dict(type='admock', t0=o(12.10), t1=C2 + .30, y=250, h=820, title='إعلان مطعم',
           items=items([12.94, 13.46, 14.12, 14.78]),
           pulse=[o(16.14), o(16.68)],
           eye=[[o(17.10), *cA[0]], [o(17.36), *cA[3]], [o(17.58), *cA[1]], [o(17.82), *cA[2]], [o(18.06), *cA[0]]], eyeHold=.25,
           q=[[o(17.45), 330, 380, C2 + .3], [o(17.80), 700, 420, C2 + .3]])
ad2 = dict(type='admock', t0=o(24.40), t1=o(28.40), y=250, h=820, title='إعلان مطعم',
           items=items([24.42, 24.47, 24.52, 24.57]),
           morph=[o(24.55), .75],
           nums=[[o(25.28), 0], [o(26.22), 1], [o(26.86), 2], [o(27.48), 3]],
           eye=[[o(25.00), *cB[0]], [o(25.28), *cB[0]], [o(26.22), *cB[1]], [o(26.86), *cB[2]], [o(27.48), *cB[3]]], eyeHold=.6)

ELS = [
    # hook: the problem
    dict(type='chips', t0=o(3.86), t1=o(5.10), y=262, x=70, items=[dict(text='مشكلة كبيرة', icon='x', cls='bad')], at=[o(3.96)]),
    # everything is "perfect"... and still not good
    dict(type='chips', t0=o(6.45), t1=o(10.90), y=262, x=70,
         items=[dict(text='كل حاجة Perfect'), dict(text='وحلوة قوي'), dict(text='النتيجة: مش حلو', icon='x', cls='bad')],
         at=[o(6.58), o(7.06), o(9.62)]),
    ad1,
    # the term
    dict(type='kin', t0=o(21.10), t1=o(22.45), din=.3, dout=.2, iris=True,
         lines=[dict(text='Visual Hierarchy', y=930, size=118, w=800, font='Poppins', anim='blur', at=o(21.46) - o(21.10), stagger=.28, hl=[1]),
                dict(text='التسلسل البصري', y=1100, size=74, w=800, anim='rise', at=.78, stagger=.1, color='#CBC7C5')],
         imgs=[dict(src=A + 'hierarchy.png', x=400, y=560, w=280, at=.05)],
         sparks=[[820, 620, 50, .7]]),
    ad2,
    dict(type='chips', t0=o(28.45), t1=o(30.10), y=262, x=70, items=[dict(text='تبيع المنتج بتاعك')], at=[o(28.55)]),
    # "give the biggest piece to the hero"
    dict(type='pie', t0=o(31.20), t1=o(35.14), x=676, y=292, w=360, title='حلاوة التصميم',
         slices=[dict(label='البطل', v=50, color='#FF8A1F', at=o(31.35)), dict(label='السعر', v=25, color='#D83B25', at=o(31.65)),
                 dict(label='اللوجو', v=15, color='#A9A8AE', at=o(31.95)), dict(label='الخصم', v=10, color='#5A514C', at=o(32.25))],
         hero=0, heroAt=o(33.18), center='<span style="color:#FF8A1F">البطل</span>'),
    # "guide the viewer's eye" -> viewfinder, then the file
    dict(type='vf', t0=o(36.70), t1=o(38.42), label='REC', meta='ISO 800 · F/1.8 · 1/60'),
    dict(type='book', t0=o(39.15), t1=SPEECH + .05, x=745, y=300, w=280, img=A + 'booklet.png', tag='PDF', title='Visual<br>Hierarchy',
         sub='إزاي توجّه عين المشاهد', pill='PDF · ملف'),
    dict(type='outro', t0=SPEECH, logos=[[BR + 'saber_red.png', 300], [BR + 'mushroom.png', 380]],
         cta="ملف الـ <span style='color:#FF8A1F;font-family:Poppins;font-weight:600'>Visual Hierarchy</span><br>في أول كومنت ⬇"),
]
# soft light leaks on transitions (screen blend, no slides)
for t, img, kw in [(C1, 1, dict(flip=True)), (o(12.10), 2, {}), (o(21.10), 3, {}), (o(24.40), 2, dict(flip=True)),
                   (C3, 1, {}), (SPEECH, 3, dict(flipY=True))]:
    ELS.append(dict(type='leak', t=t, d=.45, img=A + f'leak{img}.jpg', amt=.55, **kw))

# ---- camera: gentle zooms in/out; steps only on cuts or behind opaque graphics
CAM = [[0, 1.0], [C1 - .01, 1.06], [C1, 1.14], [o(9.5), 1.08], [o(10.1), 1.08], [o(11.9), 1.16], [C2 - .01, 1.18],
       [C2, 1.0], [o(21.08), 1.12], [o(21.80), 1.12], [o(21.81), 1.02], [o(24.40), 1.09], [o(25.8), 1.09], [o(25.81), 1.0],
       [o(31.0), 1.0], [C3 - .01, 1.05], [C3, 1.14], [o(36.7), 1.16], [o(38.42), 1.18], [o(39.2), 1.03], [SPEECH, 1.06]]
PUNCH = [[o(2.30), o(2.70), .04], [o(9.60), o(9.96), .05], [o(34.00), o(34.5), .035], [o(40.76), o(41.1), .035]]
FX = [dict(t=C1, type='zoomblur', d=.18), dict(t=C3, type='zoomblur', d=.18)]

# ---- SFX: soft, informative sounds (no whooshes)
SFX = []
add = lambda t, ty, g=0: SFX.append(dict(t=round(t, 3), type=ty, g=g))
add(o(3.96) + .03, 'err')
add(o(9.62) + .03, 'err')
for it, ty in zip(ad1['items'], ['pop', 'pop_lo', 'pop', 'pop_lo']): add(it['at'], ty)
for t in ad1['pulse']: add(t, 'pop_lo', -3)
for e in ad1['eye'][1:]: add(e[0], 'tick', 2)
add(ad1['q'][0][0], 'pop_lo', -4)
for k, n in enumerate(ad2['nums']): add(n[0], f'chime{k}')
add(ad2['morph'][0], 'bloom', -2)
for t in (ad1['t0'], ad2['t0']): add(t - .35, 'bloom')
add(o(21.46), 'soft_hit', -2); add(o(21.46) + .02, 'shimmer', -4)
add(o(28.55) + .02, 'ding', -2)
pie = ELS[6]
for s in pie['slices']: add(s['at'], 'tick', 3)
add(pie['heroAt'], 'chime4', -2)
add(o(39.15) + .05, 'paper'); add(o(39.15) + .45, 'ding', -3)
add(SPEECH + .15, 'soft_hit'); add(C1 - .45, 'bloom', -3); add(C3 - .45, 'bloom', -3)

MUSIC = 'This-Funk-Groove (liosound), main mix'
spec = {
    'title': 'الـ Visual Hierarchy',
    'src': '../../raw/s7/saber7.mp4', 'words': 'words.json', 'face': 'face.json',
    'keep': KEEP, 'cam': CAM, 'punch': PUNCH, 'fx': FX, 'grade': 'light', 'sharpen': .25,
    'logo_src': BR + 'saber_white.png', 'logo_css': 'top:96px;left:60px;width:118px',
    'cap': {
        # hand-made chunks (first source word index of each caption) so every caption is a meaningful phrase
        'starts': [0, 3, 6, 9, 11, 14, 18, 21, 23, 26, 28, 30, 33, 35, 37, 39, 41, 43, 44, 45, 46, 49, 51, 53, 55, 58, 60, 62, 63,
                   66, 68, 70, 72, 74, 77, 79, 81, 83, 85, 88, 89, 92, 94, 96, 99, 100, 102, 104, 106, 109, 111, 113, 115, 118],
        'hl': [2, 8, 11, 20, 29, 30, 36, 40, 42, 43, 44, 45, 48, 50, 54, 57, 60, 64, 65, 67, 73, 75, 78, 80, 82, 87, 93, 94, 97, 99,
               105, 106, 114, 117],
        'fix': {'13': 'جدًا', '31': 'اللي', '32': 'أقوله،', '39': 'إعلان', '45': 'والخصم', '67': 'الأساسية', '70': 'إنك', '76': 'الأول',
                '92': 'إنك', '97': 'أكبر', '104': 'إزاي', '111': 'أخوك', '113': 'سايبلك', '116': 'أول', '121': ''},
    },
    'els': ELS,
    'outro': {'dur': OUTRO},
    'sfx': SFX, 'sfx_off': ['whoosh', 'whoosh_dn', 'riser', 'glitch', 'impact'],
    # music edit (analysed: ~153 BPM, bar 1.565 s; build bar 6.80, groove drop 8.37, stop bar 64.72, lift 66.28, ending ~100.5)
    #  seg1 starts so the build sits under the hook and the drop lands on "التصميم Perfect";
    #  seg2 puts the stop bar under "مهمة قوي اسمها الـ" and the lift on "Visual Hierarchy";
    #  seg3 jumps to the track's outro so the music ends with the end card. All joins are on downbeats.
    'music': {'file': '../../raw/s7/music/liosound_This-Funk-Groove/liosound_This-Funk-Groove_main.wav', 'at': 0,
              'segs': [[6.530, 25.585], [64.719, 85.068], [96.026, 100.95]], 'gain': -22, 'duck': -12, 'end_fade': .8},
}
json.dump(spec, open(os.path.join(HERE, 'spec.json'), 'w'), ensure_ascii=False, indent=1)
print('speech', SPEECH, 'total', SPEECH + OUTRO, 'cuts', C1, C2, C3, 'lift at', o(21.46), 'drop at', o(1.9) + 0)
