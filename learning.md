# Learning

هنا كل الحاجات اللي عاوز أعرف عنها أكتر وأتوسع فيها.
القاعدة: **مفيش حاجة تتمسح من هنا**. أي موضوع يتضاف يفضل موجود لحد ما أذاكره وأعلّم عليه ✅.

**العلامات:**
- 📌 موضوع اتذكر صراحةً في المصدر
- ➕ موضوع قريب منه أو أساسي معاه، اتضاف عشان هيفرق معايا

---

## 📥 Inbox (أي حاجة جديدة تتكتب هنا الأول)

### من بوست Taskatk: "الـAI سهّل كتابة الكود، لكنه ملغاش صعوبة بناء الـSoftware"

الفكرة الأساسية: كتابة الكود أسهل جزء. الصعب إنك تبني Product يستحمل مستخدمين حقيقيين وبيانات حقيقية وأجهزة كتير شغالة في نفس الوقت، وإنك تعرف إيه اللي محتاج يتعمل وإمتى وليه.

#### 1. الـConcurrency والـRace Conditions
- 📌 **Race Conditions:** عمليتين بيحصلوا في نفس اللحظة وبيبوظوا البيانات (أمثلة البوست: الـTimers، الـTask Assignments، الـPayments).
- ➕ **Transactions والـACID**، ومستويات الـ**Isolation** (Read Committed / Repeatable Read / Serializable) وإيه المشاكل اللي كل مستوى بيمنعها: Lost Update، Write Skew، Phantom Reads.
- ➕ **Optimistic vs Pessimistic Locking:** يعني `version` column أو `SELECT ... FOR UPDATE`.
- ➕ **Atomic operations / Compare-and-Swap:** إزاي تعدّل قيمة من غير ما تقراها الأول وتكتبها.
- ➕ **Distributed Locks** وليه هي أخطر مما تبان.
- **المصادر:**
  - كتاب *Designing Data-Intensive Applications* لـ Martin Kleppmann، الفصل بتاع Transactions (الكتاب ده أهم مصدر في القايمة كلها).
  - PostgreSQL Docs: الفصل بتاع *Concurrency Control / Transaction Isolation*.
  - مقالة Kleppmann: *How to do distributed locking*.
  - Firestore Docs: *Transactions and batched writes* (مفيد لو شغال على Firebase زي El-Behery-CRM).
  - كورس Hussein Nasser: *Fundamentals of Database Engineering*، وقناته على YouTube.

#### 2. الـIdempotency ("طب لو الـRequest اتبعت مرتين؟")
- 📌 Request اتبعت مرتين بسبب Retry أو Double-click أو إن النت فصل ورجع.
- ➕ **Idempotency Keys**: نفس الطلب لو اتكرر يدّي نفس النتيجة من غير ما يتنفذ مرتين.
- ➕ **At-least-once vs Exactly-once delivery** وليه الـExactly-once في الحقيقة بيتعمل بـ At-least-once + Idempotency.
- ➕ **Retries صح:** Exponential Backoff + Jitter، وإمتى الـRetry نفسه يبقى خطر.
- **المصادر:**
  - Stripe Blog: *Designing robust and predictable APIs with idempotency*.
  - Brandur Leach: *Implementing Stripe-like Idempotency Keys in Postgres*.

#### 3. الـPayments
- 📌 الـPayments كمثال على أخطر مكان ممكن يحصل فيه Race Condition.
- ➕ **Webhooks:** إزاي تتحقق منها (Signature)، وإزاي تتعامل معاها لو وصلت متكررة أو بترتيب غلط.
- ➕ **Reconciliation:** تطابق بياناتك مع بيانات بوابة الدفع.
- ➕ **Double-entry / Ledger design:** إزاي تسجّل الفلوس بحيث متضيعش أبدًا.
- **المصادر:** Stripe Docs (الجزء بتاع Webhooks وIdempotent requests)، ومقالات Stripe Engineering Blog.

