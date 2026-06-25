// data.js — تولید داده‌های صوتی شبیه‌سازی شده

// ۱. تعریف رنگ مخصوص هر کلاس صوتی
export const LABEL_COLORS = {
    cry:       '#4a90d9', // آبی
    laugh:     '#8b5cf6', // بنفش
    screaming: '#ef4444', // قرمز
    sigh:      '#10b981', // سبز
    gasp:      '#f59e0b', // نارنجی
    moan:      '#ec4899', // صورتی
    unlabeled: 'rgba(140,145,170,0.4)', // خاکستری برای بدون لیبل‌ها
};

// ۲. لیست آرایه لیبل‌های استاندارد پروژه
export const LABELS = ['cry', 'laugh', 'screaming', 'sigh', 'gasp', 'moan'];

// ۳. تعریف مرکز و اندازه هر خوشه روی نقشه برای طبیعی شدن خروجی
const CLUSTER_DEFS = [
    { label: 'cry',       cx: 0.20, cy: 0.35, rx: 0.10, ry: 0.09, n: 400 },
    { label: 'laugh',     cx: 0.53, cy: 0.20, rx: 0.08, ry: 0.07, n: 400 },
    { label: 'screaming', cx: 0.76, cy: 0.32, rx: 0.07, ry: 0.08, n: 400 },
    { label: 'sigh',      cx: 0.72, cy: 0.65, rx: 0.09, ry: 0.08, n: 300 },
    { label: 'gasp',      cx: 0.42, cy: 0.72, rx: 0.08, ry: 0.09, n: 300 },
    { label: 'moan',      cx: 0.60, cy: 0.50, rx: 0.06, ry: 0.07, n: 200 },
    { label: 'unlabeled', cx: 0.33, cy: 0.55, rx: 0.13, ry: 0.11, n: 280 },
];

// ۴. فرمول ریاضی برای ایجاد پراکندگی طبیعی (توزیع گاوسی)
function gauss() {
    let u = 0, v = 0;
    while (u === 0) u = Math.random();
    while (v === 0) v = Math.random();
    return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
}

// ۵. تولید تاریخ تصادفی برای جزییات فایل
function randDate() {
    const d = String(Math.floor(Math.random() * 28) + 1).padStart(2, '0');
    const m = String(Math.floor(Math.random() * 12) + 1).padStart(2, '0');
    const y = 2024 + Math.floor(Math.random() * 3);
    return `${d}.${m}.${y}`;
}

// ۶. تولید نام فایل صوتی تصادفی
function randFile(label) {
    const n = Math.floor(Math.random() * 9000) + 1000;
    return `${label || 'unlabeled'}_${n}.wav`;
}

// ۷. تابع اصلی که فراخوانی می‌شود و کل آرایه نقاط را می‌سازد
export function generateData() {
    const points = [];
    let idCounter = 10243;

    CLUSTER_DEFS.forEach(c => {
        const isUnlabeled = c.label === 'unlabeled';
        for (let i = 0; i < c.n; i++) {
            // اعمال فرمول گاوسی روی مختصات X و Y نقاط
            const px = c.cx + gauss() * c.rx;
            const py = c.cy + gauss() * c.ry;

            // حذف نقاطی که خارج از کادر نقشه می‌افتند
            if (px < 0.02 || px > 0.98 || py < 0.02 || py > 0.98) continue;

            // هل دادن مشخصات کامل نقطه صوتی به داخل آرایه اصلی
            points.push({
                id: String(idCounter++),
                x: px,
                y: py,
                label: isUnlabeled ? '' : c.label,
                annotated: !isUnlabeled,
                filename: randFile(isUnlabeled ? '' : c.label),
                date: randDate(),
                duration: (1.2 + Math.random() * 4.5).toFixed(1) + 's',
                note: '',
                // تولید درصد آنومالی (داده پرت) فرضی برای الگوریتم‌ها
                isolationForest: Math.floor(15 + Math.random() * 75),
                lof: Math.floor(20 + Math.random() * 70),
            });
        }
    });
    return points;
}