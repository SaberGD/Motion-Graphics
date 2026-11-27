# Saber — AI video breakdown ad (9:16, 1080x1920, 30fps, 17.4s)

`output/saber_ai_breakdown_ad.mp4`

1. 0–9.1s: slider breakdown on the same take: original shoot, then an AI location wipe, then an AI outfit wipe, then a motion graphics + B-roll wipe (4-step stepper on top).
2. 9.1–13.2s: the 5 versions side by side, all in sync (original, AI location, AI outfit, motion yellow, motion green).
3. 13.2–17.4s: beat-synced flash cuts between the styles, ending on the CTA shot.

Built like the Lip Filler project: `project/index.html` holds all the timing (object `S`). `scripts/audio.py` makes the
voice edits, a synthesised 150 BPM track and the SFX. `scripts/render.mjs` renders the frames. The ad reads the
Lip Filler plates and renders from `../lip-filler/project` (cache/ and frames/), and the original shoot from `project/cache/original`
(`ffmpeg -i source/original_full.mp4 -vf fps=30 -q:v 2 project/cache/original/f%04d.jpg`).
