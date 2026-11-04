# Mariam success story: VO voice test (Egyptian female voices)

- Text: `spoken.txt`, the client-approved script.
  - Tashkeel on مَعَنْدِيش / دَه / شُغْلها / طِبّ.
  - Tags: `[softly]` on Mariam's quote, `[thoughtful]` on «طيب…», `[excited]` on the reveal and the CTA.
  - Lexicon: campaign → كامبين (new), Saber Group Academy → صابر جروب أكاديمي.
- Model: eleven_v4. Settings, per the guide, for conversational storytelling: stability .45, similarity .80, style .15, speed 1.05, seed 7.
- Post:
  1. Pauses longer than 0.32 s are shortened to 0.32 s, cut ≥ 100 ms after the last loud frame (`tighten.py` logic).
  2. A light atempo where needed (≤ 1.08).
  3. highpass 80 Hz → compressor 2:1 → loudnorm −16 LUFS.

| Sample | ElevenLabs library voice | Character | Length | Whisper QC |
|---|---|---|---|---|
| `samples/1_fatima_expressive.m4a` | Fatima – Expressive Egyptian (`I3u6waC588j43py1kDN2`) | young, warm, spontaneous | 29.9 s | 88.9 % |
| `samples/2_seham.m4a` | Seham – Egyptian Woman (`YwQu4f7UeJh7h0uWMnEn`) | advertisement, confident, energetic | 29.2 s | 88.9 % |
| `samples/3_fatima_narrator.m4a` | Fatima – Smooth Audiobook Narrator (`vWDp3PLsTWjIhBxxUKh9`) | smooth narration | 30.2 s (atempo 1.08) | 90.5 % |

- Dropped: Ghozlan – Soft Clear. Whisper heard «طاليب» and «شب لها».
- The QC diffs that remain are Egyptian readings, not errors: «ما عنديش», and «وأمر» for «وقمر» (ق read as a hamza).
- These are stock library voices, not Mariam's real voice. If the piece presents the quote as hers, label the voice as a performance, or record Mariam herself.

## Chosen take: voice 3 (Fatima – Narrator) on the client's final text (v3)
- `spoken.txt` is the client's final text, word for word.
  - It opens on «من معنديش خلفية… لديزاينر بتعمل شغل عالمي», then adds «دي قصة نجاح تستحق مكافأة!» and «متابعة يومية».
  - The only tag is `[excited]`, on the CTA.
- Take: seed 21, the best of 5 takes. Pauses shortened to 0.32 s. No atempo, highpass → comp 2:1 → −16 LUFS.
- Output: `mariam_vo_fatima_narrator.flac` / `.m4a`, 28.8 s.
- QC diffs: Whisper spellings only (ما عنديش / 3 / لها رسائل).
