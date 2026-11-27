# Saber — AI video breakdown ad (9:16, 1080x1920, 30fps, 27.53s)

`output/saber_ai_breakdown_ad.mp4`

The doctor's speech runs once, start to finish, untouched. Every comparison shows its version at the same moment of the speech, so lip-sync holds the whole way through.

1. 0–11.45s: slider breakdown in 5 steps (wipes at 1.2, 2.75, 4.07, 8.55s): original shoot, then AI location, then AI outfit, then a new scene + B-roll (marble), then motion graphics.
2. 11.45–16.3s: 6 versions side by side, in sync (original, AI location, AI outfit, new scene, motion yellow, motion green).
3. 16.3–25.9s: flash cuts between styles every 2 beats (150 BPM).
4. 25.9s–end: holds on the CTA shot; music fades out.

`project/index.html` holds all the timing (object `S`). `scripts/audio.py` builds the soundtrack: the voice stays bit-exact, and the music and SFX are ducked under it.
Frames come from `../lip-filler/project` (plates and renders), `project/cache/original` (from `source/original_full.mp4`) and
`project/cache/marble` (from `source/marble_full_with_broll.mp4`, with the AI corner mark removed using delogo).
