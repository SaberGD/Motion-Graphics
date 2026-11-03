# SG EDIT: Saber Group montage style (talking-head reels)

**SG EDIT** is the montage style: Saber on camera, with cuts, captions and graphics over the footage. Its sibling **SG MOTION** is the
designed-motion style without footage (Academy / MARO ads, promos); its rules live in `brand-kit/` (see §9).
This file is the standard way talking-head reels are edited for **Saber Group**. It was built on *SaberGroup_Reel_v6* and refined on
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
9. **اللوجو**: لوجو **SABER GROUP Marketing Agency** الأبيض في الركن، والمربع الأحمر **لوحده** في الـ outro.
   **Mushroom شريك مؤقت**: لوجو Mushroom يتحط جنب صابر جروب بس لما العميل يقول إن الفيديو دا مع Mushroom (هيبلغ قبلها).
   **ممنوع لوجو "أكاديمية تدريب" المزيف** (`alternate-saber-logo-academy.svg`، معاد رسمه بخط عادي) — العميل رفضه.
   اللوجوهات الحقيقية (SABERGROUPEG +AI العريض، ومربع COURSES ACADEMY +AI) في `brand-kit/assets/logos/` وتتحط زي ما هي من غير إعادة رسم أو تلوين أو قلب.
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
| `outro` | Saber red logo (alone by default) over the blurred last frame + CTA. `logos=[[saber_red,360]]`; partner lockup `[[saber_red,300],[mushroom,380]]` only when the client asks for Mushroom | ~3.4 s, starts on a beat |

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

## 9. SG MOTION (`brand-kit/`) vs SG EDIT

The client's **Saber Group Claude Motion Kit v1** (2026-11-03) sits unchanged in `brand-kit/`. Read `brand-kit/README.md` first, then `01-MASTER-INSTRUCTIONS.txt`.

**Which rules apply:**
- **Talking-head reels** follow this file. Its rules come from client feedback on real drafts, so they win where the two differ.
- **Designed motion pieces** follow the kit: Academy/MARO ads, promos, end cards, landscape/square, anything without footage.
- **Both** follow the kit's hard gates:
  - logos and MARO are locked assets (no redraw, recolour, mirror or deform)
  - facts come from the brief only (no invented prices, offers, dates, phone numbers, claims)
  - audio is licensed or supplied
  - Arabic is connected and RTL, with English/URLs isolated LTR
  - the end card stays readable for at least 2 s
  - the pre-flight checklist (`brand-kit/06-PRE-FLIGHT-CHECKLIST.md`) is run before delivery

| Topic | SG MOTION (kit, designed pieces) | SG EDIT (this file, reels) | Why SG EDIT differs |
|---|---|---|---|
| fps | 25 | **source fps (30)** | client: "حافظ على الـ Frame Rate" |
| Primary logo | SABERGROUPEG +AI wordmark (Academy mode); academy square is extra | Marketing Agency mark (white, corner) + red agency logo outro (+ Mushroom only when asked) | Saber Group agency reels. Use the kit's Academy/MARO marks when a reel is *for* the Academy or MARO |
| Red | `#C4321F` (Maro), deep `#7A1B12`, bg `#0A0A0A` | `#D83B25` / `#070707` (training variant, from v6) | keep one palette per film: never mix the two |
| Atmosphere | quiet grid, faint burgundy wash; **no** blobs/bokeh/heavy glow | ember light blobs in cutaways, orange glow on chips and keywords | v6 look the client approved. Keep glow restrained, no bokeh |
| Motion | `cubic-bezier(.16,1,.3,1)`, 480 ms in / 320 ms out, 12–24 px moves, no bounce, camera ≤1.02× | ease-out + light back-ease pops, zoom-blur on cuts, camera ≤1.14× on footage | footage needs reframing and cut-hiding. Still "moderate" per the client |
| Type | Cairo 700 headlines 56–72 px, ≤2 lines, 3–7 words | captions Cairo 900 76 px, kinetic titles bigger | captions must read on a phone over footage |
| Safe area (portrait) | x 86–994, y 192–1574 | captions at y≈1190, nothing in the bottom ~310 px or the right button column | both are conservative. Keep faces, logos and CTA inside the kit box too |
| MARO | flat PNGs, ≤6 px idle drift, never mirrored | (v6 used a robot cutaway): for AI topics use the real MARO PNGs from the kit, same rules | — |

