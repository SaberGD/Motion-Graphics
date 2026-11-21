// FAKE demo data for promo screenshots. Every name, number and link here is invented.
const ts = (iso: string) => ({ __ts: Date.parse(iso) });

export const DEMO_STUDENT = {
  id: 'demo-student-1',
  name: 'أحمد محمد',
  phone: '+201000000000',
  email: 'ahmed.demo@gmail.com',
  groupId: 'demo-group-1',
  studentIdNum: '48213',
  createdAt: ts('2026-10-01T10:00:00Z'),
  hasLoggedIn: true,
  loginCount: 23,
  tasksLink: 'https://t.me/demo_tasks',
  referralCode: 'AHMED15',
  referralUsedByName: '',
};

const GROUP_ID = DEMO_STUDENT.groupId;
const SID = DEMO_STUDENT.id;

const GROUP = {
  name: 'GD-27',
  courseId: 'demo-course-gd',
  courseName: 'الجرافيك ديزاين',
  startDate: '2026-10-07',
  daysOfWeek: ['الأحد', 'الأربعاء'],
  totalSessions: 16,
  sessionTime: '19:00',
  trainerIds: ['demo-trainer-1'],
  primaryTrainerId: 'demo-trainer-1',
  primaryTrainerName: 'م. محمد',
  createdAt: ts('2026-09-20T10:00:00Z'),
  archived: false,
  telegramLink: 'https://t.me/demo_group',
  telegramRecordsLink: 'https://t.me/demo_records',
  whatsappLink: 'https://chat.whatsapp.com/demo',
  groupType: 'online',
  batchCode: 'GD-27',
  certificatesVisibleToStudents: true,
};

const LECTURES: [string, string][] = [
  ['2026-10-07', 'مقدمة في الجرافيك ديزاين وأساسيات التصميم'],
  ['2026-10-11', 'نظرية الألوان وبناء الباليت'],
  ['2026-10-14', 'التايبوجرافي واختيار الخطوط'],
  ['2026-10-18', 'أساسيات Adobe Photoshop'],
  ['2026-10-21', 'الطبقات والماسك في Photoshop'],
  ['2026-10-25', 'الريتاتش والتعديل على الصور'],
  ['2026-10-28', 'أساسيات Adobe Illustrator'],
  ['2026-11-01', 'أدوات الرسم والـ Pen Tool'],
  ['2026-11-04', 'تصميم اللوجو من الفكرة للتنفيذ'],
  ['2026-11-08', 'الهوية البصرية (Brand Identity)'],
  ['2026-11-11', 'تصميم بوستات السوشيال ميديا'],
  ['2026-11-15', 'أدوات الذكاء الاصطناعي في التصميم'],
  ['2026-11-18', 'تجهيز البورتفوليو وعرض الشغل'],
  ['2026-11-22', 'الـ Mockups وعرض المشروع'],
  ['2026-11-25', 'مراجعة مشروع التخرج'],
  ['2026-11-29', 'مناقشة مشاريع التخرج'],
];
const DONE = 13;

