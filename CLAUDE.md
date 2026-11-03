# Motion-Graphics: Saber Group reels

Talking-head reels for **Saber Group × Mushroom** are edited with the motion system in `reels/`.
**Before editing any new video, read `reels/SYSTEM.md`.** It holds the client's rules, the numbers and the workflow.
`reels/saber7/` is the reference implementation, and `reels/references/` has the reference videos and sheets.
**`brand-kit/`** is the client's Saber Group Claude Motion Kit (identity, logos, MARO mascot, fonts, motion rules). It governs designed motion pieces (Academy/MARO ads, promos), and its locked-asset and approved-facts rules apply everywhere. Read `brand-kit/README.md`; where it differs from reels, see `reels/SYSTEM.md` §9.

## Talking to the client
- Reply in Egyptian Arabic, and keep technical terms in English. Give any time in Cairo time.
- Send screenshots (`reels/preview.sh`) **before** the final render, then deliver **two looks**: original colours + graded.

## Non-negotiables (from client feedback, details in reels/SYSTEM.md §0)
- Keep the source fps (30) at 1080×1920. Motion stays moderate. **No left/right whips or slides, no whoosh/riser sounds.**
- Cut silences with a soft transition or zoom, but **never inside a word**: leave ~100 ms after the last loud frame (unvoiced tails). Check with `reels/tools/cuts.py`.
- The voice comes first and must be clear (voice EQ chain in the spec). The music plays **from the track's start**, low, follows the voice gently, and has an EQ pocket.
- SFX: recorded UI sounds from `reels/library/sfx_map.json`, one per on-screen motion, kept low.
- Branding (reels): the white **SABER GROUP Marketing Agency** mark in the corner, and the red agency logo + Mushroom in the outro. **Never `alternate-saber-logo-academy.svg`**: it is a redrawn fake ("أكاديمية تدريب") that the client rejected. The real Academy / wordmark logos live in `brand-kit/assets/logos/` and are placed as-is: never redrawn, recoloured or mirrored.
- Captions are corrected by hand, in meaningful chunks, with one orange keyword per chunk. When the video mentions a real file, show the real one.

## Start a new reel
```bash
reels/new_reel.sh <name> raw/<name>/<video>.mp4 raw/<name>/<music>.wav     # analysis + first build_spec.py
reels/preview.sh reels/<name> 1.0,5.0,12.0                                  # screenshots for the client
reels/render.sh reels/<name>                                                 # both looks → reels/<name>/out/
```
Raw footage and music live in `raw/` (git-ignored) and are downloaded from Google Drive. Use the Drive connector to read metadata; plain `curl` on `drive.usercontent.google.com/download?id=…&confirm=t` works for files shared by link.
