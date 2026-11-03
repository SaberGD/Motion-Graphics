# References

## Reference videos

| What | Where |
|---|---|
| **SaberGroup_Reel_v6_WithMusic**: the original look (captions, chips, REC frame, PDF card, dual-logo outro) | Drive: https://drive.google.com/file/d/1z08NkxIWK0Tm3QBD_aJ8w5FDhXlJ8bC7/view |
| **saber7, "الـ Visual Hierarchy"**: the reference implementation of this system, both looks | `reels/saber7/out/saber7_original_colors.mp4`, `reels/saber7/out/saber7_graded.mp4` |
| saber7 raw footage | Drive: https://drive.google.com/file/d/1wAe1TMuZoV4Uf4yvUQbGJDPVt5s9a1qT/view → `raw/s7/saber7.mp4` |
| Music bed used on saber7: *This Funk Groove* (liosound), main mix, ~153 BPM | Drive (zip): https://drive.google.com/file/d/18MfwoLD2QVfvqrbyqcY7qFqmX_aBGCDZ/view → `raw/s7/music/…` |
| Asset pack (logos source, light leaks, 3D objects for r3/r4/r5/s2) | Drive: `saber_assets.zip` in the same folder |

## Brand kit

`brand-kit/` holds the client's **Saber Group Claude Motion Kit v1** (2026-11-03): identity rules, the real logos, the MARO mascot poses,
fonts, grid/corner patterns, style frames (`brand-kit/references/*.png`) and a silent 25fps motion reference (`motion-reference-8s.mp4`).

## Sheets in this folder

| File | Shows |
|---|---|
| `v6_reference_sheet.jpg` | frames from v6 with the name of each element |
| `saber7_elements_sheet.jpg` | every element of the motion system as it appears in saber7 (chips, admock cutaway, kin, order 1-4, pie, REC, real PDF cover, outro, captions) |
| `saber7_original_vs_graded.jpg` | the same moments in both looks |
| `saber7_thumbnails.jpg` | the two cover variants |

## Client feedback history (what changed and why)

1. v1 draft. A redrawn fake "academy" logo (`alternate-saber-logo-academy.svg`) was rejected ("مش بتاعنا"), so the reels use the **Marketing Agency** mark. The real Academy logos are in `brand-kit/`.
2. v2:
   * light leaks were too strong, so they are now lighter
   * music had to come from the track's start and stay low, not edited from the middle
   * synth SFX were "bad", so they were replaced with recorded UI sounds, one per motion
   * the voice was muffled, so it got an EQ chain
   * the motion scene now holds until the speaker talks again
   * overall quality was raised
   * delivery is now two looks
3. v3: a cut clipped the end of "Perfect", so cuts now sit after the word's unvoiced tail.
4. v4: "raise the music a bit or let it follow my voice, but keep my voice clearer", so the music got a gentle duck plus an EQ pocket.
5. v5: caption "عين" not "عيني". v6: the real PDF cover instead of a blank booklet.
