// filters.js — مدیریت پنل فیلترهای سمت چپ و جستجوی نام فایل‌ها

import { LABEL_COLORS, LABELS } from './data.js';

export class FilterPanel {
    constructor(points) {
        this.points = points;
        this.onChange = null;
        this._build();
        this._bindTop();
        this._bindSearch();
    }

    // شمارش زنده تعداد نمونه‌ها برای هر لیبل صوتی
    _countByLabel(label) {
        if (label === 'unlabeled') {
            return this.points.filter(p => !p.label).length;
        }
        return this.points.filter(p => p.label === label).length;
    }

    // ساخت داینامیک لیست لِیبل‌ها و شمارنده‌های عددی در صفحه (DOM)
    _build() {
        const div = document.getElementById('label-list');
        div.innerHTML = '';
        const all = [...LABELS, 'unlabeled'];

        for (const label of all) {
            const count = this._countByLabel(label);
            const color = LABEL_COLORS[label] || '#888';
            const row = document.createElement('label');
            row.className = 'label-row';
            row.innerHTML = `
        <span class="dot" style="background:${color}"></span>
        <span class="lname">${label}</span>
        <span class="count-badge">${count}</span>
        <input type="checkbox" checked data-lbl="${label}" />
      `;
            div.appendChild(row);
        }
        div.addEventListener('change', () => this._emit());
    }

    // متصل کردن رویداد فیلترهای بالایی (labeled و unlabeled)
    _bindTop() {
        document.getElementById('f-labeled').addEventListener('change', () => this._emit());
        document.getElementById('f-unlabeled').addEventListener('change', () => this._emit());
    }

    // متصل کردن فیلتر متنی (Search Box)
    _bindSearch() {
        document.getElementById('search-input').addEventListener('input', () => this._emit());
    }

    // ارسال وضعیت جدید فیلترها به نقشه اصلی برای رندر مجدد نقاط
    _emit() {
        const search = document.getElementById('search-input').value.toLowerCase().trim();
        const visibleLabels = new Set(
            [...document.querySelectorAll('#label-list input[type=checkbox]')]
                .filter(c => c.checked)
                .map(c => c.dataset.lbl)
        );
        const showLabeled   = document.getElementById('f-labeled').checked;
        const showUnlabeled = document.getElementById('f-unlabeled').checked;

        this.onChange && this.onChange({ visibleLabels, showLabeled, showUnlabeled, search });
    }

    // بازسازی و به‌روزرسانی تعداد عددی فیلترها بعد از ثبت لِیبل جدید
    rebuild(points) {
        this.points = points;
        const existing = new Set(
            [...document.querySelectorAll('#label-list input[type=checkbox]')].map(c => c.dataset.lbl)
        );
        const all = [...new Set(points.map(p => p.label || 'unlabeled'))];
        const toAdd = all.filter(l => !existing.has(l));

        const div = document.getElementById('label-list');

        // اگر کاربر لیبل کاملاً جدیدی تایپ کرده باشد، آن را به لیست اضافه کن
        for (const label of toAdd) {
            if (!label) continue;
            const color = LABEL_COLORS[label] || '#aaa';
            const count = this._countByLabel(label);
            const row = document.createElement('label');
            row.className = 'label-row';
            row.innerHTML = `
        <span class="dot" style="background:${color}"></span>
        <span class="lname">${label}</span>
        <span class="count-badge">${count}</span>
        <input type="checkbox" checked data-lbl="${label}" />
      `;
            div.appendChild(row);
        }

        // آپدیت کردن عددِ تعداد نمونه‌های کنار هر فیلتر
        div.querySelectorAll('.label-row').forEach(row => {
            const lbl = row.querySelector('input')?.dataset.lbl;
            if (lbl) {
                const badge = row.querySelector('.count-badge');
                if (badge) badge.textContent = this._countByLabel(lbl);
            }
        });
    }
}