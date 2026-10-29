# براف الأصول المطلوبة: ريلز صابر جروب × مشروم

الملف ده فيه كل اللي محتاجه عشان أطلع الريلز الأربعة بشكل احترافي ومن غير عزل.

- **الصور:** كل صورة ليها كود واسم ملف ووقت استخدامها في الريل، والـ prompt جاهز بالإنجليزي تحطه في الموديل زي ما هو.
- **إجابات نصية:** آخر قسم في الملف فيه شوية أسئلة محتاج ردك عليها.

---

## 0. التغييرات اللي هعملها في المونتاج

| المشكلة | الحل |
|---|---|
| العزل بوّظ الشعر | **بطّلت العزل خالص.** الكلام والجرافيكس هيبقوا فوق الفيديو، أو في لقطات inserts كاملة بين كلامك. |
| الترانزيشن سيئة | **كات نضيف على البيت** بين لقطتك والـ inserts (1–1.5 ثانية). الـ insert بيدخل بـ wipe أو slide ناعم في 8–10 فريمات بـ easing. مفيش zoom-blur ولا flash ولا تغيير زوم وسط الجملة. تغيير حجم الكادر هيكون عند الكات بس. |
| الموشن باين إنه "قالب" | الجرافيكس هتبقى **صور 3D حقيقية بهويتنا** (من الملف ده) بتتحرك بـ parallax خفيف، بدل الأشكال الفلات. |

---

## 1. ستايل موحّد لكل الصور (مهم جداً)

ابدأ أي prompt بالفقرة دي عشان كل الصور تطلع شبه بعض وشبه لوجو مشروم (3D ناعم ولامع):

```
STYLE: premium 3D render, soft clay-like matte material with subtle glossy highlights,
studio softbox lighting from top-left, gentle warm rim light, soft contact shadows,
cinematic and minimal, brand palette only: ember orange #FF8A1F, brand red #D83B25,
warm cream #F4EEE8, charcoal #1A1614, near-black background #0B0A0A,
high detail, sharp focus, no text, no letters, no logos, no watermark.
```

**مواصفات التسليم:**
- **صور العناصر (OBJ):** PNG بخلفية شفافة، المقاس 2048×2048 على الأقل، والعنصر في النص ومعاه مسافة حواليه (padding).
- **اللقطات الكاملة (PLATE):** 9:16، المقاس **2160×3840** (أو 1080×1920 كأقل حاجة). الخلفية نفس الـ near-black، وسيب **فراغ فوق** (أول 25%) و**تحت** (آخر 20%) للكلام.
- **الطبقات (LAYERS):** لو مكتوب "layers" يبقى محتاج نفس الصورة مفصولة: خلفية لوحدها، والعنصر لوحده PNG شفاف. ده عشان أعمل parallax.
- **الاتساق:** نفس العنصر في كذا صورة (زي الكوباية) لازم يكون **نفس الموديل بالظبط**. استخدم نفس الـ seed أو image reference.
- **ممنوع:** أي كتابة جوه الصور. أنا هضيف الكلام في الموشن بخط الهوية.

---

## 2. أصول الهوية (من عندكم مش من الموديل)

| الكود | الملف | ملاحظة |
|---|---|---|
| B-01 | `brand/saber-logo.svg` (أو PNG شفاف 3000px) | **اللوجو الرسمي.** عندي نسخة "SABERGROUPEG +AI" من ريبو التدريب، وكمان شفت نسخة المربع الأحمر "SABER GROUP Marketing Agency" في ريل الـ AI القديم. ابعتلي الاتنين وقولّي نستخدم أنهي. |
| B-02 | `brand/mushroom-logo.png` | نسخة شفافة high-res (اللي عندي 1681px). |
| B-03 | `brand/fonts/` | الخطوط الرسمية للهوية (عربي وإنجليزي) لو موجودة. حالياً شغال بـ Cairo وAlexandria وBebas Neue وPoppins. |
| B-04 | `brand/guide.pdf` | البراند جايد لو موجود. |
| B-05 | `brand/handle.txt` | اسم الأكونت (@...) اللي يظهر في الإند كارد. |

