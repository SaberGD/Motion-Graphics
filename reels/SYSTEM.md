# Saber Group × Mushroom: Reel Motion System

This is the standard way talking-head reels are edited for **Saber Group**. It was built on *SaberGroup_Reel_v6* and refined on
`reels/saber7/` ("الـ Visual Hierarchy"), the **reference implementation**: when in doubt, do what saber7 does.
`reels/STYLE.md` is the original design brief (palette, type, motion vocabulary). Where they differ, this file wins: it records
what the client asked for after seeing the drafts.

---

## 0. القواعد الذهبية (ملاحظات العميل، لازم تتنفذ في كل فيديو)

1. **حافظ على الـ Frame Rate** بتاع الفيديو الأصلي (30fps) والمقاس 1080×1920.
2. **الموشن مُعتدل** — بلاش over. zoom in / out هادي، punch-ins خفيفة، مفيش أكتر من طبقتين جرافيك في نفس الوقت.
3. **ممنوع ترانزيشنز يمين وشمال (whip / slide)** و**ممنوع أصوات الووش والـ risers**.
4. **السكتات تتقص** بـ jump cut عليه ترانزيشن لطيف أو زووم، **لكن عمرك ما تقص جوه كلمة**:
   بعد آخر حرف (حتى الـ "ت" / "س" المهموسة) سيب ~100ms، وقبل الكلمة اللي بعدها ~40ms. (اتعلمناها من كلمة "Perfect").
5. **صوت المتكلم هو الأهم ولازم يبقى واضح**. صوت الميك بتاع صابر مكتوم → سلسلة EQ ثابتة (§4).
6. **المزيكا**: التراك **من أوله** لحد ما الفيديو يخلص (متجيبش حتة من النص). مستواها واطي، أعلى شوية من "مستخبية"،
   **ماشية مع الصوت** (بتوطى 4 dB بس وهو بيتكلم، بنعومة 0.6s) ومعمولها **EQ pocket** عند 1.5/3 kHz عشان الكلام يفضل أوضح.
7. **المؤثرات الصوتية**: صوت مُعبّر لكل حركة موجودة فعلاً على الشاشة (مكتبة UI حقيقية، §4)، بمستوى واطي. مش synth.
8. **الكابشنز**: جُمل مفهومة (chunks يدوي)، كلمة واحدة برتقاني في كل جملة، وتتصحح يدوي (Whisper بيغلط في العامية).
9. **اللوجو**: لوجو **SABER GROUP Marketing Agency** الأبيض في الركن، والمربع الأحمر + Mushroom في الـ outro.
   **ممنوع لوجو "أكاديمية تدريب" البديل** (`alternate-saber-logo-academy.svg`) — العميل رفضه.
10. **الـ light leaks خفيفة** (amt .3) وعلى الترانزيشنز الحقيقية بس.
11. **مشاهد الموشن full-screen** تفضل لحد ما المتكلم يرجع يتكلم، والسكتة اللي تحتها تتقص، وبعدين تختفي بـ fade + blur (مش دايرة بتقص الكلام).
12. **ابعت screenshots قبل الريندر** النهائي عشان العميل يعلّق، وبعدين اريندر **نسختين**: ألوان أصلية + متعدلة.
13. لو في ملف حقيقي هيتذكر (PDF / غلاف) استخدم **الحقيقي** مش placeholder.

---

## 1. Folder layout

```
reels/
  SYSTEM.md            ← this file (rules, numbers, workflow)
  STYLE.md             ← original series brief (palette, type, motion vocabulary)
  engine/              ← base.py (edit/camera/grade) · stage.html (graphics) · render.js · audio.py · prep.py · timeline.py
  tools/               ← transcribe.py · facetrack.py · beats.py · cuts.py · stills.py · silences.py · matte.py
  library/sfx/         ← Kenney Interface Sounds (CC0) + library/sfx_map.json (sound for each motion role, with levels)
  library/fx/          ← light leaks (leak1-3.jpg), dust
  brand/               ← saber_white.png (corner), saber_red.png + mushroom.png (outro)
  _template/           ← build_spec.py, SCRIPT.md, thumbnail/ (copied by new_reel.sh)
  references/          ← reference sheets + links to the reference videos
  new_reel.sh          ← scaffold + analysis for a new video
  render.sh            ← renders both looks
  preview.sh           ← contact sheet of chosen output times (screenshots for the client)
  saber7/              ← reference implementation (Visual Hierarchy)
raw/<name>/            ← footage + music (NOT in git; download from Drive)
```

## 2. Output specs

| Item | Value |
|---|---|
| Frame | 1080×1920, **source fps (30)**, H.264 crf 15 `-tune film`, AAC 320k 48 kHz |
| Looks | `<name>_original_colors.mp4` (grade `none`) and `<name>_graded.mp4` (grade `cine`) |
| Loudness | −14 LUFS integrated, ≤ −1 dBTP |
| Safe area | Reels UI: keep text out of the bottom ~310 px and the right button column. Corner logo at top 96, left 60, width 118. Captions at y≈1190 (`#cap`). Top graphics from y≈260 at the sides (the face is near y≈500 at zoom 1.0) |
| Profile grid | Covers keep text inside the 3:4 centre crop (y 240–1680) |

## 3. Look

