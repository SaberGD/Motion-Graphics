# Motion-Graphics: Reel montage pipeline

`output/montaj1_reel.mp4` is the finished 1080×1920 reel (30 fps, −14 LUFS).

## Pipeline (`project/`)
| Step | File | What it does |
|---|---|---|
| 1 | `words.json` | Arabic transcript with word timings (faster-whisper large-v3) |
| 2 | `face.json` | Per-frame face track used for smart reframing |
| 3 | `base.py` | Reframe 4K → 1080×1920 following the face, per-shot zoom plan + punch-ins, zoom-blur transitions, colour grade |
| 4 | `overlay.html` + `render_overlay.js` | Motion graphics / captions / infographics, rendered to a transparent PNG sequence with Playwright |
| 5 | `sfx.py` | Synthesised SFX (whooshes, pops, ticks, typing) synced to the graphics |
| 6 | `assemble.sh` | Composite + voice cleanup (HPF, denoise, EQ, compression) + loudness normalisation |

All graphics respect the Instagram Reels safe area (top ~290px, bottom ~310px, sides ~150–170px kept clear; captions in the 67–76% band).

```bash
python3 project/base.py raw/montaj1.mp4 /tmp/base.mp4 project/face.json
node project/render_overlay.js /tmp/ov
python3 project/sfx.py /tmp/sfx.wav
project/assemble.sh raw/montaj1.mp4 /tmp/base.mp4 /tmp/ov /tmp/sfx.wav output/montaj1_reel.mp4
```
