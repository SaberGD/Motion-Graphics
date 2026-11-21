# Student Portal ad (SG MOTION, Academy, 9:16, 58.4 s)

- **VO:** `vo/spoken.txt` (the client-approved scenario), voiced by the ElevenLabs library voice **Fatima – Smooth Audiobook Narrator** (`vWDp3PLsTWjIhBxxUKh9`), as in the Mariam piece.
  - Settings: seed 21, pauses ≤ 0.22 s, atempo 1.03, −16 LUFS. Output: 55.1 s, QC 96 %.
  - The «15%» line (the referral discount, as written in the portal code) is a separate sentence, so it can be cut if the offer changes.
- **Screens:** the portal's own UI (`pages/StudentPortal.tsx` and its components, training repo) run with in-memory **demo** data.
  - Demo student «أحمد محمد», group GD-27, 60 points, ranked 2 of 12. No real student data, and nothing touched the live Firebase.
  - Phone screens are in `assets/screens/*.jpg` (390×844 @3x). The PNG masters and the desktop set are in `raw/portal-ad/screens_png/` (git-ignored).
  - Rerun the capture with `harness/rerun.sh [mobile|desktop|all]`: it works on a scratch copy of the training repo and mocks Firebase and network.
- **Motion:** `comp.html`.
  - Fast feature cuts on the VO words, inside a phone: zooms and pans on the feature.
  - Callout chips use the VO's own words.
  - Accents: an attendance tick, +points pops, the #2 rank badge (matches Maro's demo answer), a tap on the certificate download, and the 15% pop.
  - Kinetic captions put a red block on one keyword per line.
  - It opens on a quick montage and closes on the Academy end card (SABERGROUPEG +AI wordmark, CTA «سيب كومنت… وهنتواصل معاك», the site).
- **Sound:** `build_mix.py`. Funky Fusion plays from its start, ducked, with an EQ pocket, plus one UI SFX per motion and no whooshes. Master: −14 LUFS.
- **Render:** `motion/render.sh motion/portal-ad` → `out/portal_ad_9x16.mp4`.
