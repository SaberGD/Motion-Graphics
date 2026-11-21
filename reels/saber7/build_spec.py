"""Build reels/saber7/spec.json (Visual Hierarchy reel).

All times below are written in SOURCE seconds (from words.json) and mapped to the edited
timeline with o(); the engine itself only sees output times.
usage: python3 reels/saber7/build_spec.py
"""
import json, os

HERE = os.path.dirname(os.path.abspath(__file__))
A = '../saber7/assets/'          # asset paths as seen from reels/engine/stage.html
BR = '../saber7/brand/'

# ---- music: This Funk Groove (main mix) from its first beat, constant low level. Beat grid measured on the track:
BPM, BEAT0 = 153.32, 0.148
BEAT = 60 / BPM


def snap(t, maxd=.2):
    """move a free (not word-bound) visual event onto the nearest music beat"""
    k = round((t - BEAT0) / BEAT); b = BEAT0 + k * BEAT
    return round(b, 3) if abs(b - t) <= maxd else t


# ---- edit: jump cuts remove the dead air (3.16-3.40 after the whole "Perfect", 18.24-18.5, the breath after "Hierarchy" 22.40-22.64, 35.2-35.82)
KEEP = [[0.10, 3.16], [3.40, 18.28], [18.48, 22.58], [22.66, 35.26], [35.80, 41.92]]
OUTRO = 3.4


def o(t):
    acc = 0
    for s, e in KEEP:
        if s <= t <= e: return round(acc + t - s, 3)
        if t < s: return round(acc, 3)          # inside a removed gap -> the cut point
        acc += e - s
    return round(acc, 3)