#### 4. الـReal-time Synchronization والـMulti-Device Architecture
- 📌 **Multi-Device Architecture:** Web + Mobile + Desktop شغالين كأنهم تطبيق واحد.
- 📌 **Unified Backend** و **Single Source of Truth**.
- 📌 **Real-time Events** و **State Synchronization**.
- 📌 **Business Logic موحدة** بين كل الأجهزة، يعني الـLogic تبقى في الـBackend مش متكررة في كل Client.
- 📌 "جهاز عنده بيانات قديمة وجهاز تاني عنده أحدث Version": **Stale Data** و **Conflict Resolution**.
- 📌 "لو الإنترنت فصل على جهاز": **Offline-first / Offline Support**.
- ➕ **WebSockets vs Server-Sent Events vs Long Polling** وإمتى تستخدم كل واحد.
- ➕ **Optimistic UI** و Rollback لو السيرفر رفض العملية.
- ➕ **Conflict resolution strategies:** Last-Write-Wins (وعيوبه)، Versioning، وCRDTs.
- ➕ **الوقت والساعات:** متعتمدش على ساعة الجهاز. Server Time، وLamport Clocks / Vector Clocks. (ده بالظبط مفتاح مشكلة الـTimer).
- ➕ **Local-first software.**
- **المصادر:**
  - DDIA: فصول Replication و Consistency and Consensus.
  - سلسلة محاضرات *Distributed Systems* لـ Martin Kleppmann (جامعة Cambridge، مجانية على YouTube).
  - Ink & Switch: *Local-first software: You own your data, in spite of the cloud*.
  - crdt.tech (مدخل للـCRDTs).
  - *Falsehoods programmers believe about time*.
  - Firestore Docs: *Access data offline* و *Listen to realtime updates*.

#### 5. الـDatabase Migrations والـBackward Compatibility
- 📌 **Database Migrations** من غير Downtime ومن غير ما بيانات المستخدمين تبقى في خطر.
- 📌 **Backward Compatibility:** تضيف Features وتغيّر في الـArchitecture من غير ما تبوّظ حاجة شغالة.
- 📌 تعديل في الـBackend ممكن يكسر Feature على جهاز تاني: لازم تعرف تأثير أي تغيير على كل الـClients.
- ➕ **Expand / Contract (Parallel Change):** تضيف الجديد، تنقل، وبعدين تشيل القديم.
- ➕ **API Versioning** و **Semantic Versioning**، وإن نسخ الموبايل والديسكتوب القديمة بتفضل شغالة عند الناس شهور.
- ➕ **Feature Flags** عشان تطلق الحاجة الجديدة تدريجيًا.
- ➕ **Contract Testing** عشان تتأكد إن الـBackend لسه ماشي على اللي الـClients مستنياه.
- ➕ **Strangler Fig Pattern:** إزاي تغيّر Architecture شغالة حتة بحتة.
- **المصادر:**
  - martinfowler.com: *ParallelChange*، *Evolutionary Database Design*، *Feature Toggles* (Pete Hodgson)، *StranglerFigApplication*.
  - semver.org.
  - docs.pact.io (Contract Testing).

#### 6. الـEvents والـArchitecture
- ➕ **Event-driven architecture** و **Message Queues**.
- ➕ **Transactional Outbox Pattern:** تحفظ في الـDB وتبعت Event من غير ما واحدة تنجح والتانية تفشل.
- ➕ **Event Sourcing و CQRS:** تعرفهم وتعرف إمتى متستخدمهمش.
- ➕ **System Design basics:** Caching، Load Balancing، Scaling، Rate Limiting.
- **المصادر:**
  - microservices.io (Chris Richardson): Transactional Outbox و Saga.
  - *System Design Interview* لـ Alex Xu / ByteByteGo.

#### 7. Production Ready: Secure و Scalable و Reliable
- 📌 الكود اللي الـAI بيكتبه مش بالضرورة **Secure** أو **Scalable** أو **Production Ready**.
- ➕ **Security:** OWASP Top 10 و OWASP API Security Top 10، Authentication vs Authorization، وFirestore Security Rules.
- ➕ **Observability:** Logging و Metrics و Tracing، يعني تعرف إيه اللي بيحصل في Production.
- ➕ **Reliability:** Timeouts و Circuit Breakers و Graceful Degradation.
- ➕ **Testing:** Unit و Integration و E2E، واختبار سيناريوهات الـConcurrency بالذات.
- ➕ **CI/CD** و Backups و Rollback plan.
- **المصادر:**
  - كتاب *Release It!* لـ Michael Nygard.
  - كتاب Google *Site Reliability Engineering* (مجاني على sre.google/books).
  - كتاب *Observability Engineering* و OpenTelemetry Docs.
  - 12factor.net.
  - owasp.org.