When starting any piece, **say which style it is** (SG EDIT or SG MOTION) and which identity it carries: Saber Group agency, Academy or MARO, and with or without Mushroom. If the brief doesn't settle it, ask.

## 10. Saber's cloned voice (ElevenLabs)

| Item | Value |
|---|---|
| Voice | **Mohamed Saber**, `voice_id h1dykroatZMMS5JzRfwx`. A professional voice clone, verified for Egyptian Arabic on the `eleven_v4` models |
| Account | the client's own ElevenLabs account (Creator tier). The key is **never** stored in the repo: it comes from the env var `ELEVENLABS_API_KEY` (an environment secret) |
| Tool | `python3 reels/tools/tts.py "<approved text>" out.wav --preset pickup\|vo\|energetic` → 48 kHz mono WAV |
| Guide | `reels/library/voice/ElevenLabs_Arabic_Voice_Guide.md` (+ `.pdf`, the client's guide) and the `.pls` templates |
| Lexicon | `reels/library/voice/saber_lexicon.pls`: how Saber says brand and English terms (Designers → ديزاينرز, Perfect → بيرفِكت, Visual Hierarchy → فيچوال هايراركي, ElevenLabs, MARO, AI, PDF …). `tts.py` applies it locally, so nothing is uploaded. Add new terms here |

**Settings** (from the guide, tuned on Saber's voice):

| Preset | stability | similarity | style | speed | Use |
|---|---|---|---|---|---|
| `pickup` | .50 | .85 | .10 | 1.10 | SG EDIT word/phrase patches: conversational, close to his on-camera delivery |
| `vo` | .65 | .85 | .10 | .97 | SG MOTION / explainer voiceover: steadier narration |
| `energetic` | .42 | .85 | .20 | 1.03 | hooks and promos. Style never goes above .20: higher adds artefacts |

**How to write the text:**
- Use `eleven_v4`. It supports audio tags `[...]`, inline IPA `"/…/"` and alias/phoneme dictionaries, but **no SSML `<break>`**.
- Pause with `،`, `—`, `…` or `[pause]`.
- Write it as Saber says it, in Egyptian Arabic.
- Add tashkeel only on ambiguous words (e.g. `دَه`).
- Numbers, dates, currency and URLs are written as words.
- Glue the article to an Arabic-spelled loanword (`الديزاينرز`, not `الـ ديزاينرز`): `tts.py` does this.
- Audio tags in English, sparingly: `[thoughtful]`, `[excited]`, `[softly]`, `[slowly]`, `[pause]`.

**Measured on saber7** (hook line, his own approved words):
- Whisper transcribed the clone's hook word for word.
- `speed` has little effect on `eleven_v4`: the clone runs ~20% slower than Saber's real 4.9 s. To fit a pickup into the original timing, time-stretch afterwards (`atempo` ≤ 1.15), or cut the pauses.
- Short Egyptian words such as `دَه` can be misheard by Whisper. Judge those by ear.

**Lessons from the White Friday VO** (`motion/white-friday-festival/`):
- For a full script, generate **one take** of the whole text so the tone stays consistent.
- To fix a line, regenerate **only that line** with the same settings, plus tashkeel on the misheard word, and splice it into a pause: 100 ms after the last loud frame, with a natural 0.3–0.45 s gap.
- Lower stability (`energetic`) adds energy but costs pronunciation (مسابقة → مسادقة, البوست → الكوست). For long scripts use `pickup` at stability **.55**.
- QC: run Whisper with a short context prompt and diff the words against the script. Ignore spelling variants such as معانا/معنا, then check the real differences by ear.

**When to use it:**
- **SG EDIT:** patch a word that was flubbed, clipped or missing (a "pickup") instead of reshooting. Match the timing to the original, put it through the same `voice_af` chain only if it sounds brighter than the room recording, and crossfade 10–20 ms inside the cut.
- **SG MOTION:** voiceover for designed pieces when the client asks for his voice.

**Rules:**
- Only the client's own voice, and only for text he approved word by word. Never put claims, prices or offers in his mouth that the brief did not approve.
- Show the exact text before generating. List every synthetic line in the delivery notes / `SCRIPT.md`.
- Check every line with Whisper and by ear, then regenerate (a different `--seed`, or a spelling fix) if a word comes out wrong.
- Never clone or synthesise anyone else's voice.
