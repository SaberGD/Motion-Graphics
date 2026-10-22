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

---

## 🗂️ التصنيفات (بنرتب فيها حاجات الـ Inbox مع الوقت)

_لسه فاضية. هتتملى لما يتجمع عندنا كفاية مواضيع._

---

## 🗺️ Roadmap

_هتتعمل بعد ما المواضيع تتصنف: ترتيب المذاكرة، الأولويات، والمصادر لكل مرحلة._

---

## ✅ اتذاكر

_المواضيع اللي خلصت تتنقل هنا (من غير ما تتمسح)._
