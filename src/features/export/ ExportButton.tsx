import { useState } from "react";
import "./ExportButton.css";

export function ExportButton() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    async function handleExport() {
        setLoading(true);
        setError(null);
        try {
            const res = await fetch("/api/v1/sounds/labeled-samples/export");
            if (!res.ok) throw new Error(`HTTP ${res.status}`);

            // دانلود CSV
            const blob = await res.blob();
            const url  = URL.createObjectURL(blob);
            const a    = document.createElement("a");
            a.href     = url;
            a.download = "category_proposals.csv";
            a.click();
            URL.revokeObjectURL(url);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Export failed");
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="export-wrap">
            <button
                type="button"
                className="export-btn"
                onClick={handleExport}
                disabled={loading}
                title="Download labeled samples as CSV"
            >
                {loading ? "Exporting…" : "Export CSV ↓"}
            </button>
            {error && <span className="export-error">{error}</span>}
        </div>
    );
}
