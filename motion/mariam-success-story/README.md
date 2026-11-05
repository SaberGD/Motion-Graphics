# Mariam: success story (SG MOTION, Reel 9:16, 30 s): three directions

**Shared across all three:**
- **VO:** `vo/mariam_vo_fatima_narrator.flac`, the client's final text, 27.4 s, in the ElevenLabs library voice "Fatima – Narrator".
- **Word times:** `story.js`, from Whisper word times.
- **Mix:** `build_mix.py` → `mix.json`. Music from the track's start, ducked under the VO, with an EQ pocket. One soft UI SFX per story beat, no whooshes.
- **Kit:** 25 fps, kit easing and timings, Cairo / Bebas, kit palette, safe box 86–994 × 192–1574. The wordmark is placed as-is (on a charcoal plate on light frames). End card holds ≥ 5 s.

**Her work and screens** (`assets/`, cropped from the client's screenshots):
- the 3 high-res posters, plus the citrus and ice designs from the album screenshot
- the three July Photoshop exercises (now only used in B)
- her lipstick design, the instructors' real feedback (Yasmin Ashour, Sami Mousa) and the follow-up thread
- her own photos: a selfie on the intro, the bright photo on «دي قصة نجاح»
- her real first message, 16 July (the other person's reaction avatar is blurred)
- the October feedback message

Every Rasasi design is labelled **«مشروع تدريبي · Rasasi»**, because Rasasi is not a client.

| Option | File | Direction |
|---|---|---|
| **A · Chat Story** | `opt_a.html` → `out/mariam_story_option_a.mp4` | Light and UI-led: the story happens inside the chat. A kit bubble with her words turns into the real screenshot. The chat scrolls through the July exercises to «20 أكتوبر». Her poster arrives as an image message and opens up. Then the campaign album (each design's message is spotlit), the process cards (exercise / feedback / 7 days), the gift, a post with a comment box and the reply, and the end card |
| **B · Dark Timeline** | `opt_b.html` → `out/mariam_story_option_b.mp4` | Cinematic charcoal, with a July → October timeline under everything; the playhead runs on «بعد تلات شهور بس». The quote sits under a red quote mark, then the real message, then the July exercises (greyed) slide away. The poster drops in with its own teal light, and the campaign fans out, each poster coming forward on its word. Then a July ⟷ October split, the process chips, rays and a gift, the comment CTA and the end card. Keywords get a red block |
| **C · Full-bleed Kinetic** | `opt_c.html` → `out/mariam_story_option_c.mp4` | Poster-led and punchy. July is grey: huge kinetic words, the desaturated exercises scrolling behind, an outlined month word rolling يوليو → أكتوبر on the VO. Hard cut to the poster in full colour, filling the frame over its own blurred light. Then the campaign as a flip-book on the VO words, process slams, the reward, big CTA type with the comment bar, and the end card |

- Render all three with `./render_options.sh [a b c]`.
- Make style frames with `./frames.sh <a|b|c> 1.5,8.6,…`.
- Consent: Mariam approved showing her name, her message and her work (client confirmation, 2026-11-04).
- The voice is a stock library voice, not Mariam's own.

**v2 (client feedback)**
- **C:** the July background (the exercise screens) is gone. The opening and the month roll sit on the kit colours (charcoal, grid, red wash), and her photo and name open the piece. On «ده تمرين / وفيدباك / ومتابعة يومية» the screens are now her lipstick design, Yasmin's real feedback and the follow-up thread. «دي قصة نجاح» shows her photo.
- **A:** her photo sits on top of her first message. The chat scroll now goes through her design, the feedback and the follow-up, with no moon or simple exercises. The process cards use the same screens, and «دي قصة نجاح» shows her photo.

**v3 (client feedback)**
- **New VO line** after «دي قصة نجاح تستحق مكافأة!»: «مريم ليها Free access على كورس الـ Mastery Level… المستوى المتقدم لمصممين الجرافيكس… مبروك يا مريم!». It is spliced into the same take (same voice), with lexicon aliases for Free access and Mastery Level.
  - The piece is now 36.4 s.
  - `story.js` keeps the original phrase times; `MO.map(t)` freezes the timeline at T0 for D seconds, and the reward scene (`MO.reward`) runs on real time: «مريم ليها», a FREE ACCESS · MASTERY LEVEL ticket, «مبروك يا مريم!» and confetti.
- **CTA (all three):** a Facebook post (`MO.fbPost`, light or dark). It shows the academy's Mastery Graphic Level post (text line and poster panel) and never the student's photo. A viewer types «عايز أبدأ قصة نجاحي!» on «سيب كومنت», and the academy replies «هنتواصل معاك». The chrome wordmark hides while the post header shows it, so the logo never appears twice.
- **A:** the chat scroll and the process cards no longer repeat the same screens, the cards are aligned, and the website link sits bottom-left.
- **B / C (dark):**
  - Key-word blocks now travel with their word, so no red blocks are left behind.
  - Dates appear once each: in C the month word shows only on «بعد تلات شهور بس»; in B the «16 يوليو» and split date chips are gone and the timeline leaves before the split.
  - C's quote and the real message no longer overlap, and the captions sit clear of the bottom chrome.
  - B uses the feedback screens, her design and her photo instead of the exercises.
