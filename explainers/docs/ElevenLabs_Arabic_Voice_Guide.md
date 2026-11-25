# دليل احتراف ElevenLabs: صناعة الأصوات والتحكم الدقيق في النطق

خلاصة أفضل الممارسات والخبرات الرسمية والتطبيقية للحصول على أصوات طبيعية واحترافية والتحكم الدقيق في النطق والأداء داخل منصة [ElevenLabs](https://elevenlabs.io/docs/overview/capabilities/text-to-speech/best-practices).

## 1. اختيار الموديل وأدوات التحكم في النطق المدعومة

تختلف طريقة توجيه النطق والوقفات باختلاف الموديل الذي تستخدمه، حيث يعتمد الإصدار الأحدث ([Eleven v4](https://elevenlabs.io/blog/pronunciation-dictionary-guide)) على الأوامر المباشرة داخل النص بدلاً من وسوم SSML القديمة:

| الموديل | البدائل النصية (Alias Rules) | الفونيمات في القاموس (Phoneme Rules) | الصوتيات المباشرة (`/.../` Inline IPA) | وسوم SSML (`<phoneme>` و `<break>`) | الوسوم الصوتية (`[...]` Audio Tags) |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **[Eleven v4 / v4 Turbo](https://elevenlabs.io/blog/pronunciation-dictionary-guide)** | مدعوم | مدعوم (IPA / CMU) | مدعوم | غير مدعوم | مدعوم بالكامل |
| **[Eleven v3](https://elevenlabs.io/blog/pronunciation-dictionary-guide)** | مدعوم | مدعوم (IPA / CMU) | مدعوم | غير مدعوم | مدعوم |
| **[Eleven Multilingual v2](https://elevenlabs.io/docs/overview/capabilities/text-to-speech/best-practices)** | مدعوم | غير مدعوم | غير مدعوم | يدعم `<break>` فقط | غير مدعوم |
| **[Eleven Flash v2](https://elevenlabs.io/blog/pronunciation-dictionary-guide)** | مدعوم | مدعوم | غير مدعوم | مدعوم (للإنجليزية) | غير مدعوم |
| **[Eleven Turbo v2](https://elevenlabs.io/blog/pronunciation-dictionary-guide)** | مدعوم | غير مدعوم | غير مدعوم | مدعوم (للإنجليزية) | غير مدعوم |

## 2. أفضل تقنيات التحكم الدقيق في النطق (Pronunciation Control)

* **ضبط التشكيل والحركات في اللغة العربية:** أضف حركات التشكيل (الفتحة، الضمة، الكسرة، السكون، والشدة متبوعة بحركتها مثل `مُدَرِّسٌ`) على الكلمات التي تحتمل أكثر من قراءة أو أواخر الكلمات لإزالة أي لبس في النطق والمعنى ([دليل التشكيل والحركات العربية](https://arabictyping101.com/en/guide/arabic-diacritics)، [أهمية التشكيل في الذكاء الاصطناعي](https://moknah.io/en/blog/2025/7/26/diacritics-in-artificial-intelligence-are-they-essential-for-the-arabic-language/)).
* **مطابقة الصوت مع مفردات اللهجة:** اختر صوتاً مدرباً على اللهجة المستهدفة واكتب النص بمفردات تلك اللهجة مباشرةً (مثل الكتابة بالعامية المصرية مع اختيار صوت مصري) للحصول على مخارج حروف ونبرة طبيعية غير متكلفة ([دليل تحويل النص إلى كلام باللهجة المصرية](https://elevenlabs.io/blog/egyptian-accent-text-to-speech)).
* **كتابة الرموز الصوتية المباشرة (Inline IPA) في Eleven v4:** ضع النطق الصوتي القياسي (IPA) للكلمات الصعبة أو المصطلحات العلمية مباشرة داخل النص بين شرطتين مائلتين وعلامتي تنصيص مثل `"/ˌbaɪoʊˈkemɪstri/"` أو `"/ɡluːˈkoʊs/"`، مع ضرورة وضع علامات التشديد المقطعي (`ˈ` للتشديد الأساسي و`ˌ` للثانوي) ([دليل أفضل الممارسات](https://elevenlabs.io/docs/overview/capabilities/text-to-speech/best-practices)).
* **إنشاء قواميس النطق (Pronunciation Dictionaries):** افتح لوحة **Pronunciation dictionaries** في التطبيق أو ارفع ملف `.pls` لتثبيت نطق أسماء العلامات التجارية والاختصارات المتكررة عبر طريقتين ([دليل قواميس النطق](https://elevenlabs.io/blog/pronunciation-dictionary-guide)):
  * **قواعد البدائل النصية (Alias Rules):** استبدل الكلمة أو الاختصار بكتابة صوتية مبسطة أو مفكوكة (مثل تحويل `"UN"` إلى `"United Nations"` أو `"SaaS"` إلى `"sass"` أو كتابة الكلمة العربية بحروف تعكس نطقها الفعلي)، وهي الطريقة المتاحة في موديل **Multilingual v2** ([دليل أفضل الممارسات](https://elevenlabs.io/docs/overview/capabilities/text-to-speech/best-practices)).
  * **قواعد الفونيمات (Phoneme Rules):** أدخل النطق الصوتي بصيغة **IPA** أو **CMU Arpabet** في القاموس، مع إنشاء مدخلات منفصلة لحالة الأحرف الكبيرة والصغيرة (Case Sensitivity) ([توثيق قواميس النطق](https://elevenlabs.io/docs/eleven-agents/customization/voice/pronunciation-dictionary)).
* **استخدام وسم `<phoneme>` للموديلات الأقدم (Flash v2 / Turbo v2):** استخدم وسم SSML المباشر بصيغة **CMU Arpabet** لكل كلمة منفردة في النصوص الإنجليزية مثل `<phoneme alphabet="cmu-arpabet" ph="M AE1 D IH0 S AH0 N">Madison</phoneme>` ([دليل أفضل الممارسات](https://elevenlabs.io/docs/overview/capabilities/text-to-speech/best-practices)).
* **تطبيع الأرقام والاختصارات (Text Normalization):** حوّل الأرقام، العملات، التواريخ، والرموز إلى كلمات مكتوبة بالكامل قبل توليد الصوت (مثل كتابة `"$42.50"` على هيئة `"forty-two dollars and fifty cents"` وتفكيك أرقام الهواتف والروابط) لتجنب أخطاء القراءة الآلية خصوصاً في الموديلات السريعة مثل **Flash v2.5** ([دليل أفضل الممارسات](https://elevenlabs.io/docs/overview/capabilities/text-to-speech/best-practices)).

## 3. الإعدادات المثالية للصوت (Voice Settings)

| الإعداد | النطاق الموصى به | التأثير وأفضل حالات الاستخدام |
| :--- | :--- | :--- |
| **الاستقرار (Stability)** | **30% – 55%** للقصص والحوار / **60% – 85%** للسرد والشروحات | القيم المنخفضة تمنح أداءً عاطفياً وتنوعاً طبيعياً في النبرة، بينما القيم الأعلى تعطي ثباتاً رسمياً؛ تجنب رفعه إلى 100% لأنه يلغي التغيرات الدقيقة ويجعل الصوت آلياً ([دليل تصميم الأصوات](https://elevenlabs.io/docs/eleven-agents/customization/voice/best-practices/conversational-voice-design)، [دليل تحسين جودة الصوت](https://neuraplus-ai.github.io/blog/best-settings-for-elevenlabs-ai-voice-quality-improvement-2026.html)). |
| **التشابه والوضوح (Similarity / Clarity)** | **75% – 90%** | يعزز نقاء الصوت وتطابقه مع العينة الأصلية؛ رفعه إلى 100% قد يسبب تشوهاً صوتياً (Distortion) أو مبالغة مصطنعة في نطق الحروف ([دليل تصميم الأصوات](https://elevenlabs.io/docs/eleven-agents/customization/voice/best-practices/conversational-voice-design)، [دليل تحسين جودة الصوت](https://neuraplus-ai.github.io/blog/best-settings-for-elevenlabs-ai-voice-quality-improvement-2026.html)). |
| **السرعة (Speed)** | **0.9x – 1.1x** (الافتراضي **1.0**) | يتيح التحكم في سرعة الإلقاء بين **0.7** و**1.2**؛ يُفضل تقليلها قليلاً للشروحات المعقدة وزيادتها للمعلومات السريعة دون التطرف للحفاظ على الجودة ([دليل أفضل الممارسات](https://elevenlabs.io/docs/overview/capabilities/text-to-speech/best-practices)). |
| **المبالغة في الأسلوب (Style)** | **0% – 20%** (الافتراضي **0**) | يضخم أسلوب المتحدث الأصلي وحماسه، ولكن رفعه بشكل مفرط يقلل من استقرار الصوت ويزيد من احتمالية ظهور عيوب صوتية ([توثيق إعدادات الصوت](https://elevenlabs.io/docs/api-reference/voices/settings/update)). |

## 4. توجيه المشاعر، الوقفات، والإيقاع (Audio Tags & Pacing)

* **استخدام الوسوم الصوتية (Audio Tags) في Eleven v4 و v3:** ضع توجيهات الأداء باللغة الإنجليزية بين قوسين مربعين `[...]` قبل الجملة مباشرة لتغيير نبرة الصوت أو سرعته أو انفعاله دون أن ينطقها الموديل ([قائمة الوسوم الصوتية لـ Eleven v4](https://elevenlabs.io/blog/elevenlabs-audio-tags-list)):
  * **المشاعر والطاقة:** `[excited]`، `[playful]`، `[proud]`، `[anxious]`، `[tired]`، `[peaceful]`، `[thoughtful]`.
  * **مستوى الصوت وطريقة الإلقاء:** `[whispers]`، `[shouts]`، `[softly]`، `[quietly]`، أو دمج أكثر من وصف بفاصلة مثل `[whispering, fearful]`.
  * **الإيقاع والسرعة اللحظية:** `[slowly]`، `[rushed]`، `[pause]`، `[drawn out]`.
  * **ردود الفعل البشرية التلقائية:** `[laughs]`، `[sighs]`، `[gasps]`، `[clears throat]`، `[crying]`.
* **ضبط الوقفات بعلامات الترقيم ووسوم التوقف:**
  * استخدم الشرطة (`-` أو `—`) لعمل وقفة قصيرة حادة، ونقاط الحذف (`...`) لإضافة وقفة مصحوبة بنبرة تردد أو تفكير في جميع الموديلات ([دليل إضافة الوقفات](https://elevenlabs.io/docs/help-center/product/core-capabilities/text-to-speech/how-can-i-add-pauses)).
  * استخدم وسم `<break time="1.5s" />` (حتى 3 ثوانٍ) في موديلات **Multilingual v2** و**Flash v2** لعمل وقفات زمنية دقيقة ([دليل أفضل الممارسات](https://elevenlabs.io/docs/overview/capabilities/text-to-speech/best-practices)).
