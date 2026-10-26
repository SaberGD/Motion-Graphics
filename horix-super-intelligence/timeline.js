// HORIX SUPER INTELLIGENCE, 35 s, 1920×1080, 30 fps (1050 frames). Scene times follow the
// production kit's storyboard (HORIX_PRODUCTION_KIT_AR.md); intervals are end-exclusive.
// copy = the scene's on-screen headline (storyboard_timeline.csv); vo = the line for the voice-over. Asset ids are the kit's: R = real screenshot,
// G = generated background, B = original brand file.
const FPS = 30;
const DURATION = 35;
const SCENES = [
  { id: "S01", vo: "فكرتك تستاهل تنطلق.", t0: 0, t1: 3, copy: "فكرتك تستاهل *تنطلق", bg: "G01" },
  { id: "S02", vo: "مع هوريكس… وسّع رؤيتك.", t0: 3, t1: 6, copy: "وسّع *رؤيتك", bg: "G03" },
  { id: "S03", vo: "للصور والتصميم، اشتغل على اللايرات وأدق التفاصيل.", t0: 6, t1: 11, copy: "صور. لايرات. *تفاصيل.", bg: "G02", name: "HORIX", shots: [["R01", 6], ["R02", 8.2]] },
  { id: "S04", vo: "ارسم مساراتك، وخلي كل خط ليه معنى.", t0: 11, t1: 15, copy: "كل خط *ليه معنى", bg: "G02", name: "Horix Vectors", shots: [["R03", 11], ["R13", 13]] },
  { id: "S05", vo: "ظبّط النور والألوان، وطلّع إحساس الصورة.", t0: 15, t1: 19, copy: "النور يغيّر *الإحساس", bg: "G02", name: "Horix Light", shots: [["R05", 15], ["R11", 15.6]] },
  { id: "S06", vo: "ونسّق صفحاتك… من أول عنوان لآخر تفصيلة.", t0: 19, t1: 23, copy: "من أول عنوان *لآخر تفصيلة", bg: "G02", name: "Horix Layout", shots: [["R07", 19], ["R08", 19.8]] },
  { id: "S07", vo: "ومع هوريكس وَن… بدّل بين الفيكتور والبيكسل، في برنامج واحد.", t0: 23, t1: 28, copy: "Vector\u00a0+\u00a0Pixel / *برنامج واحد", bg: "G02", name: "HORIX One", shots: [["R09", 23], ["R10", 25.3]], badge: "واجهتان من البرنامج" },
  { id: "S08", vo: "هوريكس. سوبر إنتليجنس.", t0: 28, t1: 31, copy: "SUPER INTELLIGENCE", bg: "G02" },
  { id: "S09", vo: "ابدأ فكرتك دلوقتي… على هوريكس دوت إس آي.", t0: 31, t1: 35, copy: "ابدأ فكرتك *دلوقتي", bg: "G03", cta: "جرّب من المتصفح أو حمّل لجهازك" },
];
// the five family cards in S08 (name, screenshot)
const FAMILY = [["HORIX", "R01"], ["Horix Vectors", "R03"], ["Horix Light", "R05"], ["Horix Layout", "R07"], ["HORIX One", "R09"]];
