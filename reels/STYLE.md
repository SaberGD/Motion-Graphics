# Saber Group × Mushroom: Reel Style Guide

How these reels look and move. It combines three references:
1. **"VibeDocX" product film (Hlib Trazanov)**: the motion language. Dark stage, one neon accent with soft glow, kinetic typography, glass UI elements, light-sweep transitions, a CTA end card.
2. **SaberGroup_Reel_v6 (earlier AI edit)**: the reel format. Talking head in the dark office, 2–3-word bold captions with one orange keyword, chips and pills on top, a dual-logo outro with a comment CTA.
3. **Brand assets**: the Saber Group wordmark and UI tokens (`training-sys` repo), the Mushroom 3D logo, and the track *Top Flow – The Funky*.

The aim is the reel format of (2), animated with the polish of (1), in Saber's ember palette instead of VibeDocX green.

---

## 1. Palette (from `training-sys/index.css` + Mushroom logo)
| Token | Hex | Use |
|---|---|---|
| `--bg` | `#070707` | kinetic-scene background, glass fill base |
| `--org` | `#FF8A1F` | **the one accent**: keywords, glows, cursor, progress bar |
| `--red` | `#D83B25` | gradients with orange, REC dot, title chips |
| `--red2` | `#8F2017` | deep ember light blobs |
| `--cream` | `#F6F3F2` | body text on dark (matches Mushroom letterforms) |
| `--amber` | `#FFC36B` | sparkle highlights, glitch chroma |

The rule taken from the VibeDocX film is one accent colour. Everything is white or cream on near-black, and only the keyword glows orange. No green, no blue graphics; the blue in the footage comes from the room light.

## 2. Type
- **Captions:** Cairo 900, 76 px, white, soft drop shadow. Latin words (AI, Prompt, Brand) use Poppins SemiBold at 0.86 em so they sit on the Arabic baseline.
- **Kinetic scenes:** Alexandria 800 (geometric Arabic, pairs with Poppins, the font of the VibeDocX film), 110–170 px.
- **Numbers/stats:** Bebas Neue (the Saber wordmark face).
- **UI (prompt bar, chips):** Poppins / Cairo 700–800.

## 3. Layout (Instagram Reels safe area)
- Saber wordmark top-left (y 118, w 250), 0.92 opacity. Hidden during kinetic scenes and the outro.
- Orange progress bar, 7 px, across the top edge (from the AI reel).
- Captions centred at **y ≈ 1190–1290** (62–67 %), over the torso, clear of the bottom 310 px UI.
- Top graphics (chips, toasts, cards) from **y ≈ 300**, sides ≥ 90 px.

## 4. Motion language
| Technique | From | Where we use it |
|---|---|---|
| Blur-in + scale-down word reveal (150 → 100 %, 22 px blur → 0) | VibeDocX "Turn / this" | every kinetic line, captions in a lighter version |
| Typewriter with blinking accent cursor | VibeDocX prompt bar | prompt bar, "and……" beats |
| Glitch / chroma-split reveal | VibeDocX "this" pixel reveal | the punchline word of a scene |
| Letter/word scatter → settle | VibeDocX "unstructured" | "chaos → order" ideas |
| Dotted underline drawing in | VibeDocX "manual work" | under a key phrase |
| Glass prompt bar + glowing send orb + sparkles | VibeDocX | any "you ask AI…" moment |
| Floating 3D-tilted glowing card | VibeDocX document shots | lists, file/roadmap hand-off |
| Light-sweep flare + flash | VibeDocX transitions | entering and leaving kinetic scenes, section changes |
| Iris reveal from the speaker into a scene | AI reel / v1 reel | big statements |
| Chips with numbered or check icons, staggered back-ease pop | AI reel | enumerations (لون, خط, حجم…) |
| Viewfinder REC frame | AI reel | "point of view", "look at this" moments |
| Dual-logo lockup over the blurred last frame, CTA + pill | AI reel | every outro |

**Easing:** ease-out cubic for entrances, back-ease (overshoot ~1.9) for pops, ease-in-out for camera moves. Entrances take 0.25–0.45 s and exits 0.18–0.25 s. Nothing pops in on a hard cut except slams on the beat.

**Pace:** a new visual event roughly every **1.4 s** (= one 4-beat phrase of the track). The camera never sits still: slow 4–5 % pushes inside each shot, punch-ins on keywords, and wide/medium alternation to hide jump cuts.

## 5. Camera / edit
- Remove dead air and fumbles with jump cuts. Every jump cut changes framing (wide ↔ medium) or lands on a punch-in.
- Face-following reframe, face at 30 % from the top when tight.
- Punch-ins: +10–14 % with a 0.12 s attack, landing on the stressed syllable or the beat.
- In-camera transitions: zoom-blur and whip at section changes, a white flash only with a beat drop.
- Light grade: gentle S-curve and vignette. The footage is already graded (blue/orange room), so keep it.

## 6. Music: *Top Flow – The Funky* (80 s, ≈172 BPM, 4-beat phrase ≈ 1.37 s)
| Track time | Section |
|---|---|
| 0.0 – 10.4 | intro: sparse, hat hits every phrase |
| **10.77** | first drop (crash) → groove to 20.4 |
| 20.5 – 21.5 | stop / break (bass out) |
| **21.85** | crash, groove to 31.3 |
| 31.4 – 32.4 | stop |
| **32.76** | crash, groove to 42.0 |
| 42.3 – 53.9 | breakdown: low energy, no bass |
| **54.59** | crash, groove to 63.8 |
| 64.1 – 65.2 | stop |
| **65.48** | final groove → ends 76.6 |

How it is used:
- The hook sits on the groove and the first crash lands on the first big reveal.
- The track's own stops line up with a punchline: the music drops out, the line lands dry, and the crash comes back.
- The breakdown (42–54) can sit under explanation-heavy middles.
- Music is ducked about 9 dB under the voice. The master is −14 LUFS / −1.2 dBTP.

## 7. Sound design
Everything is synthesised and automatically placed from the graphics spec:
- **whoosh:** scene in and out, sweeps, whips
- **pop / pop_lo:** chips, word pops
- **tick:** typing
- **click + shimmer:** prompt "send"
- **impact:** slams and the outro logo
- **riser:** into the outro
- **glitch:** glitch reveal
- **shutter:** viewfinder

SFX sit 15–20 dB under the voice. They should be felt, not heard.

## 8. Outro (every reel, about 3 s)
The last frame blurs and darkens behind a Saber | Mushroom lockup. The CTA line is in Cairo 900 and the pill has an orange glow (e.g. "الملف في أول كومنت ⬇").

## 9. Do / Don't
- ✅ One accent colour, lots of black, glow instead of hard outlines.
- ✅ Captions always readable: never over a busy graphic, and hidden during kinetic scenes.
- ❌ No emoji stickers, no stock B-roll, no more than two graphic layers at once.
- ❌ No text inside the bottom 310 px or the right-hand Reels button column.