---

## 3. ريل 4: سيكولوجية الألوان

| الكود | النوع | الملف | التوقيت في الريل | الاستخدام |
|---|---|---|---|---|
| R4-01 | OBJ | `r4/swatch_fan_green.png` | 0.0–2.8 "اللون اللي بتحبه" | مروحة كروت ألوان، كلها أخضر |
| R4-02 | OBJ ×6 | `r4/swatch_card_{green,blue,white,red,yellow,orange}.png` | طول الريل | كارت لون واحد، بيتحرك ويتبدّل |
| R4-03 | PLATE + layers | `r4/medical_poster.png` (+ `_bg`, `_poster`) | 5.3–12.5 "Medical Field / دكتور / مستشفى" | بوستر عيادة على حيطة، أزرق وأبيض |
| R4-04 | OBJ | `r4/medical_props.png` | 8.9–12.5 | سماعة طبيب + صليب طبي 3D، أزرق وأبيض |
| R4-05 | PLATE + layers | `r4/burger_warm.png` | 12.7–20.4 "بوستر للمطعم" | برجر بإضاءة دافية: أحمر وأصفر وبرتقالي |
| R4-06 | PLATE | `r4/burger_cold.png` | 19.3–20.4 "وهتجوّعني أكتر" | **نفس البرجر بالظبط** بإضاءة باردة زرقا. هعمل مقارنة: البارد مش بيجوّع والدافي بيجوّع |
| R4-07 | OBJ | `r4/booklet_blank.png` | 27.2–31.3 "ملف بيتكلم على الألوان" | كتيّب/PDF غلافه فاضي، هحط العنوان عليه |

**Prompts:**

- **R4-01**
  ```
  STYLE + a fanned stack of 7 rounded color swatch cards (like a Pantone fan) all in the same fresh green #2BC98F,
  slight perspective from 3/4 above, isolated on transparent background, centered
  ```
- **R4-02** (كررها لكل لون، وغيّر الـ HEX بس)
  ```
  STYLE + a single rounded color swatch card standing upright, solid color {HEX}, thin cream border,
  soft shadow below, front 3/4 view, isolated on transparent background
  ```
  الألوان: green #2BC98F · blue #2F6FEB · white #F4EEE8 · red #E8321E · yellow #FFC83D · orange #FF8A1F
- **R4-03**
  ```
  STYLE + vertical 9:16 scene: a clean modern clinic wall with a framed medical poster
  (abstract shapes only, no text) in calm blue #2F6FEB and white, soft daylight, empty space top and bottom,
  near-black vignette edges
  ```
  layers: الحيطة لوحدها + البوستر لوحده PNG شفاف.
- **R4-04**
  ```
  STYLE + a 3D stethoscope and a rounded medical cross icon, blue #2F6FEB and white, isolated on transparent background
  ```
- **R4-05**
  ```
  STYLE + vertical 9:16 hero food shot: a juicy gourmet burger on a dark slate, warm lighting,
  red, yellow and orange tones, appetizing steam, dark background, empty space top and bottom
  ```
  layers: البرجر لوحده PNG + الخلفية.
- **R4-06**
  ```
  same exact burger, same composition and seed as R4-05, but cold blue-grey lighting, desaturated,
  unappetizing clinical mood
  ```
- **R4-07**
  ```
  STYLE + a closed A4 booklet / report standing at a slight angle, completely blank cream cover with an orange spine,
  soft shadow, isolated on transparent background
  ```

---

## 4. ريل 5: زاوية التصوير

أهم ريل في الأصول. **كل اللقطات لازم تكون لنفس الكوباية ونفس الديكور، والكاميرا بس هي اللي بتتغير.** ابدأ بـ R5-01 وخلي باقي الصور image reference منها.

