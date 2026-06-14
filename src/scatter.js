// scatter.js — مدیریت بوم نقشه و مینی‌مپ

import { LABEL_COLORS } from './data.js';

export class ScatterPlot {
    constructor(canvas, miniCanvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.mini = miniCanvas;
        this.mctx = miniCanvas.getContext('2d');

        this.points = [];
        this.visibleLabels = new Set();
        this.showLabeled = true;
        this.showUnlabeled = true;
        this.searchTerm = '';
        this.selected = null;

        // متغیرهای مربوط به زوم و جابجایی نقشه
        this.scale = 1;
        this.offsetX = 0;
        this.offsetY = 0;

        this._dragging = false;
        this._dragStartX = 0;
        this._dragStartY = 0;

        this._bindEvents();

        // هماهنگ کردن خودکار اندازه نقشه با بزرگ و کوچک شدن پنجره مرورگر
        this._ro = new ResizeObserver(() => this._resize());
        this._ro.observe(canvas.parentElement);
        this._resize();
    }

    // دریافت نقاط از دیتا و رندر اولیه
    setPoints(pts) {
        this.points = pts;
        this.visibleLabels = new Set(pts.map(p => p.label || 'unlabeled'));
        this.draw();
    }

    // تبدیل مختصات ریاضی (بین ۰ و ۱) به مختصات واقعی پیکسل‌های صفحه نمایش
    _toScreen(px, py) {
        const W = this.canvas.width, H = this.canvas.height;
        return {
            x: px * W * this.scale + this.offsetX,
            y: py * H * this.scale + this.offsetY
        };
    }

    // تبدیل پیکسلی که کاربر روش کلیک کرده به مختصات ریاضی نقشه
    _toLocal(sx, sy) {
        const W = this.canvas.width, H = this.canvas.height;
        return {
            x: (sx - this.offsetX) / (W * this.scale),
            y: (sy - this.offsetY) / (H * this.scale)
        };
    }

    // بررسی اینکه آیا یک نقطه بر اساس فیلترهای سمت چپ باید دیده شود یا خیر
    _visible(p) {
        if (this.searchTerm && !p.filename.toLowerCase().includes(this.searchTerm)) return false;
        if (p.label) {
            if (!this.showLabeled) return false;
            if (!this.visibleLabels.has(p.label)) return false;
        } else {
            if (!this.showUnlabeled) return false;
            if (!this.visibleLabels.has('unlabeled')) return false;
        }
        return true;
    }

    // تابع اصلی برای نقاشی کردن بوم و خطوط گرید پس‌زمینه
    draw() {
        const W = this.canvas.width, H = this.canvas.height;
        this.ctx.clearRect(0, 0, W, H);

        // ۱. رسم خطوط راهنمای شطرنجی پس‌زمینه (Grid Lines)
        this.ctx.strokeStyle = 'rgba(255,255,255,0.03)';
        this.ctx.lineWidth = 1;
        const step = 50 * this.scale;
        const startX = this.offsetX % step;
        const startY = this.offsetY % step;

        for (let x = startX; x < W; x += step) {
            this.ctx.beginPath(); this.ctx.moveTo(x, 0); this.ctx.lineTo(x, H); this.ctx.stroke();
        }
        for (let y = startY; y < H; y += step) {
            this.ctx.beginPath(); this.ctx.moveTo(0, y); this.ctx.lineTo(W, y); this.ctx.stroke();
        }

        // ۲. رسم تک تک نقاط صوتی روی نقشه اصلی
        this.points.forEach(p => {
            if (!this._visible(p)) return;
            const s = this._toScreen(p.x, p.y);
            if (s.x < -10 || s.x > W + 10 || s.y < -10 || s.y > H + 10) return; // بهینه‌سازی: عدم رسم نقاط خارج از کادر

            this.ctx.beginPath();
            this.ctx.arc(s.x, s.y, 3.5, 0, 2 * Math.PI);
            this.ctx.fillStyle = LABEL_COLORS[p.label || 'unlabeled'] || '#888';
            this.ctx.fill();

            // اگر نقطه انتخاب شده باشد، یک هاله آبی دورش بکش
            if (this.selected === p) {
                this.ctx.beginPath();
                this.ctx.arc(s.x, s.y, 8, 0, 2 * Math.PI);
                this.ctx.strokeStyle = '#4f7bff';
                this.ctx.lineWidth = 2;
                this.ctx.stroke();
            }
        });

        // در نهایت مینی‌مپ را همزمان آپدیت کن
        this.drawMini();
    }

