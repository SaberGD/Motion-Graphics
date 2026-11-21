"""mix_<variant>.json: VO (Fatima) + Funky Fusion from its start (ducked, EQ pocket) + one soft UI SFX per on-screen motion (taps, sheets, icon drop)."""
import json, os, sys
HERE = os.path.dirname(os.path.abspath(__file__)); V, DUR = sys.argv[1], float(sys.argv[2])
s = open(os.path.join(HERE, 'timing.js')).read(); T = json.loads(s[s.index('=') + 1:s.rindex(';')])[V]; st = T['starts']; END = T['end'] + .25
MAP = json.load(open(os.path.join(HERE, '..', '..', 'reels', 'library', 'sfx_map.json'))); S = []
def sfx(role, t, dg=-3):
    m = MAP[role]; S.append(dict(t=round(t, 3), file='../../reels/library/sfx/' + m['file'] + '.ogg', g=m['g'] + dg, rate=m.get('rate', 1.0)))
ios = V.startswith('ios'); app_open = st[5] + (st[6] - st[5]) * .55
sfx('reveal', .1); sfx('question', .8)                                   # phone, «؟»
sfx('cutaway_in', st[1] - .05)                                           # the browser
sfx('tick', st[2] + .55); sfx('doc_open', st[3] + .02)                   # tap share/menu, sheet opens
sfx('tick', st[3] + (1.7 if ios else 1.0)); sfx('doc_open', st[4])      # tap the row, the confirm panel
sfx('check', st[4] + .9)                                                 # tap Add / Install
sfx('item_pop', st[5] + .5); sfx('tick', app_open - .25); sfx('reveal', app_open)   # icon drops, tap it, the app opens
sfx('item_pop2', st[6] + .5)                                             # the update bar
sfx('outro', END + .05); sfx('outro_low', END + .03)
for c in (st[1], st[2], st[3], st[4]): sfx('item_pop3', c + .3, -5)     # callout chips
mix = {'dur': DUR, 'vo': {'file': f'vo/pwa_vo_{V}.flac', 'at': 0, 'gain': 0},
       'music': {'file': '../../raw/mariam/Funky_Fusion.mp3', 'at': 0, 'gain': -16.5, 'duck': -4, 'duck_smooth': .6, 'fade': 1.6,
                 'af': 'equalizer=f=1500:t=q:w=1.2:g=-3.5,equalizer=f=3000:t=q:w=1.0:g=-4.5'}, 'sfx': S}
json.dump(mix, open(os.path.join(HERE, f'mix_{V}.json'), 'w'), indent=1)