| الكود | النوع | الملف | التوقيت | الاستخدام |
|---|---|---|---|---|
| R5-01 | PLATE | `r5/mug_high_angle.png` | 0.0–4.9 "ماتنفعش تبقى بطل" | الكوباية من فوق: صغيرة ومضغوطة |
| R5-02 | PLATE | `r5/mug_low_angle.png` | 5.0–9.0 "تبقى بطل عادي" | الكوباية من تحت: hero shot، طويلة ودرامية |
| R5-03 | OBJ | `r5/cape_red.png` | 4.1 و8.4 "جلابية سوبرمان" | كاب سوبرمان أحمر لوحده، هلبّسه للكوباية |
| R5-04 | PLATE | `r5/mug_eye_level.png` | 14.3–16.3 "جميع زوايا التصوير" | زاوية مستوى العين |
| R5-05 | PLATE | `r5/mug_birds_eye.png` | 14.3–16.3 | من فوق خالص (top-down) |
| R5-06 | PLATE | `r5/mug_dutch.png` | 14.3–16.3 | زاوية مايلة (Dutch) |
| R5-07 | OBJ | `r5/cinema_camera.png` | 16.4–17.6 "حتى لو مش انت اللي هتصور" | كاميرا سينما 3D |
| R5-08 | OBJ | `r5/booklet_blank.png` | 23.9–28.0 | نفس R4-07 (ممكن تتكرر) |

**وصف الكوباية الثابت** (حطه في كل prompt بتاع الريل ده):

```
MUG: a matte cream ceramic coffee mug with a thin ember-orange band near the rim,
dark espresso inside, on a charcoal round pedestal, near-black studio backdrop, single warm key light
```

**Prompts:**

- **R5-01**
  ```
  STYLE + MUG, camera high above looking down at 55 degrees, wide lens, the mug looks small, squat and unimportant,
  flat soft light, vertical 9:16, empty space top and bottom
  ```
- **R5-02**
  ```
  STYLE + MUG, camera very low near the floor looking up, heroic low-angle shot, the mug looks tall, powerful and monumental,
  dramatic rim light and soft haze behind, vertical 9:16, empty space top and bottom
  ```
- **R5-03**
  ```
  STYLE + a small flowing superhero cape in brand red #D83B25, no emblem, no letters,
  shaped to wrap around a coffee mug, isolated on transparent background
  ```
  محتاجها من زاويتين: من فوق، ومن تحت.
- **R5-04 / R5-05 / R5-06:** نفس الـ MUG، والفرق في الكاميرا بس:
  - **R5-04:**
    ```
    camera at eye level, straight on
    ```
  - **R5-05:**
    ```
    camera directly overhead, top-down flat lay
    ```
  - **R5-06:**
    ```
    camera at eye level tilted 20 degrees (Dutch angle)
    ```
- **R5-07**
  ```
  STYLE + a compact cinema camera with a lens, charcoal body with orange accents, 3/4 front view,
  isolated on transparent background
  ```

---

## 5. ريل 3: التباين في التصميم

