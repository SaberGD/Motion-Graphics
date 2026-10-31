# Motion-Graphics: Reel montage pipeline

`output/montaj1_reel.mp4` is the finished 1080×1920 reel (30 fps, −14 LUFS).

## Pipeline (`project/`)
| Step | File | What it does |
|---|---|---|
| 1 | `words.json` | Arabic transcript with word timings (faster-whisper large-v3) |
| 2 | `face.json` | Per-frame face track used for smart reframing |
| 3 | `base.py` | Reframe 4K → 1080×1920 following the face, per-shot zoom plan + punch-ins, zoom-blur transitions; `--no-grade` keeps a pre-graded source as-is, `--light-grade` adds a subtle finishing pass; `--mg` cuts to motion-graphics B-roll (experience bars, "everyone experimenting", AI wave) with zoom / push / iris / whip / flash transitions |
| 4 | `overlay.html` + `render_overlay.js` | Motion graphics / captions / infographics, rendered to a transparent PNG sequence with Playwright |
| 5 | `sfx.py` | Synthesised SFX (whooshes, pops, ticks, typing) synced to the graphics |
| 6 | `assemble.sh` | Composite + voice cleanup (HPF, denoise, EQ, compression), SFX ducked under the voice, loudness normalisation. Original voice only — no music, no audio from the B-roll |

All graphics respect the Instagram Reels safe area (top ~290px, bottom ~310px, sides ~150–170px kept clear; captions in the 67–76% band).

```bash
python3 project/base.py raw/after_coloring.mp4 /tmp/base.mp4 project/face.json --light-grade --mg raw/mg.mp4
node project/render_overlay.js /tmp/ov
python3 project/sfx.py /tmp/sfx.wav
project/assemble.sh raw/after_coloring.mp4 /tmp/base.mp4 /tmp/ov /tmp/sfx.wav output/montaj1_reel.mp4
```

## Music versions (`output/with_music/`)
Four reels with the funk bed ("Radio Feelings"): beat 1 from 4:19.6, beat 2 from 6:28.8 (first downbeat after the inter-track gap).

| File | Edit | Beat |
|---|---|---|
| `reel1_beat1.mp4` | colour-graded edit | beat 1 |
| `reel1_beat2.mp4` | colour-graded edit | beat 2 |
| `reel2_newhook_beat1.mp4` | alternate hook | beat 1 |
| `reel2_newhook_beat2.mp4` | alternate hook | beat 2 |

`make_timing.py` snaps punch-ins and mid-shot cutaway transitions to the beat grid (cuts in the footage stay put) and adds zoom "hits" where the track lifts. `assemble_music.sh` mixes the untouched voice (gain only) + SFX + music ducked under the voice, master ≈ −14 LUFS.

---

# Reel: الـ Visual Hierarchy (`reels/saber7/`)

Same Saber Group × Mushroom style as *SaberGroup_Reel_v6* (`reels/STYLE.md`), built on the reel engine (`reels/engine/`). The source is 1080×1920 at 30 fps, and the output keeps 1080×1920 at 30 fps. There are two looks:

| Output | Look |
|---|---|
| `out/saber7_original_colors.mp4` | footage colours untouched |
| `out/saber7_graded.mp4` | `GRADE=cine`: soft face-follow light, gentle S-curve, cool highlights / neutral shadows, skin-safe saturation, light vignette |

| File | Role |
|---|---|
| `build_spec.py` | writes `spec.json`. Every time is written in **source** seconds, taken from `words.json`, and mapped through the jump cuts. Free visual events snap to the music's beat grid |
| `render.sh` | builds the audio once, then each look (base plate, graphics, encode) |
| `words.json` / `face.json` | Whisper large-v3 word timings (with the dropped words re-timed) and the YuNet face track |
| `brand/` | white Saber Group mark for the corner (cut out of the agency logo), the red agency logo and the Mushroom logo for the outro |
| `assets/` | burger, hierarchy icon, booklet and light leaks from the asset pack |
| `sfx/` | recorded UI sounds from *Kenney Interface Sounds* (CC0, licence included) |

**Edit:** the dead air at 3.16–3.40 (after the whole "Perfect"), 18.28–18.48, 22.58–22.66 (hidden under the motion scene, which stays up until the voice comes back) and 35.26–35.80 s is cut. Every cut sits after the word has fully ended, including its unvoiced tail. The tail is trimmed so the end card lands on a beat. Cuts are hidden by zoom-blur, a light leak or the cutaways. There are no left/right moves. The camera zooms in and out slowly, never past 1.14× on this 1080p source, with Lanczos scaling and zoom-aware sharpening.

**Music:** *This Funk Groove* (liosound), main mix, played from 0:00 to the end of the video at one constant low level with no ducking. It sits about 16 dB under the voice and fades over the last 1.2 s. The tempo is about 153 BPM. Cutaways, the motion scene, cards and leaks snap to beats; the groove drop at 8.37 s gets a small punch-in.

**Voice:** the camera mic is dull: 2–4 kHz sits about 22 dB under 500 Hz–1 kHz. The chain is a de-mud cut at 180/380 Hz, presence at 1.8/3.4/5.5 kHz, an air shelf, light denoise, a de-esser and gentle compression. The master is −14 LUFS.

**SFX:** recorded UI sounds, one per on-screen motion, kept low (peaks about −25 to −33 dBFS before the master). Drops for the ad items, question sounds for the "؟", rising glass notes for the reading order 1→2→3→4, confirmations for ✓, a soft error for ✗, and maximize/minimize for the cutaways. No whooshes.

```bash
BUILD_ROOT=/tmp/reels_build reels/saber7/render.sh          # both looks
BUILD_ROOT=/tmp/reels_build reels/saber7/render.sh cine     # graded only
```
Source files go in `raw/s7/` (not in git): `saber7.mp4` and `music/liosound_This-Funk-Groove/…_main.wav`.
