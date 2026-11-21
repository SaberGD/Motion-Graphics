# خريطة الأصول

| ID | الأصل | الاستخدام |
| --- | --- | --- |
| SG-LOGO-ACADEMY-SQUARE-OWNER | `assets/logos/saber-group-academy-square-original.png` | اللوجو المربع الجديد المرفق من صاحب الهوية، 1080×1080، بالنص المتراص وخلفيته الحمراء الداكنة الأصلية. أصل إضافي وليس بديلًا تلقائيًا للعريض. احتفظ بالمربع كاملًا؛ مش Cutout شفاف. |
| SG-LOGO-WIDE-MASTER | `assets/logos/saber-group-wordmark.webp` | ماستر اللوجو العريض الأصلي، لم يتغير بايت واحد. |
| SG-LOGO-WIDE | `assets/logos/saber-group-wordmark.png` | نسخة PNG من نفس البكسلات للتركيب في الفيديو، مع الحفاظ على الشفافية. |
| SG-LOGO-SQUARE-REFERENCE | `assets/logos/saber-group-square-reference.webp` | مرجع اللوجو المربع القديم/الثانوي؛ مش اللوجو الرئيسي للإعلان. |
| SG-SYSTEM-WORDMARK | `assets/logos/saber-group-system-wordmark.png` | الأصل المستخدم في الترينينج والحسابات؛ لا تخلطه عشوائيًا مع ماستر آخر داخل حملة واحدة. |
| MARO-NEUTRAL | `assets/mascot/maro-fullbody-neutral.png` | وضعية أصلية ثابتة، تصلح لوجود هادئ. |
| MARO-WAVE | `assets/mascot/maro-fullbody-wave.png` | وضعية التحية الأصلية؛ PNG متحركة كطبقة، مش Rig. |
| MARO-POINTING | `assets/mascot/maro-fullbody-pointing.png` | إشارة أصلية؛ لا تقلبها أفقيًا لأن كتابة MARO ستنعكس. |
| MARO-EXPRESSIONS-REFERENCE | `assets/mascot/maro-visor-expressions.png` | شيت تعبيرات مرجعي، مش طبقات وجه مفصولة تلقائيًا. |
| FONT-CAIRO-VARIABLE | `assets/fonts/Cairo-Variable.ttf` | خط العربي الأساسي؛ slant=0، والأوزان حسب التكوين. |
| FONT-CAIRO-REGULAR / MEDIUM / BOLD | `assets/fonts/Cairo-Regular.ttf`, `Cairo-Medium.ttf`, `Cairo-Bold.ttf` | نسخ Static من نفس الخط بأوزان 400/500/700 وميل صفر، لتوافق أفضل مع أدوات لا تدعم Variable Fonts. |
| FONT-BEBASNEUE-REGULAR | `assets/fonts/BebasNeue-Regular.ttf` | عناوين إنجليزية قصيرة، ليس لإعادة كتابة اللوجو. |
| FONT-TAJAWAL-REGULAR / BOLD | `assets/fonts/Tajawal-*.ttf` | بديل عند تعذر Cairo فقط. |
| PATTERN-GRID-* | `assets/patterns/grid-*.svg` | خلفيات جديدة مبنية على جريد الهوية، للمقاسات الثلاثة. |
| PATTERN-CORNERS-* | `assets/patterns/corners-*.svg` | زوايا هندسية جديدة مقترحة. SVG حقيقي بلا نص ولا لوجو مضمّن. |
| ICON-* | `assets/icons/` | رموز Lucide ورموز المنصات الموجودة محليًا، مع تراخيصها. ليست شعارات صابر جروب. |

`ASSET-MANIFEST.json` يسجل المصدر والأبعاد والشفافية والـSHA-256. الصور الأصلية لا تتغير، ونسخة PNG من اللوجو اجتازت مقارنة البكسلات بعد الفك. وجود Alpha لا يعني أن أي هالة مضيئة داخل الصورة اختفت؛ احتفظ بها كما هي أو استخدم الوضعية المناسبة على خلفية داكنة.

المرفقات البصرية لا تشمل ملفات PSD/AI/SVG أصلية للوجو؛ لم يتم عمل Auto Trace أو إعادة رسم أو تغليف Raster داخل SVG وتسميته فيكتور. ملفات SVG في هذه الباكدج أنماط وأيقونات فقط.

حقوق اللوجوهات والشخصية تخص مالك الهوية. الخطوط مرفقة بتراخيص SIL OFL الأصلية، وتراخيص الأيقونات محفوظة في `licenses/`. ده مش ترخيصًا لإعادة بيع شعارات الغير أو إزالة إشعارات الترخيص.