#### 8. المهارة الأهم: تعرف إيه اللي محتاج يتعمل وإمتى وليه
- 📌 تعرف إيه المطلوب، وإمتى، وليه، وتتأكد إن الحل مش هيعمل مشكلة أكبر بعدين.
- 📌 تراجع كل تغيير وتأثيره على باقي الأجهزة.
- ➕ **Code Review للكود اللي الـAI كتبه:** إيه الأسئلة اللي تسألها لكل تغيير.
- ➕ **Trade-offs وTechnical Decisions:** وتكتب قراراتك في ADRs (Architecture Decision Records).
- ➕ **Failure thinking:** قبل ما تعمل أي Feature تسأل "إيه أسوأ حاجة ممكن تحصل هنا؟"

#### 🧪 تمرين عملي من البوست: صمّم Timer شغال على كذا جهاز
جاوب على الأسئلة دي بتصميم حقيقي (Schema + API + Events):
1. بدأت Timer من الموبايل، وفتحت اللابتوب بعدها. إزاي يكمل من غير ما يبدأ من الأول؟ (تلميح: احفظ `startedAt` بتوقيت السيرفر، متعدّش الثواني على الجهاز)
2. وقفته من الـDesktop. إزاي التغيير يوصل للموبايل والويب؟
3. النت فصل على جهاز. إيه اللي يحصل، وإيه اللي يحصل لما يرجع؟
4. اتبدأ Timer تاني من جهاز مختلف في نفس اللحظة. مين يكسب؟
5. الـRequest اتبعت مرتين. إزاي تمنع إنه يتنفذ مرتين؟
6. جهاز عنده Version قديمة من التطبيق والـBackend اتغير. إزاي متكسرهوش؟

### من بوست Mahmoud Adel (Foodics): "إزاي تبني مهندس برمجيات"
المصدر: https://monstersgate.com/ar/tips/17/azay-tbny-mhnds-brmgyat-ao-software-engineer

الفكرة الأساسية: عشان توجّه الـAI وتحكم على قراراته محتاج تكون مهندس مش مبرمج حافظ كود. والخطة بتبدأ من فهم المطلوب، وبعدها الأرقام، وبعدها التصميم، ومع كل خطوة تكتب قراراتك.

#### 9. استخراج الـRequirements
- 📌 تطلع الـRequirements من الـTask صح.
- 📌 **Functional Requirements:** السيستم المفروض يعمل إيه.
- 📌 **Non-Functional Requirements:** السيستم المفروض يكون عامل إزاي (سرعة، تحمّل، أمان...).
- 📌 **Out-of-Scope Requirements:** إيه اللي مش هنعمله دلوقتي، ونكتبه صراحةً.
- ➕ **Clarifying Questions:** تسأل قبل ما تصمم. مين المستخدمين؟ كام واحد؟ إيه أهم Use Case؟
- ➕ أشهر الـNFRs: Availability، Latency، Consistency، Scalability، Durability، Security، وإمتى تضحي بواحدة عشان التانية.
- ➕ **SLA / SLO / SLI:** إزاي تحوّل "السيستم لازم يبقى سريع" لرقم تقدر تقيسه.
- ➕ **User Stories و Acceptance Criteria.**
- **المصادر:**
  - كتاب *Software Requirements* لـ Karl Wiegers.
  - كتاب Google *Site Reliability Engineering*: الفصل بتاع Service Level Objectives.

#### 10. الـCapacity Estimation (Back-of-the-envelope)
- 📌 تحسب **Read / Write Per Second** لمليون مستخدم.
- 📌 تحسب احتياج الـ**Storage** على مدار 5 سنين (البوست افترض 500 بايت).
- 📌 تحسب الـ**Bandwidth In / Out**.
- ➕ **Read/Write Ratio** و **Peak vs Average Traffic**: السيستم بيتصمم على الذروة مش على المتوسط.
- ➕ أرقام لازم تبقى حافظها: *Latency Numbers Every Programmer Should Know*، وPowers of Two (KB / MB / GB / TB)، وإن اليوم ≈ 100 ألف ثانية تقريبًا.
- ➕ إزاي الأرقام دي تحدد القرار: محتاج Cache؟ Sharding؟ CDN؟ كام Server؟
- **مثال محلول عشان تفهم الفكرة:** مليون مستخدم يومي، كل واحد بيعمل 10 Writes و50 Reads في اليوم:
  - Writes = 10 مليون ÷ 86,400 ≈ **116 / ثانية** (وفي الذروة × 3 ≈ 350).
  - Reads = 50 مليون ÷ 86,400 ≈ **580 / ثانية**.
  - Storage لو كل Write بـ 500 بايت: 10 مليون × 500B = 5GB في اليوم، × 365 × 5 ≈ **9 TB** في 5 سنين.
  - Bandwidth In ≈ 116 × 500B ≈ 58 KB/s، والـOut بيتحسب بنفس الطريقة من الـReads.