const TASKS: string[] = [
  'اختار 3 تصميمات بتحبها وحلّل فيهم التوازن والمحاذاة والمساحات الفاضية.',
  'اعمل باليت ألوان من 5 درجات لبراند قهوة، ووضّح استخدام كل لون.',
  'صمّم بوستر بخطين بس (عنوان + نص) وراعي التسلسل البصري.',
  'اعمل كولاج من 3 صور بالـ Layers والـ Blending Modes.',
  'افصل منتج عن الخلفية بالـ Mask وحطه على خلفية جديدة.',
  'ريتاتش لصورة بورتريه: تنعيم البشرة وتعديل الإضاءة.',
  'ارسم 5 أيقونات بسيطة بالأشكال الأساسية في Illustrator.',
  'ارسم لوجو حرف بالـ Pen Tool بخطوط نضيفة.',
  'اعمل 3 اسكتشات للوجو براند وهمي واختار واحد ونفّذه.',
  'جهّز Brand Board: لوجو، ألوان، خطوط، وأمثلة استخدام.',
  'صمّم 3 بوستات سوشيال ميديا بنفس الهوية.',
  'استخدم أداة AI تطلع منها خلفية، وكمّل عليها التصميم يدوي.',
  'جهّز صفحة Behance فيها أحسن 3 شغلات عملتهم.',
];
const TRAINER_NOTES: string[] = [
  'بداية ممتازة، عينك بتلقط التفاصيل كويس.',
  'اختيار الألوان موفق، حاول تقلل عدد الدرجات الفاتحة.',
  'التسلسل البصري واضح، العنوان محتاج مساحة أكبر حواليه.',
  'شغل نضيف، خلي بالك من ترتيب الـ Layers وتسميتها.',
  'الماسك مظبوط، بس الحواف محتاجة Feather بسيط.',
  'سلّمت التاسك متأخر، الشغل نفسه كويس.',
  'الأيقونات متناسقة، ثبّت سُمك الخط في الكل.',
  'تحكم ممتاز في الـ Pen Tool 👏',
  'الفكرة قوية، جرّب نسخة أبسط من اللوجو للمقاسات الصغيرة.',
  'الـ Brand Board منظم جداً، ده مستوى شغل حقيقي.',
  'البوستات متناسقة، زوّد التباين في النص على الصور.',
  'استخدام الـ AI في مكانه الصح، وكمّلت عليه بإيدك 👌',
  'البورتفوليو بقى شكله احترافي، كمّل كده.',
];

const sessions: Record<string, any> = {};
const sessionMeta: Record<string, any> = {};
const lectureEvaluations: Record<string, any> = {};

let lecturePoints = 0;
LECTURES.forEach(([date, title], i) => {
  const n = i + 1;
  const id = `demo-session-${n}`;
  const done = n <= DONE;
  const required = n === 1 || n === 13 ? 1 : 2;
  sessions[id] = {
    groupId: GROUP_ID, sessionNumber: n, date, lectureTitle: title,
    status: done ? 'done' : 'upcoming', requiredTasksCount: required,
    createdAt: ts('2026-09-20T10:00:00Z'),
    ...(done ? { lectureRecordingUrl: `https://t.me/demo_records/${100 + n}`, tasksMessageUrl: 'https://t.me/demo_tasks' } : {}),
  };
  if (!done) return;
  sessionMeta[`meta-${n}`] = {
    groupId: GROUP_ID, sessionId: id, sessionNumber: n,
    lectureNotes: `ملخص المحاضرة ${n}: ${title}.`,
    taskInstructions: TASKS[i],
    opsChecklist: { recordingUploaded: true, taskSent: true, whatsappConfirmationSent: true },
    lastUpdatedAt: ts(`${date}T21:00:00Z`), lastUpdatedByUid: 'demo-trainer-1', lastUpdatedByName: 'م. محمد', lastUpdatedByRole: 'trainer',
    revision: { revisioned: false },
  };
  const absent = n === 6;
  const ev = {
    groupId: GROUP_ID, studentId: SID, sessionNumber: n, sessionId: id, evaluatorId: 'demo-trainer-1',
    attendance: absent ? 0 : 1,
    taskDelivered: n === 9 ? 1 : required,
    taskOnTime: absent ? 0 : 1,
    taskQuality: n === 6 || n === 3 ? 0 : 1,
    taskRedo: 0,
    bonus: [2, 8, 10, 12, 13].includes(n) ? 1 : 0,
    trainerNote: TRAINER_NOTES[i],
    updatedAt: ts(`${date}T22:00:00Z`),
  };
  (ev as any).total = ev.attendance + ev.bonus + ev.taskDelivered + ev.taskOnTime + ev.taskQuality + ev.taskRedo;
  lecturePoints += (ev as any).total;
  lectureEvaluations[`${GROUP_ID}_${id}_${SID}`] = ev;
});

const penalties = {
  'pen-1': { groupId: GROUP_ID, studentId: SID, points: 2, reason: 'تأخير تسليم تطبيق المحاضرة 6', createdAt: ts('2026-10-27T10:00:00Z') },
  'pen-2': { groupId: GROUP_ID, studentId: SID, points: 1, reason: 'دخول متأخر عن موعد المحاضرة', createdAt: ts('2026-11-04T17:30:00Z') },
};
const penaltyTotal = 3;
export const DEMO_POINTS = Math.max(0, lecturePoints - penaltyTotal);

