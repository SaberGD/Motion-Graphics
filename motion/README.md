# SG MOTION: designed motion pieces

This is the second Saber Group style. Pieces have **no footage**: Academy / MARO announcements, promos and end cards. The rulebook is the client's
kit in `brand-kit/` (start at `brand-kit/README.md`). This folder is the toolchain that renders it.

```
motion/
  engine/kit.js       brand tokens, kit easing, the 12-principles motion primitives (pose, maskRise, settle …), builders, icons
  engine/render.js    renders a comp.html to JPEG frames at the piece's fps (deterministic in t, multi-worker)
  engine/mix.py       VO + music (from the track's start, gentle duck, EQ pocket) + recorded SFX → −14 LUFS
  render.sh           motion/render.sh motion/<piece>  → <piece>/out/<name>.mp4
  <piece>/            piece.json (name, fps, dur) · comp.html (scenes) · build_mix.py → mix.json · vo/ · analysis/ · SCRIPT.md
```

## Rules that apply here (from `brand-kit/01-MASTER-INSTRUCTIONS.txt`)
- **25 fps** with the kit curve `cubic-bezier(.16,1,.3,1)`.
  - Durations: entrance 12 frames (0.48 s), exit 8 frames (0.32 s), stagger 2 frames (0.08 s), logo reveal 20 frames (0.8 s).
  - The end card stays readable for at least 2 s (3 s preferred).
- **Palette:** `#0A0A0A` / `#151515` / `#C4321F` / `#7A1B12` / `#FF8A1F` (≤ 5 %) / `#F6F3F2`.
  - Grid: 72 px, at about 2.5 % on dark and 4.5 % on light.
  - Clipped corners 17 px, radius 7.
- **Type:** Cairo 700 / 500, Bebas Neue for short English labels, letter-spacing 0. Arabic animates as **whole words**, never letters.
- **Logo:** `brand-kit/assets/logos/saber-group-wordmark.png`, placed as an image. Only its container animates (mask reveal). On a light frame it sits on a **charcoal plate**.
- **Safe box:** x 86–994, y 192–1574.
- **Copy and claims:** on-screen copy comes from the approved script only. No invented prices, dates, offers, handles or testimonials. Mock-ups (posts, comments) use skeleton lines, not fake content.
- **Audio:** licensed or supplied only. The voice comes first: in White Friday it sits about 13 dB over the music while talking.

## The 12 principles in code (subtle, inside the kit's "restrained" limits)
| Principle | Where |
|---|---|
| 1 Squash & stretch | `pose({squash})` ≤ .04 when a card or chip lands. Never on text |
| 2 Anticipation | `pose({antic})`: a 0.14 s dip before big reveals (title, end card, post card). The dark scene leans back before the flip. The "تابعونا" button presses in before release |
| 3 Staging | one focal idea per scene; supporting lines in secondary grey |
| 4 Pose to pose | every element has keyed poses (at / out) on the spoken word |
| 5 Follow-through & overlap | `settle()` ≤ 2 % overshoot. Icons and ticks land 0.1–0.26 s after their card |
| 6 Slow in / slow out | the kit curve everywhere, ease-in on exits |
| 7 Arcs | cards enter on a slight curve (`arc`). The "+ نقاط" chip flies on an arc into the bank |
| 8 Secondary action | the calendar ring, rays, bell swing, blinking comment cursor, progress fills |
| 9 Timing | words land on their VO times. Scene changes land on the music's downbeats (beats.json) |
| 10 Exaggeration | only on hero moments (the title, the grand prize), and kept small |
| 11 Solid drawing | one light direction: every card uses the same soft drop shadow |
| 12 Appeal | clean Arabic type, a calm grid, one red accent |

## Variants
`piece.json` `"variants": ["text", "mix"]` renders `<name>_text.mp4` and `<name>_mix.mp4` from one `comp.html`, which reads `?v=`.
A variant ending in **`-land`** (e.g. `"mix-land"`) renders the same variant at **1920×1080**, with `?land=1` and `VIEWPORT=1920x1080`, to `<name with 9x16→16x9>_<v>.mp4`.
The kit says to recompose for each ratio and never to crop. So in `comp.html` every element group sits in its own 1080×1920 layer, and each layer gets one transform per ratio:
- text in the right column (RTL)
- illustrations in the left column
- the title and end-card lockups centred
- the bunting under the logo
The chrome moves to the landscape safe box (x 115–1805, y 86–994). See `white-friday-festival/comp.html` (`lay()` / `at()`).
- **text:** kinetic typography with light UI cards.
- **mix:** the same text plus illustrative motion graphics that act out each line.

The client wants text **centred** inside the safe box, not right-aligned.

## Lessons
- **Mask Arabic words vertically only.** Use `clip-path: inset(-.22em -.8em -.3em -.8em)` and rise them from 160 %. With `overflow:hidden`, the final ع / م tails are clipped and «الموضوع» reads «الموضو».
- Never place two text blocks or cards in the same area across overlapping time windows. Check style frames at every scene change.