| الكود | النوع | الملف | التوقيت | الاستخدام |
|---|---|---|---|---|
| R3-01 | OBJ ×2 | `r3/sphere_grey.png`, `r3/sphere_orange.png` | 0.0–2.9 "الكورة اللي في النص" | هبني منهم شبكة الكور، والبرتقالي في النص |
| R3-02 | OBJ ×3 | `r3/car_grey_side.png`, `r3/car_orange_side.png`, `r3/car_orange_turn.png` | 2.9–6.3 "العربية اللي طلعت عبر الصف" | صف عربيات رمادي، والبرتقالي بتلف وتخرج |
| R3-03 | OBJ ×2 | `r3/pawn_grey.png`, `r3/king_orange.png` | 8.7–12.3 "لما يكون عندي بطل" | عساكر شطرنج رمادي وملك برتقالي = البطل |
| R3-04 | OBJ ×4 | `r3/cube_cream.png`, `r3/cube_orange.png`, `r3/cube_orange_big.png`, `r3/sphere_orange_big.png` | 12.4–21.2 "لونها/حجمها/شكلها مختلف" | العنصر بيتغيّر: لون ثم حجم ثم شكل ثم يخرج من الصف |
| R3-05 | OBJ ×3 | `r3/icon_balance.png`, `r3/icon_hierarchy.png`, `r3/icon_depth.png` | 24.4–27.9 "التوازن / الهيكلة / العمق" | أيقونات 3D للمبادئ |
| R3-06 | OBJ | `r3/booklet_blank.png` | 30.4–34.1 | نفس R4-07 |

**Prompts:**

- **R3-01**
  ```
  STYLE + a single perfect sphere, matte warm grey  /  same sphere in glossy ember orange #FF8A1F,
  isolated on transparent background, identical lighting
  ```
- **R3-02**
  ```
  STYLE + a cute minimal toy car, side view facing left, matte warm grey  /  same car glossy orange  /
  same orange car turned 3/4 toward the camera as if leaving the line, isolated on transparent background
  ```
- **R3-03**
  ```
  STYLE + a minimal chess pawn in matte grey  /  a minimal chess king in glossy ember orange,
  isolated on transparent background, same scale and lighting
  ```
- **R3-04**
  ```
  STYLE + a rounded cube in matte cream  /  the same rounded cube in glossy orange  /
  a larger glossy orange rounded cube  /  a glossy orange sphere of the same volume,
  isolated on transparent background, identical lighting
  ```
- **R3-05**
  ```
  STYLE + (a) a balanced see-saw with two spheres, (b) three stacked blocks decreasing in size (visual hierarchy),
  (c) four layered translucent cards in perspective (depth), cream and orange, isolated on transparent background
  ```

---

## 6. ريل saber2: الـ AI صفّر العداد

| الكود | النوع | الملف | التوقيت | الاستخدام |
|---|---|---|---|---|
| S2-01 | OBJ ×3 | `s2/icon_graphic.png`, `s2/icon_video.png`, `s2/icon_motion.png` | 3.6–5.9 "Graphic, Video Edit, Motion Graphics" | أيقونات 3D للتخصصات |
| S2-02 | OBJ | `s2/counter_blank.png` | 0.6–13.4 "10 سنين … 20 سنة … صفّر العداد" | عدّاد ميكانيكي من غير أرقام، هحرك الأرقام عليه |
| S2-03 | PLATE + layers | `s2/start_line.png` | 12.1–13.4 "كله بيبدأ من نفس النقطة" | خط بداية سباق وعليه عساكر متطابقة على نفس الخط |
| S2-04 | OBJ | `s2/ai_chip.png` | 13.4–16.9 "تدمج وتستخدم الـ AI" | شريحة AI بتنوّر برتقالي |
| S2-05 | OBJ | `s2/hourglass.png` | 17.0–21.5 "كمان سنتين تلاتة" | ساعة رملية والرمل بيخلص |
| S2-06 | OBJ | `s2/rocket.png` (أو `speedometer.png`) | 28.0–30.9 "تسرّع شغلك 100X" | صاروخ / عدّاد سرعة على الآخر |
| S2-07 | OBJ | `s2/comment_bubble.png` | 26.7–28.0 "سيبلنا كومنت" | فقاعة كومنت 3D |

**Prompts:**

- **S2-01**
  ```
  STYLE + three matching app-style 3D icons on rounded charcoal tiles: (a) a vector pen tool with a bezier curve,
  (b) a film clapperboard with a timeline strip, (c) a play button with motion keyframe curves;
  orange and cream accents, isolated on transparent background
  ```
