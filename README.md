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
