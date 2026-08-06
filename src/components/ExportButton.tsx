import { useState } from "react";
import "./ExportButton.css";

export function ExportButton() {
    const [loading, setLoading] = useState(false);

    const handleExport = async () => {
        try {
            setLoading(true);
            const response = await fetch("/api/v1/sounds/labeled-samples/export");

            if (!response.ok) {
                throw new Error("خطا در دانلود فایل CSV");
            }

            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = "labeled-samples.csv";
            document.body.appendChild(a);
            a.click();
            a.remove();
            window.URL.revokeObjectURL(url);
        } catch (error) {
            console.error("Export failed:", error);
            alert("امکان دانلود فایل وجود ندارد.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <button
            type="button"
            className="export-csv-btn"
            onClick={handleExport}
            disabled={loading}
        >
            {loading ? "Export wird vorbereitet." : "📥 Export CSV"}
        </button>
    );
}