- **المصادر:**
  - كتاب *System Design Interview* لـ Alex Xu، الجزء الأول، فصل *Back-of-the-envelope Estimation*.
  - *Latency Numbers Every Programmer Should Know* (أرقام Jeff Dean).
  - GitHub: *donnemartin/system-design-primer*.

#### 11. الـHLD (High-Level Design)
- 📌 تعمل **HLD Diagram** فيه Components السيستم.
- 📌 **Request Flow:** الطلب بيمشي إزاي من المستخدم لحد الـDB وبيرجع.
- 📌 **Sequence Diagram.**
- 📌 تقدر تشرح كل **Component** موجود في السيستم ودوره.
- 📌 **Coupling** بين الـComponents.
- ➕ **Cohesion:** الوش التاني للـCoupling (High Cohesion + Low Coupling).
- ➕ **HLD vs LLD:** الصورة الكبيرة مقابل تفاصيل الـClasses والـAPIs والـSchema.
- ➕ مكونات أساسية لازم تعرفها: Load Balancer، API Gateway، Cache، CDN، Message Queue، Database (SQL vs NoSQL)، Object Storage.
- ➕ **CAP و PACELC:** أساس الـTrade-offs في الأنظمة الموزعة.
- ➕ **C4 Model:** طريقة منظمة ترسم بيها الـArchitecture على مستويات.
- ➕ أدوات الرسم كـCode: **Mermaid** و **PlantUML**.
- ➕ تمرّن على تصميمات مشهورة: URL Shortener، Chat App، News Feed، Rate Limiter، Notification System.
- **المصادر:**
  - المصدر اللي في البوست: *System Design Tutorial*، GeeksforGeeks: https://www.geeksforgeeks.org/system-design/system-design-tutorial/
  - GitHub: *donnemartin/system-design-primer*.
  - كتاب *System Design Interview* (الجزء 1 و 2) لـ Alex Xu.
  - كتاب *Fundamentals of Software Architecture* لـ Mark Richards و Neal Ford.
  - c4model.com.
  - Hello Interview (أدلة System Design).

#### 12. الـKey Decisions والتفكير كمهندس
- 📌 آخر أي خطة تكتب الـ**Key Decisions**: كل قرار خدته وليه.
- 📌 توجيه الـAI والحكم على قراراته محتاج مهندس مش مبرمج حافظ كود (نفس فكرة رقم 8).
- ➕ **ADRs (Architecture Decision Records):** شكل ثابت لكتابة القرار: السياق، القرار، البدائل، والنتايج.
- ➕ لكل قرار تكتب البدائل اللي رفضتها وليه، والـTrade-off اللي قبلته.
- **المصادر:** adr.github.io، ومقالة Michael Nygard *Documenting Architecture Decisions*.

#### 🧪 تمرين عملي من البوست: طبّق الخطة على سيستم حقيقي
خد Taskatk (Timer على كذا جهاز) أو El-Behery-CRM وامشي على نفس الخطة:
1. اكتب الـFunctional والـNon-Functional والـOut-of-Scope.
2. احسب RPS والـStorage على 5 سنين والـBandwidth لمليون مستخدم.
3. ارسم HLD + Request Flow + Sequence Diagram لعملية واحدة مهمة (مثلًا Start Timer).
4. اشرح كل Component، وإيه الـCoupling بينهم.
5. اكتب الـKey Decisions بالبدائل والـTrade-offs.

---

## 🗂️ التصنيفات (بنرتب فيها حاجات الـ Inbox مع الوقت)

_لسه فاضية. هتتملى لما يتجمع عندنا كفاية مواضيع._

---

## 🗺️ Roadmap

_هتتعمل بعد ما المواضيع تتصنف: ترتيب المذاكرة، الأولويات، والمصادر لكل مرحلة._

---

## ✅ اتذاكر

_المواضيع اللي خلصت تتنقل هنا (من غير ما تتمسح)._