    // رسم مینی‌مپ کوچک پایین سمت راست نقشه
    drawMini() {
        const w = this.mini.width, h = this.mini.height;
        this.mctx.clearRect(0, 0, w, h);

        // رسم کپی مینیاتوری نقاط
        this.points.forEach(p => {
            if (!this._visible(p)) return;
            this.mctx.beginPath();
            this.mctx.arc(p.x * w, p.y * h, 1.2, 0, 2 * Math.PI);
            this.mctx.fillStyle = LABEL_COLORS[p.label || 'unlabeled'] || '#888';
            this.mctx.fill();
        });

        // رسم کادر متحرک آبی رنگ که نشان‌دهنده موقعیت زوم فعلی کاربر است
        const W = this.canvas.width, H = this.canvas.height;
        const topL = this._toLocal(0, 0);
        const botR = this._toLocal(W, H);

        this.mctx.strokeStyle = '#4f7bff';
        this.mctx.lineWidth = 1.5;
        this.mctx.strokeRect(
            Math.max(0, topL.x * w),
            Math.max(0, topL.y * h),
            Math.min(w, (botR.x - topL.x) * w),
            Math.min(h, (botR.y - topL.y) * h)
        );
    }

    // منطق محاسباتی بزرگنمایی (Zoom) بر اساس غلتک موس
    zoom(factor, cx, cy) {
        const loc = this._toLocal(cx, cy);
        this.scale = Math.min(40, Math.max(0.8, this.scale * factor));
        this.offsetX = cx - loc.x * this.canvas.width * this.scale;
        this.offsetY = cy - loc.y * this.canvas.height * this.scale;
        this.draw();
    }

    // تشخیص اینکه کاربر دقیقاً روی کدام نقطه کلیک کرده است (Hit Testing)
    hitTest(sx, sy) {
        const loc = this._toLocal(sx, sy);
        let best = null;
        let minDist = 0.025 / this.scale; // شعاع حساسیت کلیک کردن

        this.points.forEach(p => {
            if (!this._visible(p)) return;
            const d = Math.sqrt((p.x - loc.x) ** 2 + (p.y - loc.y) ** 2);
            if (d < minDist) {
                minDist = d; best = p;
            }
        });
        return best;
    }

    // تغییر ابعاد بوم هنگام تغییر سایز پنجره مرورگر
    _resize() {
        const r = this.canvas.parentElement.getBoundingClientRect();
        this.canvas.width = r.width; this.canvas.height = r.height;
        this.mini.width = 120; this.mini.height = 90;
        this.draw();
    }

    // متصل کردن رویدادهای حرکتی موس و اسکرول به توابع بالا
    _bindEvents() {
        const c = this.canvas;

        // زوم با اسکرول موس
        c.addEventListener('wheel', e => {
            e.preventDefault();
            const rect = c.getBoundingClientRect();
            const cx = e.clientX - rect.left;
            const cy = e.clientY - rect.top;
            this.zoom(e.deltaY < 0 ? 1.12 : 0.89, cx, cy);
        }, { passive: false });

        // شروع جابجایی (Drag) نقشه با کلیک چپ
        c.addEventListener('mousedown', e => {
            if (e.button !== 0) return;
            this._dragging = false;
            this._dragStartX = e.clientX; this._dragStartY = e.clientY;
            this._dragOffX = this.offsetX; this._dragOffY = this.offsetY;
            this._mouseDownTime = Date.now();
            c.style.cursor = 'grabbing';
        });

        // جابجا کردن نقشه در حالت Drag
        c.addEventListener('mousemove', e => {
            if (!this._mouseDownTime) return;
            const dx = e.clientX - this._dragStartX;
            const dy = e.clientY - this._dragStartY;
            if (Math.abs(dx) > 3 || Math.abs(dy) > 3) {
                this._dragging = true;
                this.offsetX = this._dragOffX + dx;
                this.offsetY = this._dragOffY + dy;
                this.draw();
            }
        });

        // رها کردن موس و انتخاب نهایی نقطه صوتی
        c.addEventListener('mouseup', e => {
            c.style.cursor = 'crosshair';
            this._mouseDownTime = null;
            if (!this._dragging) {
                const rect = c.getBoundingClientRect();
                const sx = e.clientX - rect.left;
                const sy = e.clientY - rect.top;
                const p = this.hitTest(sx, sy);
                this.selected = p;
                this.draw();
                this.onSelect && this.onSelect(p);
            }
        });
    }
}