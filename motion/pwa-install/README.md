# «نزّل بوابة الطالب كأبلكيشن» (PWA install explainer): 4 variants, SG MOTION 9:16, 25 fps

| Variant | Phone | Browser | Exact labels on screen and in the VO | Length |
|---|---|---|---|---|
| `ios_ar` | iPhone in Arabic (RTL) | Safari | مشاركة ← إضافة إلى الشاشة الرئيسية ← إضافة | 32.5 s |
| `ios_en` | iPhone in English | Safari | Share ← Add to Home Screen ← Add | 31.4 s |
| `android_ar` | Android in Arabic (RTL: ⋮ is top-**left**) | Chrome | ⋮ ← تثبيت التطبيق ← تثبيت | 27.6 s |
| `android_en` | Android in English (⋮ top-right) | Chrome | ⋮ ← Install app ← Install | 26.9 s |

- **Facts come from the training repo:**
  - the portal is `portal.sabergroupacademy.com`;
  - `manifest-portal.json` gives the name «بوابة الطالب - SABER GROUP», the short name «بوابة الطالب», `display: standalone` (full screen, no browser bar) and a dark theme;
  - the icon is `public/icon-512.png`;
  - every system shows the update bar «نزل تحديث جديد · حدّث دلوقتي».
  - Offline use and phone push notifications are not claimed: they were not confirmed in the code.
- **Real vs drawn:**
  - Real: the portal page in the browser is the live login page, captured at 390×844 @3x. The opened app is the portal's real UI with demo data (from `../portal-ad`).
  - Drawn: the browser and system UI (Safari bar and share sheet, Chrome bar, menu and install dialog, the home screen) is simplified, with the exact labels for each language.
  - Menu wording can differ between iOS and Chrome versions: check it against a current phone before publishing.
- **VO:** Fatima (the ElevenLabs library voice, as in the Mariam and portal pieces), one take per variant, seed 21. The English UI terms are spoken as the student sees them (Share / Add to Home Screen / Install app). Texts are in `vo/spoken_<variant>.txt`, timings in `timing.js`.
- **Sound:** `build_mix.py <variant> <dur>`. Funky Fusion plays from its start, ducked, with a 1.5k/3k pocket, plus one UI SFX per motion. Master: −14 LUFS.
- **Render:** `./build.sh [variants…]` → `out/pwa_install_<variant>_9x16.mp4`.

## Arabic variants start on the steps (client)
`ios_ar` and `android_ar` have no intro line: the phone comes in on the browser and the VO starts at «افتح البوابة من…».
`vo/pwa_vo_<v>.flac` is the full VO trimmed at the quiet frame before line 2 (ios_ar 5.27 s, android_ar 5.13 s) with 0.69 s of lead;
the untrimmed VO stays in `vo/pwa_vo_<v>_withintro.flac`. `timing.js` marks them `"intro": false`.
