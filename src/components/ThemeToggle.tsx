import { useEffect, useState } from "react";
import "./ThemeToggle.css";

export function ThemeToggle() {
    const [isDark, setIsDark] = useState(() => {
        // بررسی وضعیت ذخیره شده در localStorage یا حالت پیش‌فرض مرورگر
        const saved = localStorage.getItem("theme");
        if (saved) return saved === "dark";
        return window.matchMedia("(prefers-color-scheme: dark)").matches;
    });

    useEffect(() => {
        const root = document.documentElement;
        if (isDark) {
            root.classList.add("dark-mode");
            localStorage.setItem("theme", "dark");
        } else {
            root.classList.remove("dark-mode");
            localStorage.setItem("theme", "light");
        }
    }, [isDark]);

    return (
        <button
            type="button"
            className="theme-toggle-btn"
            onClick={() => setIsDark((prev) => !prev)}
            aria-label="Toggle dark and light mode"
        >
            {isDark ? "☀️ Light" : "🌙 Dark"}
        </button>
    );
}