"""mix.json for the student-portal ad: VO (Fatima, ElevenLabs library voice) + Funky Fusion from its start + one soft UI SFX per on-screen motion."""
import json, os
HERE = os.path.dirname(os.path.abspath(__file__))
MAP = json.load(open(os.path.join(HERE, '..', '..', 'reels', 'library', 'sfx_map.json')))
DUR = 58.4; S = []
def sfx(role, t, dg=-3):
    m = MAP[role]; S.append(dict(t=round(t, 3), file='../../reels/library/sfx/' + m['file'] + '.ogg', g=m['g'] + dg, rate=m.get('rate', 1.0)))
for i in range(7): sfx('item_pop' if i % 2 else 'item_pop2', .05 + i * .2, -5)          # the chat pile
sfx('reveal', 2.16)                                                                       # the phone
for t in (3.94, 5.92, 9.88, 10.88, 14.52, 17.10, 18.98, 21.38, 24.06, 26.18, 30.26, 33.14, 36.64, 39.32, 40.92, 43.28): sfx('tick', t, -5)   # screen changes
for t in (10.88, 11.70, 13.16, 22.48, 23.32, 24.06, 31.38, 32.24, 33.84, 34.54, 39.32, 40.92, 41.80): sfx('item_pop3', t + .02, -4)          # callouts
sfx('confirm', 16.62); sfx('sparkle', 19.86); sfx('sparkle', 20.82); sfx('hero', 29.10); sfx('check', 38.12); sfx('reveal', 45.88)
for i in range(11): sfx('order1' if i % 2 else 'order2', 46.90 + i * .35, -9)             # montage
sfx('outro', 50.85); sfx('outro_low', 50.83)
mix = {'dur': DUR, 'vo': {'file': 'vo/portal_vo_fatima.flac', 'at': 0, 'gain': 0},
       'music': {'file': '../../raw/mariam/Funky_Fusion.mp3', 'at': 0, 'gain': -16.5, 'duck': -4, 'duck_smooth': .6, 'fade': 1.6,
                 'af': 'equalizer=f=1500:t=q:w=1.2:g=-3.5,equalizer=f=3000:t=q:w=1.0:g=-4.5'}, 'sfx': S}
json.dump(mix, open(os.path.join(HERE, 'mix.json'), 'w'), indent=1); print(len(S), 'sfx')
