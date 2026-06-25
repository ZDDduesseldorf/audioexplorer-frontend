// panel.js — مدیریت کنترل‌های پنل سمت راست، پلیر و آنوتیشن‌ها

import { LABELS, LABEL_COLORS } from './data.js';

export class RightPanel {
    constructor() {
        this._playing = false;
        this._waveInterval = null;
        this._buildSelect();
        this._bindButtons();
        this.onConfirm = null;
        this.onNext = null;
    }

    // پر کردن خودکار گزینه‌های منوی کشویی لِیبل‌ها (Dropdown)
    _buildSelect() {
        const sel = document.getElementById('a-label');
        sel.innerHTML = '<option value="">Select…</option>';
        for (const l of LABELS) {
            const opt = document.createElement('option');
            opt.value = l; opt.textContent = l;
            sel.appendChild(opt);
        }
    }

    // متصل کردن کلیک دکمه‌های Confirm، Next و Play صوتی
    _bindButtons() {
        document.getElementById('btn-confirm').addEventListener('click', () => {
            const lbl = document.getElementById('a-label').value
                || document.getElementById('new-label').value.trim();
            const note = document.getElementById('comment').value.trim();
            this.onConfirm && this.onConfirm(lbl, note);
        });

        document.getElementById('btn-next').addEventListener('click', () => {
            this.onNext && this.onNext();
        });

        document.getElementById('play-btn').addEventListener('click', () => {
            this._playing = !this._playing;
            const icon = document.getElementById('play-icon');
            if (this._playing) {
                // تغییر آیکون به حالت توقف (Pause)
                icon.innerHTML = '<rect x="3" y="3" width="4" height="10" rx="1"/><rect x="9" y="3" width="4" height="10" rx="1"/>';
                this._animateWaveform();
            } else {
                // تغییر آیکون به حالت پخش (Play)
                icon.innerHTML = '<path d="M4 2v12l9-6z"/>';
                clearInterval(this._waveInterval);
                this._restoreWaveform();
            }
        });
    }

    // به‌روزرسانی اطلاعات سایدبار بر اساس نقطه‌ای که کاربر روی نقشه کلیک کرده است
    update(p) {
        if (!p) {
            // حالت پیش‌فرض وقتی هیچ نقطه‌ای انتخاب نشده است
            document.getElementById('p-filename').textContent = 'No selection';
            document.getElementById('p-id').textContent = 'ID: —';
            document.getElementById('p-label').textContent = '—';
            document.getElementById('p-date').textContent = '—';
            document.getElementById('p-duration').textContent = '—';
            document.getElementById('a-status').textContent = '—';
            this._buildWaveform(Array(24).fill(4));
            this._updateAnomaly(0, 0);
            return;
        }

        // قرار دادن مقادیر واقعی نقطه انتخاب شده در صفحه
        document.getElementById('p-filename').textContent = p.filename;
        document.getElementById('p-id').textContent = `ID: ${p.id}`;
        document.getElementById('p-label').textContent = p.label || 'unlabeled';
        document.getElementById('p-date').textContent = p.date;
        document.getElementById('p-duration').textContent = p.duration;

        const status = document.getElementById('a-status');
        status.textContent = p.annotated ? 'labeled' : 'unlabeled';
        status.className = `status-badge ${p.annotated ? 'labeled' : 'unlabeled'}`;

        document.getElementById('a-label').value = p.label;
        document.getElementById('new-label').value = '';
        document.getElementById('comment').value = p.note;

        // ساختن شکل موج صوتی تصادفی برای این فایل و آپدیت نوارهای آنومالی
        this._buildWaveform(this._randHeights());
        this._updateAnomaly(p.isolationForest, p.lof);
    }

    // اضافه کردن یک آپشن جدید به منوی کشویی (اگر کاربر لیبل جدیدی تایپ کند)
    addLabel(label, color) {
        const sel = document.getElementById('a-label');
        const opt = document.createElement('option');
        opt.value = label; opt.textContent = label;
        sel.appendChild(opt);
    }

    // تغییر متحرک نوارهای درصد سنجش داده‌های پرت (Anomaly Bars)
    _updateAnomaly(iso, lof) {
        document.getElementById('iso-val').textContent = iso ? `${iso}%` : '—';
        document.getElementById('lof-val').textContent = lof ? `${lof}%` : '—';
        const isoFill = document.querySelector('#iso-bar .anomaly-fill');
        const lofFill = document.querySelector('#lof-bar .anomaly-fill');
        if (isoFill) isoFill.style.width = (iso || 0) + '%';
        if (lofFill) lofFill.style.width = (lof || 0) + '%';
    }

    _randHeights() {
        return Array.from({ length: 24 }, () => 4 + Math.floor(Math.random() * 24));
    }

    // ایجاد ستون‌های خطی شکل موج صوتی درون دامن (DOM)
    _buildWaveform(heights) {
        const wf = document.getElementById('waveform');
        wf.innerHTML = '';
        this._waveHeights = heights;
        heights.forEach((h, i) => {
            const bar = document.createElement('div');
            bar.className = 'waveform-bar';
            bar.style.height = h + 'px';
            bar.dataset.idx = i;
            wf.appendChild(bar);
        });
    }

    // انیمیشن نوسانی و ریتمیک شکل موج در زمان وضعیت Play
    _animateWaveform() {
        let t = 0;
        this._waveInterval = setInterval(() => {
            const bars = document.querySelectorAll('.waveform-bar');
            bars.forEach((b, i) => {
                const base = this._waveHeights[i] || 12;
                const jitter = Math.sin((t + i) * 0.4) * 4; // ایجاد موج سینوسی نرم
                b.style.height = Math.max(3, base + jitter) + 'px';
                b.classList.toggle('active', Math.abs(jitter) > 2);
            });
            t++;
        }, 80);
    }

    // بازگرداندن وضعیت شکل موج به حالت سکون پس از Pause
    _restoreWaveform() {
        const bars = document.querySelectorAll('.waveform-bar');
        bars.forEach((b, i) => {
            b.style.height = (this._waveHeights[i] || 4) + 'px';
            b.classList.remove('active');
        });
    }
}