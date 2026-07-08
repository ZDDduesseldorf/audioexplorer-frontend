import { useMemo } from "react";
import { useAppStore } from "../../store/useAppStore";
import { getClusterColor } from "../../domain/clusters";

interface CategoryInfo {
  name: string;
  count: number;
  color: string;
}

export function FilterSidebar() {
  const { points, hiddenCategories, toggleCategory, setFilterSidebarOpen } =
    useAppStore();

  const categories = useMemo<CategoryInfo[]>(() => {
    const counts = new Map<string, number>();
    const clusters = new Map<string, number>();
    for (const p of points) {
      if (p.category == null) continue;
      counts.set(p.category, (counts.get(p.category) ?? 0) + 1);
      clusters.set(p.category, p.cluster);
    }
    return [...counts.keys()].sort().map((name) => ({
      name,
      count: counts.get(name)!,
      color: getClusterColor(clusters.get(name)!),
    }));
  }, [points]);

  return (
    <aside className="filter-sidebar" aria-label="Filter sidebar">
      <div className="filter-header">
        <h2 className="filter-title">Filters</h2>
        <button
          className="filter-close-btn"
          type="button"
          onClick={() => setFilterSidebarOpen(false)}
          aria-label="Hide filter sidebar"
        >
          <span aria-hidden="true">✕</span>
        </button>
      </div>

      <section className="filter-section">
        <h3 className="filter-section-title">Categories</h3>

        {categories.map(({ name, count, color }) => (
          <label key={name} className="filter-option">
            <span className="filter-option-label">
              <span
                className="filter-category-dot"
                style={{ background: color }}
              />
              {name}
            </span>

            <div className="filter-option-controls">
              <span className="filter-count">{count.toLocaleString()}</span>

              <input
                className="filter-checkbox"
                type="checkbox"
                checked={!hiddenCategories.has(name)}
                onChange={() => toggleCategory(name)}
              />
            </div>
          </label>
        ))}
      </section>
    </aside>
  );
}
