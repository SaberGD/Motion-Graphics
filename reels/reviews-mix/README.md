# Student reviews mix (SG EDIT, Academy): «نفس الأسئلة… 3 إجابات»

The three student review reels (Drive folder from the client) are cut into one 60 s montage at 1080×1920, 30 fps.
The fast cut runs: hook → 01 البداية → 02 التجربة → 03 النتيجة → 04 النصيحة → Academy end card.

Students: r1 = خلود خالد (720p source, scaled up), r2 = رحمة, r3 = دينا.

- **Captions:** the sources' own burned-in captions are kept (the client asked not to add new ones). The chapter cards use one word each, because the sources already show their own question titles.
- **Name chip:** a small chip on every clip (top-right, under the sources' top titles) shows who is talking.
- **Cuts:** taken from the Whisper word times (`words_r*.json`) and refined on the 10 ms energy envelope (`edl.py`). Starts never come after the word's start, ends never pass the next word's start, and the final Whisper pass was checked per clip. Every other clip gets a ≤1.08× punch-in, synchronised with the cut. No whips or slides.
- **Sound:**
  - The sources' original speech stays: the demucs check showed no music bed underneath (the no-vocals stems sit at about −38 LUFS).
  - Funky Fusion plays from its start at −22, ducked −4 under the voice, with a 1.5k/3k EQ pocket.
  - SFX: reveal + tick on every card, and the outro sound on the end card.
  - Master: −14 LUFS.
- **End card:** the real SABERGROUPEG +AI wordmark, «قصص نجاح حقيقية من طلابنا» and the site. The sources' end cards are not used: they carry the rejected «أكاديمية تدريب» logo.

Build:
```
python3 edl.py                                   # edl.json / edl.js
BUILD=<tmp> SEP=/nonexistent python3 build.py    # base cut + dialogue + mix + overlay (ALPHA PNG) → out/student_reviews_mix.mp4
```
Sources: `raw/reviews/r1..3.mp4` (git-ignored), downloaded from the client's Drive folder.

**v2 (client feedback)**
- **Order:**
  1. Rahma «اشتغلت بعد شهرين من الكورس…» (her whole sentence)
  2. Kholoud «معظم الكورسات ضيّعت وقتي فيها»
  3. Rahma «لما جيت هنا في صابر جروب… أنا في بيتي»
  4. Kholoud «مش جاية كورس…»
  5. Dina «هو عايزنا نكون شاطرين…»
  6. النتيجة → النصيحة → end card.
  Every clip holds a whole sentence. The intros chapter and the «القيمة مقابل السعر» line are out.
- **No music bed** (removed at the client's request); only soft SFX on the cards and the end card. `mix.py` now takes an optional `music`.
- **Graphics in the style of the Mariam piece, option A (light kit):**
  - over the footage: red corners and the wordmark on its charcoal plate, plus a white name pill per clip;
  - chapter cards on the off-white page with one big word rising in its mask and a red underline drawing in;
  - a light end card.
  - A slow push inside every clip (in on one, out on the next, ≤1.05×).
- **Clean transitions:**
  - `edl.py` finds the sources' own cuts (and their flash/transition frames) and their caption changes on the frames.
  - A clip never starts or ends with a frame of another shot, or with the next caption already showing: it starts on a source cut, or ends before it, when one is within 0.4 s.
  - In/out land on whole frames, so picture, sound and graphics never drift.
  - Scene detection on the output shows changes only at our own cuts and cards.