# end the speech part so the end card lands on a beat
_sp = sum(e - s for s, e in KEEP); _b = BEAT0 + BEAT * -(-(_sp - BEAT0) // BEAT)
KEEP[-1][1] = round(KEEP[-1][1] + _b - _sp, 3)
SPEECH = round(sum(e - s for s, e in KEEP), 3)
C1, C2, CK, C3 = o(3.16), o(18.28), o(22.58), o(35.26)        # cut points on the output timeline

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


ad1 = dict(type='admock', t0=snap(o(12.40)), t1=C2 + .30, y=250, h=820, title='إعلان مطعم',
           items=items([12.94, 13.46, 14.12, 14.78]),
           pulse=[o(16.14), o(16.68)],
           eye=[[o(17.10), *cA[0]], [o(17.36), *cA[3]], [o(17.58), *cA[1]], [o(17.82), *cA[2]], [o(18.06), *cA[0]]], eyeHold=.25,
           q=[[o(17.45), 330, 380, C2 + .3], [o(17.80), 700, 420, C2 + .3]])
ad2 = dict(type='admock', t0=snap(o(24.40)), t1=snap(o(28.40)), y=250, h=820, title='إعلان مطعم',
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
    dict(type='kin', t0=snap(o(21.10)), t1=CK + .32, din=.3, dout=.26, iris=True,
         lines=[dict(text='Visual Hierarchy', y=930, size=118, w=800, font='Poppins', anim='blur', at=o(21.46) - snap(o(21.10)), stagger=.28, hl=[1]),
                dict(text='التسلسل البصري', y=1100, size=74, w=800, anim='rise', at=.78, stagger=.1, color='#CBC7C5')],
         imgs=[dict(src=A + 'hierarchy.png', x=400, y=560, w=280, at=.05)],
         sparks=[[820, 620, 50, .7]]),
    ad2,
    dict(type='chips', t0=o(28.45), t1=o(30.10), y=262, x=70, items=[dict(text='تبيع المنتج بتاعك')], at=[o(28.55)]),
    # "give the biggest piece to the hero"
    dict(type='pie', t0=snap(o(31.20)), t1=o(35.14), x=676, y=292, w=360, title='حلاوة التصميم',
         slices=[dict(label='البطل', v=50, color='#FF8A1F', at=o(31.35)), dict(label='السعر', v=25, color='#D83B25', at=o(31.65)),
                 dict(label='اللوجو', v=15, color='#A9A8AE', at=o(31.95)), dict(label='الخصم', v=10, color='#5A514C', at=o(32.25))],
         hero=0, heroAt=o(33.18), center='<span style="color:#FF8A1F">البطل</span>'),
    # "guide the viewer's eye" -> viewfinder, then the file
    dict(type='vf', t0=snap(o(36.70)), t1=o(38.42), label='REC', meta='ISO 800 · F/1.8 · 1/60'),
    dict(type='book', t0=snap(o(39.15)), t1=SPEECH + .05, x=732, y=300, w=308, cover=A + 'pdf_cover.jpg', ratio=1538 / 1056, pill='PDF · ملف'),
    dict(type='outro', t0=SPEECH, logos=[[BR + 'saber_red.png', 300], [BR + 'mushroom.png', 380]],
         cta="ملف الـ <span style='color:#FF8A1F;font-family:Poppins;font-weight:600'>Visual Hierarchy</span><br>في أول كومنت ⬇"),
]
# soft light leaks only on the real transitions (screen blend, kept light)
for t, img, kw in [(C1, 1, dict(flip=True)), (ELS[3]['t0'], 3, {}), (C3, 1, {}), (SPEECH, 3, dict(flipY=True))]:
    ELS.append(dict(type='leak', t=t, d=.45, img=A + f'leak{img}.jpg', amt=.3, **kw))

# ---- camera: gentle zooms in/out (max 1.14 on this 1080p source); steps only on cuts or behind opaque graphics
CAM = [[0, 1.0], [C1 - .01, 1.05], [C1, 1.12], [o(9.5), 1.07], [o(10.1), 1.07], [o(11.9), 1.12], [C2 - .01, 1.13],
       [C2, 1.0], [o(21.3), 1.08], [CK - .01, 1.08], [CK, 1.03], [o(24.40), 1.08], [o(25.8), 1.08], [o(25.81), 1.0],
       [o(31.0), 1.0], [C3 - .01, 1.04], [C3, 1.12], [o(36.7), 1.13], [o(38.42), 1.14], [o(39.2), 1.03], [SPEECH, 1.05]]
DROP = 8.366                                         # groove drop of the track (output time = track time)
PUNCH = [[o(2.30), o(2.70), .035], [DROP, DROP + .3, .03], [o(9.60), o(9.96), .04], [o(34.00), o(34.5), .03], [o(40.76), o(41.1), .03]]
FX = [dict(t=C1, type='zoomblur', d=.18), dict(t=C3, type='zoomblur', d=.18)]

# ---- SFX: recorded UI sounds (Kenney Interface Sounds, CC0), one per on-screen motion, kept low. g = peak dBFS.
SFX = []
add = lambda t, f, g=-28, rate=1.0: SFX.append(dict(t=round(t, 3), file='sfx/' + f + '.ogg', g=g, rate=rate))
add(o(3.96) + .02, 'error_004', -28)                                   # "مشكلة كبيرة" ✗
add(o(6.58) + .02, 'select_004', -29); add(o(7.06) + .02, 'select_004', -30, 1.12)   # ✓ ✓
add(o(9.62) + .02, 'error_004', -28)                                   # "مش حلو" ✗
for ad in (ad1, ad2):
    add(ad['t0'] - .06, 'maximize_006', -29); add(ad['t1'] - .42, 'minimize_006', -31)
for it, f, g in zip(ad1['items'], ['drop_002', 'drop_003', 'drop_004', 'drop_001'], [-25, -26, -26, -27]): add(it['at'], f, g)
for t in ad1['pulse']: add(t, 'glass_001', -31, .8)
for e in ad1['eye'][1:]: add(e[0] - .05, 'tick_004', -31)
add(ad1['q'][0][0], 'question_001', -28); add(ad1['q'][1][0], 'question_003', -30)
add(ad2['morph'][0], 'toggle_001', -31)
for k, n in enumerate(ad2['nums']): add(n[0], 'glass_001', -25, [1.0, 1.125, 1.25, 1.5][k])   # rising reading order 1-2-3-4
add(o(21.46), 'maximize_008', -28); add(o(21.50), 'glass_004', -33)    # Visual Hierarchy
add(o(28.55) + .02, 'confirmation_003', -29)
pie = ELS[6]
for s_ in pie['slices']: add(s_['at'], 'tick_004', -31)
add(pie['heroAt'], 'confirmation_002', -28)
add(ELS[7]['t0'], 'switch_002', -30)                                   # REC frame
add(ELS[8]['t0'] + .05, 'open_004', -31); add(ELS[8]['t0'] + .5, 'select_005', -31)   # PDF
add(SPEECH + .12, 'confirmation_004', -27); add(SPEECH + .1, 'bong_001', -30, .8)    # end card

MUSIC = 'This-Funk-Groove (liosound), main mix'
spec = {
    'title': 'الـ Visual Hierarchy',
    'src': '../../raw/s7/saber7.mp4', 'words': 'words.json', 'face': 'face.json',
    'keep': KEEP, 'cam': CAM, 'punch': PUNCH, 'fx': FX, 'grade': 'none', 'sharpen': .3, 'grain': .07,
    # colour-graded version (GRADE=cine): face-follow light, soft S-curve, cool shadows / warm highlights, skin-safe saturation
    'cine': {'contrast': .07, 'black': .006, 'white': 1.0, 'spot': .17, 'room': 0, 'sat': 1.12, 'skin_sat': 1.02, 'vig': .55,
             'shadow_tint': [.006, .002, .002], 'high_tint': [-.016, .002, .018]},
    # voice: the camera mic is dull (2-4 kHz ~22 dB under 500-1k): de-mud + presence + air, light NR, de-ess, gentle comp
    'voice_af': 'highpass=f=85,afftdn=nr=10:nf=-44,equalizer=f=180:t=q:w=1.1:g=-4,equalizer=f=380:t=q:w=1.2:g=-2,'
                'equalizer=f=1800:t=q:w=1.0:g=4,equalizer=f=3400:t=q:w=0.9:g=9,equalizer=f=5500:t=q:w=1.0:g=7,highshelf=f=7500:g=6,'
                'deesser=i=0.35:m=0.5:f=0.5,acompressor=threshold=-22dB:ratio=2.4:attack=6:release=120:makeup=2.5dB',
    'logo_src': BR + 'saber_white.png', 'logo_css': 'top:96px;left:60px;width:118px',
    'cap': {
        # hand-made chunks (first source word index of each caption) so every caption is a meaningful phrase
        'starts': [0, 3, 6, 9, 11, 14, 18, 21, 23, 26, 28, 30, 33, 35, 37, 39, 41, 43, 44, 45, 46, 49, 51, 53, 55, 58, 60, 62, 63,
                   66, 68, 70, 72, 74, 77, 79, 81, 83, 85, 88, 89, 92, 94, 96, 99, 100, 102, 104, 106, 109, 111, 113, 115, 118],
        'hl': [2, 8, 11, 20, 29, 30, 36, 40, 42, 43, 44, 45, 48, 50, 54, 57, 60, 64, 65, 67, 73, 75, 78, 80, 82, 87, 93, 94, 97, 99,
               105, 106, 114, 117],
        'fix': {'13': 'جدًا', '31': 'اللي', '32': 'أقوله،', '39': 'إعلان', '45': 'والخصم', '67': 'الأساسية', '72': 'عين', '106': 'عين', '70': 'إنك', '76': 'الأول',
                '92': 'إنك', '97': 'أكبر', '104': 'إزاي', '111': 'أخوك', '113': 'سايبلك', '116': 'أول', '121': ''},
    },
    'els': ELS,
    'outro': {'dur': OUTRO},
    'sfx': SFX, 'sfx_off': ['whoosh', 'whoosh_dn', 'riser', 'glitch', 'impact', 'pop', 'pop_lo', 'click', 'tick', 'shimmer', 'shutter'],
    # music: the track from 0 to the end. A bit louder, follows the voice with a gentle, slow dip (no pumping), and a
    # static EQ pocket at 1-4 kHz so the voice stays clearly on top; short fade at the end
    'music': {'file': '../../raw/s7/music/liosound_This-Funk-Groove/liosound_This-Funk-Groove_main.wav', 'at': 0,
              'segs': [[0, SPEECH + OUTRO + .5]], 'gain': -23.5, 'duck': -4, 'duck_smooth': .6, 'end_fade': 1.2,
              'af': 'equalizer=f=1500:t=q:w=1.2:g=-3.5,equalizer=f=3000:t=q:w=1.0:g=-4.5'},
}
json.dump(spec, open(os.path.join(HERE, 'spec.json'), 'w'), ensure_ascii=False, indent=1)
print('speech', SPEECH, 'total', round(SPEECH + OUTRO, 3), 'cuts', C1, C2, CK, C3, 'kin', ELS[3]['t0'], ELS[3]['t1'], 'ad', ad1['t0'], ad2['t0'], ad2['t1'])
