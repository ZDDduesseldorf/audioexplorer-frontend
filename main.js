// main.js — نقطه ورود و هماهنگ‌کننده اصلی کل پروژه

import { generateData, LABEL_COLORS, LABELS } from './data.js';
import { ScatterPlot } from './scatter.js';
import { RightPanel } from './panel.js';
import { FilterPanel } from './filters.js';

// ۱. تولید داده‌های اولیه صوتی
const points = generateData();

// ۲. ساخت انیمیشن موجی شکل لوپ در هدر بالای برنامه (Logo Wave)
(function buildHeaderWave() {
    const wrap = document.getElementById('header-wave');
    if (!wrap) return;
    const heights = [4, 7, 12, 9, 14, 10, 6, 14, 8, 11, 5, 9, 13, 7, 10];
    heights.forEach((h, i) => {
        const bar = document.createElement('div');
        bar.className = 'bar';
        bar.style.height = h + 'px';
        bar.style.animationDelay = (i * 0.09) + 's';
        wrap.appendChild(bar);
    });
})();

// ۳. راه‌اندازی بوم نقشه دو بعدی (Scatter Plot)
const scatter = new ScatterPlot(
    document.getElementById('scatter'),
    document.getElementById('mini-canvas')
);
scatter.setPoints(points);

// ۴. راه‌اندازی پنل جزئیات سمت راست (Right Panel)
const rightPanel = new RightPanel();
rightPanel.update(null); // در ابتدا هیچ نقطه‌ای انتخاب نشده است

// ۵. راه‌اندازی پنل فیلترهای سمت چپ (Filter Panel)
const filterPanel = new FilterPanel(points);

// اتصال تغییرات فیلترها به نقشه اصلی برای اعمال زنده تغییرات
filterPanel.onChange = ({ visibleLabels, showLabeled, showUnlabeled, search }) => {
    scatter.visibleLabels = visibleLabels;
    scatter.showLabeled = showLabeled;
    scatter.showUnlabeled = showUnlabeled;
    scatter.searchTerm = search;
    scatter.draw(); // رندر مجدد نقشه با فیلترهای جدید
};

// شاخص برای رهگیری نقطه انتخاب شده فعلی در پیمایش‌ها
let currentIndex = 0;

// اتصال رویداد کلیک روی نقاط نقشه به پنل سمت راست
scatter.onSelect = (p) => {
    if (p) {
        currentIndex = points.indexOf(p);
    }
    rightPanel.update(p);
};

// ۶. منطق دکمه Next (رفتن به نمونه صوتی بعدی که فیلتر نشده است)
rightPanel.onNext = () => {
    const visible = points.filter(p => scatter._visible(p));
    if (!visible.length) return;

    currentIndex = (currentIndex + 1) % visible.length;
    const nextPoint = visible[currentIndex];

    scatter.selected = nextPoint;
    scatter.draw();
    rightPanel.update(nextPoint);
};

// ۷. منطق دکمه Confirm (ثبت یا تغییر لِیبل و کامنت یک فایل صوتی)
rightPanel.onConfirm = (label, note) => {
    const p = scatter.selected;
    if (!p || !label) return;

    // اگر کاربر یک لیبل کاملاً جدید تایپ کرده باشد، آن را به سیستم اضافه کن
    if (!LABELS.includes(label) && !Object.keys(LABEL_COLORS).includes(label)) {
        const hue = Math.floor(Math.random() * 360);
        const color = `hsl(${hue}, 70%, 60%)`;
        LABEL_COLORS[label] = color;
        LABELS.push(label);
        rightPanel.addLabel(label, color);
    }

    // اعمال تغییرات روی خود نقطه داده
    p.label = label;
    p.annotated = true;
    p.note = note;

    // به‌روزرسانی زنده تمام بخش‌های برنامه
    filterPanel.rebuild(points);
    scatter.draw();
    rightPanel.update(p);
    updateHeaderStats();
    setFooterStatus(`Saved label "${label}" for #${p.sampleId}`);
};

// ۸. آمار زنده در هدر
function updateHeaderStats() {
    const total = points.length;
    const labeled = points.filter(p => p.annotated).length;
    const hdrTotal = document.getElementById('hdr-total');
    const hdrLabeled = document.getElementById('hdr-labeled');
    if (hdrTotal) hdrTotal.textContent = `${total} samples`;
    if (hdrLabeled) hdrLabeled.textContent = `${labeled} labeled`;
}
updateHeaderStats();

// ۹. وضعیت پایین صفحه (Footer Status)
function setFooterStatus(text) {
    const el = document.getElementById('footer-status');
    if (el) el.textContent = text;
}

// ۱۰. دکمه‌های navigation در هدر
document.querySelectorAll('.nav-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('nav-btn-active'));
        btn.classList.add('nav-btn-active');
        setFooterStatus(`View: ${btn.dataset.view}`);
    });
});

// ۱۱. دکمه X برای بستن پنل فیلترها
const filterPanel2 = document.getElementById('filter-panel');
const filterToggle = document.getElementById('filter-toggle');
if (filterToggle && filterPanel2) {
    filterToggle.addEventListener('click', () => {
        filterPanel2.classList.toggle('panel-hidden');
        scatter.draw();
    });
}

// ۱۲. تعریف کلیدهای میانبر کیبورد (Keyboard Shortcuts)
document.addEventListener('keydown', e => {
    // اگر کاربر در حال تایپ درون باکس کامنت یا سرچ است، کلیدهای میانبر کار نکنند
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.tagName === 'SELECT') return;

    // کلید جهت راست یا کلید N روی کیبورد = رفتن به فایل بعدی
    if (e.key === 'ArrowRight' || e.key === 'n') {
        rightPanel.onNext();
    }
});