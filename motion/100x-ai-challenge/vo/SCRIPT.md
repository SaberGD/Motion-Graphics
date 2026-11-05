# 100X AI Challenge: VO (Saber's cloned voice)

- Source: the client's script PDF «تحدي 100X AI – ضاعف سرعتك» (Saber Group Academy). The spoken text, approved as-is, is in `spoken.txt`. Stage directions were removed, numbers are written as words, and `[excited]` is on the hook and the CTA.
- Voice: ElevenLabs "Mohamed Saber" (`h1dykroatZMMS5JzRfwx`), model eleven_v4. Settings: `pickup` preset with stability .55, seed 11. The lexicon was applied, e.g. 100X AI → «وان هاندرد إكس إيه آي».
- QC (`reels/tools/vo_qc.py`): 84.6 s, 93.4 % word match. The only diffs are Whisper spellings (ثلاث / سابر / 100x / الاي).
- Master: highpass 70 Hz → compressor 2:1 → loudnorm −16 LUFS / −1.5 dBTP. Output: `100x_ai_challenge_vo.flac` (master) and `.m4a` (preview).
- The whole file is synthetic (a cloned voice), so mention that in the delivery notes.
