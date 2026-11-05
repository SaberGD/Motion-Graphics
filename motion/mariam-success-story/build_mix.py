"""mix.json for the Mariam success story: VO (stock Egyptian voice "Fatima – Narrator") + music from the track's start + one soft SFX per beat of the story.
All three options animate on the same story beats, so they share this mix."""
import json, os
HERE = os.path.dirname(os.path.abspath(__file__))
MAP = json.load(open(os.path.join(HERE, '..', '..', 'reels', 'library', 'sfx_map.json')))
DUR = 36.4; T0, D = 18.438, 7.4; SFX = []          # the «Free access» line is spliced in at T0 (D s)
def sfx(role, t, dg=-2, real=False):
    t = t if real or t < T0 else t + D
    m = MAP[role]; SFX.append(dict(t=round(t, 3), file='../../reels/library/sfx/' + m['file'] + '.ogg', g=m['g'] + dg, rate=m.get('rate', 1.0)))
sfx('item_pop', .05); sfx('doc_land', 3.62); sfx('tick', 5.94)                      # quote bubble, the real screenshot, «يوليو»
sfx('eye_move', 6.74); sfx('tick', 7.04)                                             # months count
sfx('hero', 8.30)                                                                     # «ده شغلها!» reveal
for i in range(4): sfx(f'order{i + 1}', 8.80 + i * .16, -5)                          # the campaign builds
sfx('sparkle', 11.06)                                                                 # «تسويقية»
sfx('morph', 12.54)                                                                   # «سحر» struck
sfx('item_pop', 13.34); sfx('item_pop2', 13.90); sfx('item_pop3', 14.68)             # تمرين / فيدباك / متابعة
sfx('confirm', 17.78); sfx('sparkle', 17.9)                                           # مكافأة
sfx('item_pop', 18.62, real=True); sfx('reveal', 19.24, real=True); sfx('tick', 20.54, real=True); sfx('doc_land', 21.42, real=True)
sfx('hero', 24.26, real=True); sfx('sparkle', 24.32, real=True)      # FREE ACCESS ticket, MASTERY LEVEL, مبروك
sfx('reveal', 19.06); sfx('tick', 21.44); sfx('check', 22.64)                         # CTA, comment, reply
sfx('outro', 24.20); sfx('outro_low', 24.18)                                          # end card
mix = {'dur': DUR,
       'vo': {'file': 'vo/mariam_vo_fatima_narrator.flac', 'at': 0, 'gain': 0},
       'music': {'file': '../../raw/wf/liosound_This-Funk-Groove_main.mp3', 'at': 0, 'gain': -17, 'duck': -4, 'duck_smooth': .6, 'fade': 1.6,
                 'af': 'equalizer=f=1500:t=q:w=1.2:g=-3.5,equalizer=f=3000:t=q:w=1.0:g=-4.5'},
       'sfx': SFX}
json.dump(mix, open(os.path.join(HERE, 'mix.json'), 'w'), indent=1)
print(len(SFX), 'sfx events')