- **S2-02**
  ```
  STYLE + a vintage mechanical odometer counter with 2 empty blank wheels (no digits), charcoal metal with orange trim,
  front view, isolated on transparent background
  ```
- **S2-03**
  ```
  STYLE + vertical 9:16: a running track start line seen from low angle, five identical matte cream pawns standing exactly on the line,
  warm orange light from the horizon, dark background, empty space top and bottom
  ```
  layers: الخلفية + العساكر.
- **S2-04**
  ```
  STYLE + a sleek AI processor chip with glowing ember-orange circuitry, 3/4 view, isolated on transparent background
  ```
- **S2-05**
  ```
  STYLE + an elegant hourglass, cream frame, orange sand almost run out, isolated on transparent background
  ```
- **S2-06**
  ```
  STYLE + a minimal rocket launching with a soft orange flame trail, 3/4 view, isolated on transparent background
  ```
- **S2-07**
  ```
  STYLE + a glossy 3D chat/comment speech bubble in ember orange with three cream dots, isolated on transparent background
  ```

---

## 7. عناصر عامة للترانزيشن والجو

| الكود | الملف | الاستخدام |
|---|---|---|
| C-01 | `common/backdrop_9x16.png` | خلفية الاستوديو اللي هتتحط ورا أي OBJ في الـ inserts عشان كله يبقى متسق |
| C-02 ×3 | `common/light_leak_{1,2,3}.png` | light leaks برتقالي على أسود، هستخدمها في الانتقالات (screen blend) بدل الـ flash |
| C-03 | `common/dust_particles.png` | جزيئات غبار خفيفة على أسود، طبقة جو خفيفة |

**Prompts:**

- **C-01**
  ```
  vertical 9:16 empty photo studio backdrop, near-black #0B0A0A with a very soft warm orange glow low in the center,
  subtle floor horizon, no objects, no text
  ```
- **C-02**
  ```
  abstract organic warm light leak, ember orange and soft cream, on pure black background, film-like, vertical 9:16, no objects
  ```
- **C-03**
  ```
  sparse floating dust particles and soft bokeh, warm white, on pure black background, vertical 9:16
  ```

---

## 8. محتاج ردك على الأسئلة دي

حط الردود في ملف `answers.md` جوه الـ zip:

1. **ريل 5:** الكلمة اللي بتقولها في أول الريل ("شايف الـ… دي"). الـ transcript سمعها **"الكنزاية"**. هي الكباية؟ القزازة؟ ولا حاجة تانية؟
2. **الملفات المجانية:** عنوان كل PDF بتقول عليه في الريلز (أسس التصميم / سيكولوجية الألوان / زوايا التصوير). ولو جاهزة، ابعت **غلاف كل PDF** كصورة وأنا هحطه بدل الكتيّب الفاضي.
3. **الـ CTA:** الجملة اللي عايزها في آخر كل ريل. حالياً "في أول كومنت" لـ 3 و4 و5، و"اكتب AI في الكومنت" لـ saber2.
4. **الفيديوهين الريفرنس:** اللي قلت إنهم عاجبينك. ماوصلونيش لحد دلوقتي، فحطهم في `refs/`.
5. **اللوجو:** نستخدم أنهي نسخة؟ (B-01)

---

## 9. شكل الـ zip

```
saber_assets.zip
├── answers.md
├── brand/   (B-01 … B-05)
├── refs/    (الفيديوهين الريفرنس)
├── common/  (C-01 … C-03)
├── r3/      (R3-01 … R3-06)
├── r4/      (R4-01 … R4-07)
├── r5/      (R5-01 … R5-08)
└── s2/      (S2-01 … S2-07)
```

**أولوية التسليم** (لو هتبعتهم على دفعات):

1. ريل 4
2. ريل 5
3. ريل 3
4. saber2
5. العامة C

اسم كل ملف لازم يكون زي ما هو مكتوب في الجداول بالظبط، عشان أركّبهم أوتوماتيك.
