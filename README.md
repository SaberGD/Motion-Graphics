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

Same Saber Group × Mushroom style as *SaberGroup_Reel_v6* (`reels/STYLE.md`), built on the reel engine (`reels/engine/`). The source is 1080×1920 at 30 fps, and the output keeps 1080×1920 at 30 fps.

| File | Role |
|---|---|
| `build_spec.py` | writes `spec.json`. Every time is written in **source** seconds, taken from `words.json`, and mapped through the jump cuts |
| `words.json` / `face.json` | Whisper large-v3 word timings (with the dropped "ودي"/"والـ" re-timed) and the YuNet face track |
| `brand/` | white Saber Group mark for the corner (cut out of the agency logo), the red agency logo and the Mushroom logo for the outro |
| `assets/` | burger, hierarchy icon, booklet and light leaks from the asset pack |

**Edit:** the dead air at 2.9–3.38, 18.24–18.5 and 35.2–35.82 s plus the tail is cut, which gives 40.5 s of speech and a 3.4 s end card. Each cut is hidden by a zoom-blur, a cutaway or a light leak. There are no left/right whips.

**Music:** *This Funk Groove* (liosound), main mix, at about 153 BPM (one bar is 1.565 s). It runs from 6.53 s so the build bar sits under the hook and the groove drops on "التصميم Perfect". It then jumps on a downbeat to the stop bar at 64.72, which goes quiet under "مهمة قوي اسمها الـ", and the lift at 66.28 lands on **Visual Hierarchy**. The last segment uses the track's own ending under the end card. The music sits at −19 dB and is ducked 10 dB more under the voice.

**SFX:** soft sounds only: pops, ticks, rising chimes for the reading order 1→2→3→4, a bell for info, a soft "nope" for ✗, a tonal bloom on transitions and a page sound for the PDF. Whooshes and risers are switched off.

```bash
python3 reels/saber7/build_spec.py
BUILD_ROOT=/tmp/reels_build reels/make.sh reels/saber7      # → reels/saber7/out/saber7.mp4
```
Source files go in `raw/s7/` (not in git): `saber7.mp4` and `music/liosound_This-Funk-Groove/…_main.wav`.
