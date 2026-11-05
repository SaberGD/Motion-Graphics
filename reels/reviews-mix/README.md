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