* **Palette**: `#FF8A1F` (the one accent), `#D83B25`, `#F6F3F2`, near-black `#070707`. Glow instead of outlines. No green or blue graphics.
* **Captions**: Cairo 900, 76 px, white, one orange keyword per chunk; Latin words in Poppins SemiBold. Words rise in with a light blur.
* **Graded look (`cine`)**: soft face-follow light (+17%), gentle S-curve, cool highlights / neutral shadows, saturation 1.12 with skin protected, vignette .55.
  Parameters live in `spec.cine`.
* **Grain** .07 over everything (kills banding on the dark ember gradients).

## 4. Sound

| Layer | Setting |
|---|---|
| Voice | `highpass 85 · afftdn nr10 · EQ 180 −4 / 380 −2 / 1.8k +4 / 3.4k +9 / 5.5k +7 · highshelf 7.5k +6 · deesser · comp 2.4:1` (the camera mic is dull: 2–4 kHz sits ~22 dB under 500–1k; re-measure on a new mic with the spectrum check in §7) |
| Music | from 0:00, `gain −23.5`, `duck −4` with `duck_smooth .6`, EQ pocket `1.5k −3.5 / 3k −4.5`, `end_fade 1.2`. Result on saber7: voice ≈ 11 dB over the music overall and ≈ 18.5 dB in the 1–4 kHz speech band |
| SFX | `library/sfx_map.json` roles (peak dBFS −25…−33). One sound per visible motion: `item_pop*` objects appearing · `check`/`bad` ✓/✗ · `question` "؟" · `order1-4` rising glass notes for 1→2→3→4 · `cutaway_in/out` · `reveal` + `sparkle` for a title · `hero` · `rec` · `doc_open/land` · `outro`. All synth types are off (`sfx_off`) |

## 5. Motion vocabulary (stage.html element `type`s)

| type | Use | Notes |
|---|---|---|
| `chips` | short lists, ✓ / ✗ verdicts | `items[{text, icon:'x', cls:'bad'}]`, `at[]` on the spoken word, top-right (`y 262, x 70`) |
| `admock` | **full-screen cutaway** that explains with a mock-up (saber7: restaurant ad) | `items` with layout `A` → `B` (`morph`), `pulse`, wandering `eye`, `q` marks, reading-order `nums`. Captions stay on top. The footage pushes in/out under it |
| `kin` | full-screen motion title for the key term | `iris` entry, soft fade+blur exit. **Hold it until the speaker talks again**, and cut the pause under it |
| `pie` | "the biggest piece goes to …" | donut card at the right side, `hero` slice pops out on the word |
| `vf` | REC viewfinder for "look / eye / camera" moments | |
| `book` | the file in the CTA | `cover=` the **real** PDF cover (`ratio` = h/w); `pill 'PDF · ملف'` |
| `stat`, `card`, `toast`, `prompt`, `bars`, `demo` | numbers, info cards, prompts, comparisons | from the v2 engine, see `reels/STYLE.md` |
| `leak` | light leak on a real transition | `amt .3` |
| `outro` | Saber red + Mushroom lockup over the blurred last frame + CTA | ~3.4 s, starts on a beat |

**Camera**: slow pushes inside a shot, never past ×1.14 on 1080p sources. Steps in zoom only on a cut or behind an opaque graphic.
Use `zoomblur` (d .18) on cuts and light punch-ins (.03–.05) on stressed words and the music drop.
**Timing**: speech-bound graphics land on the word (`o(word.s)`). Free events (cutaway/kin/card entries, leaks, end card) go through `snap()`
onto the beat. Look for a phrase/section change of the track (`beats.json`) near the key reveal.

## 6. Thumbnails

`tools/stills.py <reel> sheet` gives the sharpest frames. Pick 6–8 expressive poses, then `tools/stills.py <reel> 63,234,…`
exports each as `_original` and `_graded` PNG. `_template/thumbnail/thumb.html` has two variants: a headline on the strongest
pose (the hook) and a question variant. Render them with `node reels/<name>/thumbnail/render_thumb.js`.

## 7. Workflow (new video)

1. Put the footage and music in `raw/<name>/` (from Drive), then run `reels/new_reel.sh <name> raw/<name>/video.mp4 raw/<name>/music.wav`.
   It writes `words.json`, `face.json`, `beats.json`, `cuts.txt`, `analysis.md` and a first `build_spec.py`.
2. Watch the reference (§8) and read `analysis.md`. Fix the transcript (`cap.fix`) and write the caption chunks (`cap.starts`) and highlights (`cap.hl`).
   Re-run Whisper on unclear stretches with a context prompt: it hallucinates at the end ("سلام") and misreads words.
3. **Cuts**: start from `cuts.txt`, then verify every cut with the per-10 ms energy and centroid around it (see `tools/cuts.py`).
   Never cut inside a word. Remove a broken first frame if there is one (saber7 starts at 0.10).
4. Plan the graphics per sentence (what is said → what is shown), then SFX per motion and camera moves. Keep the face clear.
5. `reels/preview.sh reels/<name> t1,t2,…` → **send screenshots to the client before rendering**.
6. `reels/render.sh reels/<name>` → both looks. QC:
   * fps and size
   * −14 LUFS
   * voice vs music while talking
   * Whisper on the first seconds of the output (no clipped words)
   * frames at every transition
7. Write `SCRIPT.md` (the corrected script and a timeline). Make the thumbnails. Commit and push.
8. Caption, graphics or mix changes: `FRAMES_ONLY=1 reels/render.sh reels/<name>` reuses the base plates.

## 8. References

See `reels/references/README.md` for the reference videos (Drive links), the music, and sheets showing each element.