// 12 students in the group; the demo student is 2nd.
const CLASSMATES = ['يوسف علي', 'أحمد محمد', 'مريم حسن', 'عمر خالد', 'سارة إبراهيم', 'كريم مصطفى', 'نور أحمد', 'مازن طارق', 'هنا سمير', 'زياد وليد', 'ملك عادل', 'آدم شريف'];
const OFFSETS = [5, 0, -3, -6, -8, -11, -13, -15, -18, -21, -24, -28];
const groupRankings: Record<string, any> = {};
CLASSMATES.forEach((name, i) => {
  const studentId = i === 1 ? SID : `demo-classmate-${i}`;
  const finalScore = DEMO_POINTS + OFFSETS[i];
  groupRankings[`rank-${i}`] = { groupId: GROUP_ID, studentId, studentName: name, lectureTotal: finalScore + (i === 1 ? penaltyTotal : 0), projectScore: 0, penaltiesTotal: i === 1 ? penaltyTotal : 0, finalScore, updatedAt: ts('2026-11-19T08:00:00Z') };
});
export const DEMO_RANK_GAP = OFFSETS[0];

const PROJECT_ID = 'demo-grad-project-1';
export const FIXTURE: Record<string, Record<string, any>> = {
  students: { [SID]: DEMO_STUDENT },
  groups: { [GROUP_ID]: GROUP },
  portalAccounts: { 'demo-account': { activeSessionId: 'demo-session', suspended: false } },
  sessions,
  sessionMeta,
  lectureEvaluations,
  penalties,
  groupRankings,
  studentWeaknesses: {
    'weak-1': { studentId: SID, groupId: GROUP_ID, description: 'المسافات بين العناصر (Spacing) مش ثابتة في نفس التصميم. استخدم Grid وثبّت المسافات.', resolved: false, createdAt: ts('2026-11-12T10:00:00Z'), createdByUid: 'demo-trainer-1', createdByName: 'م. محمد', sessionNumber: 11, visibleToStudent: true },
    'weak-2': { studentId: SID, groupId: GROUP_ID, description: 'التباين بين لون النص والخلفية ضعيف في بعض البوستات، فالكلام بيتقري بصعوبة.', resolved: false, createdAt: ts('2026-11-16T10:00:00Z'), createdByUid: 'demo-trainer-1', createdByName: 'م. محمد', sessionNumber: 12, visibleToStudent: true },
    'weak-3': { studentId: SID, groupId: GROUP_ID, description: 'تسمية وترتيب الـ Layers في ملفات الفوتوشوب.', resolved: true, createdAt: ts('2026-10-19T10:00:00Z'), createdByUid: 'demo-trainer-1', createdByName: 'م. محمد', resolvedByName: 'م. محمد', resolvedAt: ts('2026-10-29T10:00:00Z'), sessionNumber: 4, visibleToStudent: true },
  },
  graduationProjects: {
    [PROJECT_ID]: {
      groupId: GROUP_ID, groupName: GROUP.name, courseName: GROUP.courseName,
      title: 'مشروع التخرج: هوية بصرية كاملة لبراند قهوة',
      brandName: 'Demo Coffee',
      description: 'صمّم هوية بصرية متكاملة لبراند قهوة جديد (اسم وهمي): لوجو، باليت ألوان، خطوط، و6 بوستات سوشيال ميديا، وموكاب للمنتج.',
      requirements: 'لوجو بنسخه (أساسي + مختصر)\nBrand Board بالألوان والخطوط\n6 بوستات سوشيال ميديا\n2 Mockups للمنتج',
      rules: 'التسليم على Google Drive والرابط مفتوح للمشاهدة\nارفع الملفات المفتوحة (PSD / AI)\nممنوع استخدام تصميمات جاهزة',
      telegramChannelLink: 'https://t.me/demo_project',
      submissionGuideVideoLink: 'https://t.me/demo_project/2',
      startDate: '2026-11-08', endDate: '2026-12-06',
      createdAt: ts('2026-11-08T10:00:00Z'), createdByUid: 'demo-trainer-1', createdByName: 'م. محمد',
      status: 'published',
    },
  },
  graduationSubmissions: {
    [`${PROJECT_ID}_${SID}`]: {
      id: `${PROJECT_ID}_${SID}`, projectId: PROJECT_ID, groupId: GROUP_ID, studentId: SID, studentName: DEMO_STUDENT.name, studentIdNum: DEMO_STUDENT.studentIdNum,
      driveLink: 'https://drive.google.com/demo-folder', checkConfirmedOpen: true, checkUploadedEditableFiles: true, checkReadRules: true,
      submittedAt: '2026-11-16T18:30:00.000Z', updatedAt: ts('2026-11-16T18:30:00Z'),
    },
  },
  graduationEvaluations: {
    'demo-eval-1': {
      projectId: PROJECT_ID, groupId: GROUP_ID, studentId: SID, studentName: DEMO_STUDENT.name,
      c1_submission: 2, c2_noPixelatedNoSizeErr: 2, c3_typography: 1.5, c4_aiUsage: 2, c5_reference: 1.5, c6_completeFilesOpenLinks: 2,
      bonusPoints: 1, deductionPoints: 0, isExtraWorkshopsEligible: true, isRejected: false, totalScore: 19.3,
      evaluatedByUid: 'demo-trainer-1', evaluatedByName: 'م. محمد', evaluatedAt: ts('2026-11-19T12:00:00Z'),
      generalNotes: 'مشروع قوي جداً يا أحمد 👏 الهوية متماسكة والبوستات شبه بعض في الروح. ركّز بس على الخطوط في المقاسات الصغيرة.',
      updatedAt: ts('2026-11-19T12:00:00Z'),
    },
  },
  graduationComments: {
    'demo-com-1': { projectId: PROJECT_ID, studentId: SID, groupId: GROUP_ID, title: 'اللوجو', comment: 'النسخة المختصرة من اللوجو ممتازة. جرّب تقلّل سُمك الخط شوية في النسخة الأساسية.', designLink: 'https://drive.google.com/demo-logo', createdAt: ts('2026-11-19T12:05:00Z'), createdByName: 'م. محمد' },
    'demo-com-2': { projectId: PROJECT_ID, studentId: SID, groupId: GROUP_ID, title: 'بوستات السوشيال', comment: 'التباين في البوست الرابع محتاج يزيد، والباقي مظبوط جداً.', createdAt: ts('2026-11-19T12:10:00Z'), createdByName: 'م. محمد' },
  },
  studentCertificates: {
    [`${GROUP_ID}_${SID}`]: { groupId: GROUP_ID, studentId: SID, studentName: DEMO_STUDENT.name, statusOverride: 'none', certificateUrl: 'https://example.com/demo-certificate.pdf', updatedAt: ts('2026-11-20T10:00:00Z') },
  },
  notifications: {
    'n-1': { userId: SID, title: 'تقييم مشروع التخرج نزل 🎓', message: 'م. محمد قيّم مشروعك: 18.3 / 20 + 1 بونص. افتح «المشروع» وشوف الملاحظات.', type: 'task_review', read: false, createdAt: ts('2026-11-19T12:15:00Z') },
    'n-2': { userId: SID, title: 'تسجيل المحاضرة 13 متاح', message: 'تسجيل «تجهيز البورتفوليو وعرض الشغل» اترفع على قناة التسجيلات.', type: 'task_status', read: false, createdAt: ts('2026-11-18T20:40:00Z') },
    'n-3': { userId: SID, title: 'تذكير: المحاضرة 14 بكرة', message: 'الـ Mockups وعرض المشروع، الساعة 7:00 مساءً.', type: 'task_deadline', read: false, createdAt: ts('2026-11-21T09:00:00Z') },
    'n-4': { userId: SID, title: 'تم تقييم تطبيق المحاضرة 12', message: 'استخدام الـ AI في مكانه الصح، وكمّلت عليه بإيدك 👌', type: 'task_review', read: true, createdAt: ts('2026-11-16T11:00:00Z') },
  },
  global_eval_forms: {},
};
