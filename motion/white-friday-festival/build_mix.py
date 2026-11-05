"""Write mix.json for the White Friday piece: VO (Saber's cloned voice) + music from the track's start + one soft SFX per motion."""
import json, os
HERE = os.path.dirname(os.path.abspath(__file__))
MAP = json.load(open(os.path.join(HERE, '..', '..', 'reels', 'library', 'sfx_map.json')))
DUR, FLIP, TITLE, END = 71.04, 6.853, 13.114, 67.903
SFX = []
def sfx(role, t, dg=-3):     # many events in this piece -> 3 dB under the reel levels
    m = MAP[role]; SFX.append(dict(t=round(t, 3), file='../../reels/library/sfx/' + m['file'] + '.ogg', g=m['g'] + dg, rate=m.get('rate', 1.0)))
sfx('item_pop', 1.70); sfx('pulse', 2.10); sfx('reveal', 3.14); sfx('eye_move', 4.28)
sfx('cutaway_in', FLIP - .05)
sfx('item_pop', 8.40); sfx('bad', 8.81, -5); sfx('item_pop2', 9.78); sfx('item_pop3', 10.00); sfx('bad', 10.374, -5)
sfx('sparkle', 12.50); sfx('reveal', TITLE); sfx('pulse', 14.95)
sfx('item_pop', 18.84); sfx('item_pop2', 19.68)
for i, at in enumerate([22.64, 23.54, 24.54]): sfx(['item_pop', 'item_pop2', 'item_pop3'][i], at); sfx('check2', at + .26, -6)
sfx('item_pop', 26.34); sfx('tick', 26.74); sfx('item_pop2', 28.16); sfx('tick', 29.0); sfx('confirm', 31.74)
for i, at in enumerate([36.30, 36.70, 37.18]): sfx(f'order{i + 1}', at)
sfx('hero', 38.547)
sfx('item_pop', 42.10); sfx('bad', 42.58, -4); sfx('morph', 43.16); sfx('tick', 43.58)
sfx('reveal', 45.52); sfx('sparkle', 45.6)
sfx('cutaway_in', 49.60); sfx('check', 50.40)
for i, at in enumerate([52.02, 52.34, 52.78]): sfx(f'order{i + 1}', at, -5)
sfx('confirm', 55.48)
sfx('tick', 56.72); sfx('tick', 57.40); sfx('item_pop', 58.16); sfx('check', 58.66); sfx('sparkle', 59.40)
sfx('item_pop', 62.32); sfx('hero', 66.34)
sfx('outro', END + .1); sfx('outro_low', END + .08)
mix = {'dur': DUR,
       'vo': {'file': 'vo/white_friday_vo_mohamed_saber.flac', 'at': 0, 'gain': 0},
       'music': {'file': '../../raw/wf/liosound_This-Funk-Groove_main.mp3', 'at': 0, 'gain': -16, 'duck': -4, 'duck_smooth': .6, 'fade': 1.4,
                 'af': 'equalizer=f=1500:t=q:w=1.2:g=-3.5,equalizer=f=3000:t=q:w=1.0:g=-4.5'},
       'sfx': SFX}
json.dump(mix, open(os.path.join(HERE, 'mix.json'), 'w'), indent=1)
print(len(SFX), 'sfx events')
