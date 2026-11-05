# Motion-Graphics: Saber Group reels

Saber Group video work comes in **two named styles**. Every request names one, or you ask which:

| Style | What it is | Rules |
|---|---|---|
| **SG EDIT** (المونتاج) | talking-head reels: Saber on camera, cuts, captions, graphics over footage | `reels/SYSTEM.md` (+ `reels/saber7/` reference) |
| **SG MOTION** (الموشن) | designed motion pieces without footage: Academy / MARO ads, promos, end cards, any ratio | `brand-kit/` (start at `brand-kit/README.md`) |

**Before editing any new video, read `reels/SYSTEM.md`.** It holds the client's rules, the numbers and the workflow.
`reels/saber7/` is the reference implementation, and `reels/references/` has the reference videos and sheets.
**`brand-kit/`** is the client's Saber Group Claude Motion Kit (identity, logos, MARO mascot, fonts, motion rules). It is the rulebook of **SG MOTION**, and its locked-asset and approved-facts rules apply to SG EDIT too. Where the two styles differ, see `reels/SYSTEM.md` §9.

## Talking to the client
- Reply in Egyptian Arabic, and keep technical terms in English. Give any time in Cairo time.
- Send screenshots (`reels/preview.sh`) **before** the final render, then deliver **two looks**: original colours + graded.

## SG EDIT non-negotiables (from client feedback, details in reels/SYSTEM.md §0)
- Keep the source fps (30) at 1080×1920. Motion stays moderate. **No left/right whips or slides, no whoosh/riser sounds.**
- Cut silences with a soft transition or zoom, but **never inside a word**: leave ~100 ms after the last loud frame (unvoiced tails). Check with `reels/tools/cuts.py`.
- The voice comes first and must be clear (voice EQ chain in the spec). The music plays **from the track's start**, low, follows the voice gently, and has an EQ pocket.
- SFX: recorded UI sounds from `reels/library/sfx_map.json`, one per on-screen motion, kept low.
- Branding (SG EDIT): the white **SABER GROUP Marketing Agency** mark in the corner, and the red agency logo **alone** in the outro. **Mushroom is a temporary partner**: add its logo next to Saber's only when the client says that video is with Mushroom (they will say so beforehand). **Never `alternate-saber-logo-academy.svg`**: it is a redrawn fake ("أكاديمية تدريب") that the client rejected. The real Academy / wordmark logos live in `brand-kit/assets/logos/` and are placed as-is: never redrawn, recoloured or mirrored.
- Captions are corrected by hand, in meaningful chunks, with one orange keyword per chunk. When the video mentions a real file, show the real one.
- Saber's cloned voice (ElevenLabs "Mohamed Saber", `h1dykroatZMMS5JzRfwx`): only for text he approved, via `reels/tools/tts.py` with the key from the `ELEVENLABS_API_KEY` env var. Never put the key in the repo. See `reels/SYSTEM.md` §10.

## Start a new SG EDIT reel
```bash
reels/new_reel.sh <name> raw/<name>/<video>.mp4 raw/<name>/<music>.wav     # analysis + first build_spec.py
reels/preview.sh reels/<name> 1.0,5.0,12.0                                  # screenshots for the client
reels/render.sh reels/<name>                                                 # both looks → reels/<name>/out/
```
## Start an SG MOTION piece
Copy `motion/white-friday-festival/` (the reference piece). Then:
- Write `comp.html` scenes against the VO word times and `reels/tools/beats.py` output.
- Run `motion/render.sh motion/<piece>`.
- Read `motion/README.md` first (kit rules + the 12 principles in code).

Raw footage and music live in `raw/` (git-ignored) and are downloaded from Google Drive. Use the Drive connector to read metadata; plain `curl` on `drive.usercontent.google.com/download?id=…&confirm=t` works for files shared by link.
