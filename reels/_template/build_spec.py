"""Build spec.json for this reel (Saber Group × Mushroom motion system, see reels/SYSTEM.md).

Times below are written in SOURCE seconds, read straight from words.json, and mapped through the jump cuts with o().
Free visual events (cutaways, cards, leaks) go through snap(), which puts them on the music's beat.
usage: python3 reels/<reel>/build_spec.py      (then: reels/preview.sh reels/<reel> t1,t2,...  /  reels/render.sh reels/<reel>)
"""
import json, os

HERE = os.path.dirname(os.path.abspath(__file__))
L = '../library/'                 # shared library, as seen from reels/engine/stage.html
BR = '../brand/'
A = f'../{os.path.basename(HERE)}/assets/'   # this reel's own assets (stage-relative)
SFXMAP = json.load(open(os.path.join(HERE, '..', 'library', 'sfx_map.json')))

SRC = '__SRC__'                   # relative to this folder, e.g. ../../raw/<name>/<video>.mp4 (raw/ is not in git)
MUSIC = '__MUSIC__'               # the music bed: it plays from 0:00 of the track to the end of the video

# ---- music grid (from tools/beats.py → beats.json)
BEATS = json.load(open(os.path.join(HERE, 'beats.json'))) if os.path.exists(os.path.join(HERE, 'beats.json')) else {'bpm': 120, 'beat0': 0}
BEAT, BEAT0 = 60 / BEATS['bpm'], BEATS['beat0']


def snap(t, maxd=.2):
    """move a free (not word-bound) visual event onto the nearest music beat"""
    k = round((t - BEAT0) / BEAT); b = BEAT0 + k * BEAT
    return round(b, 3) if abs(b - t) <= maxd else t


# ---- edit: start from the KEEP that tools/cuts.py prints (cuts.txt), then check every cut by ear / with tools/cuts.py.
#      never cut inside a word; leave ~100 ms after a word's last loud frame and ~40 ms before the next word.
KEEP = __KEEP__
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
CUTS = [o(e) for s, e in KEEP[:-1]]               # cut points on the output timeline

# ---- graphics (catalogue + examples: reels/SYSTEM.md §5 and reels/saber7/build_spec.py)
ELS = [
    # dict(type='chips', t0=o(3.86), t1=o(5.10), y=262, x=70, items=[dict(text='مشكلة كبيرة', icon='x', cls='bad')], at=[o(3.96)]),
    dict(type='outro', t0=SPEECH, logos=[[BR + 'saber_red.png', 300], [BR + 'mushroom.png', 380]],
         cta="__CTA__"),
]
# soft light leaks only on real transitions (cuts, motion-scene entry, end card); keep them light (amt .3)
for k, t in enumerate(CUTS + [SPEECH]):
    ELS.append(dict(type='leak', t=t, d=.45, img=L + f'fx/leak{k % 3 + 1}.jpg', amt=.3, flip=bool(k % 2)))

# ---- camera: gentle zoom in/out, max 1.14 on 1080p sources; steps only on cuts or behind opaque graphics
CAM = [[0, 1.0]]
for k, c in enumerate(CUTS):
    z = 1.12 if k % 2 == 0 else 1.0
    CAM += [[c - .01, CAM[-1][1] + .04], [c, z]]
CAM += [[SPEECH, CAM[-1][1] + .04]]
PUNCH = []                        # [[o(t0), o(t1), .03-.05], ...] on stressed words / the music drop
FX = [dict(t=c, type='zoomblur', d=.18) for c in CUTS]

# ---- SFX: one recorded sound per on-screen motion, from library/sfx_map.json
SFX = []


def sfx(role, t, dg=0):
    # L is '../library/' from both reels/engine (stage) and reels/<name> (audio.py joins paths to the reel folder)
    m = SFXMAP[role]; SFX.append(dict(t=round(t, 3), file=L + 'sfx/' + m['file'] + '.ogg', g=m['g'] + dg, rate=m.get('rate', 1.0)))


sfx('outro', SPEECH + .12); sfx('outro_low', SPEECH + .1)

spec = {
    'title': '__TITLE__',
    'src': SRC, 'words': 'words.json', 'face': 'face.json',
    'keep': KEEP, 'cam': CAM, 'punch': PUNCH, 'fx': FX, 'grade': 'none', 'sharpen': .3, 'grain': .07,
    'cine': {'contrast': .07, 'black': .006, 'white': 1.0, 'spot': .17, 'room': 0, 'sat': 1.12, 'skin_sat': 1.02, 'vig': .55,
             'shadow_tint': [.006, .002, .002], 'high_tint': [-.016, .002, .018]},
    # voice chain for Saber's camera mic (dull: 2-4 kHz ~22 dB under 500-1k). Re-check the spectrum on a new mic.
    'voice_af': 'highpass=f=85,afftdn=nr=10:nf=-44,equalizer=f=180:t=q:w=1.1:g=-4,equalizer=f=380:t=q:w=1.2:g=-2,'
                'equalizer=f=1800:t=q:w=1.0:g=4,equalizer=f=3400:t=q:w=0.9:g=9,equalizer=f=5500:t=q:w=1.0:g=7,highshelf=f=7500:g=6,'
                'deesser=i=0.35:m=0.5:f=0.5,acompressor=threshold=-22dB:ratio=2.4:attack=6:release=120:makeup=2.5dB',
    'logo_src': BR + 'saber_white.png', 'logo_css': 'top:96px;left:60px;width:118px',
    'cap': {'maxWords': 3, 'maxChars': 20, 'starts': [], 'hl': [], 'fix': {}},
    'els': ELS,
    'outro': {'dur': OUTRO},
    'sfx': SFX, 'sfx_off': ['whoosh', 'whoosh_dn', 'riser', 'glitch', 'impact', 'pop', 'pop_lo', 'click', 'tick', 'shimmer', 'shutter'],
    'music': {'file': MUSIC, 'at': 0, 'segs': [[0, SPEECH + OUTRO + .5]], 'gain': -23.5, 'duck': -4, 'duck_smooth': .6, 'end_fade': 1.2,
              'af': 'equalizer=f=1500:t=q:w=1.2:g=-3.5,equalizer=f=3000:t=q:w=1.0:g=-4.5'},
}
if not spec['cap']['starts']: del spec['cap']['starts']   # automatic chunking until hand-made chunks are written
json.dump(spec, open(os.path.join(HERE, 'spec.json'), 'w'), ensure_ascii=False, indent=1)
print('speech', SPEECH, 'total', round(SPEECH + OUTRO, 3), 'cuts', CUTS)
