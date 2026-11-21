# SABER GROUP: A Different Way to Grow (brand story VO, Saber's cloned voice)

- Source: the client's script PDF «A Different Way to Grow». The spoken text, approved as-is, is in `spoken.txt`.
- Voice: ElevenLabs "Mohamed Saber" (`h1dykroatZMMS5JzRfwx`), model eleven_v4. Settings: `vo` preset, seed 11.
- Two lines were regenerated with tashkeel, then spliced into the pauses before and after them (100 ms after the last loud frame, with 10 ms fades). The first take had said «إن يقدم» and «بندني».
  - «مَكَنْش هَدَفي إنّي أقَدِّم كورس أحسن وبس، لكن إنّي أَبْني منظومة …» (seed 11)
  - «إحنا بِنِبْني تجربة ومجتمع …» (seed 23)
- QC after the splice: 92.9 s, 91.9 % word match. The remaining diffs are Whisper spellings or MSA normalisations (2014 / ما كانش / نحن).
- Master: highpass 70 Hz → compressor 2:1 → loudnorm −16 LUFS / −1.5 dBTP. Output: `a_different_way_to_grow_vo.flac` and `.m4a`.
- The whole file is synthetic (a cloned voice), so mention that in the delivery notes.
