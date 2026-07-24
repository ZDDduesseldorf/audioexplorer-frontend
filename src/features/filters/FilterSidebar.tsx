import { useMemo, useState } from "react";
import { useAppStore, isUncategorized } from "../../store/useAppStore";
import { getClusterColor } from "../../domain/clusters";
import "./FilterSidebar.css";

interface CategoryInfo {
  name: string;
  count: number;
  color: string;
}

export function FilterSidebar() {
  const {
    points,
    showCategorized,
    showUncategorized,
    toggleCategorized,
    toggleUncategorized,
    hiddenCategories,
    toggleCategory,
    setFilterSidebarOpen,
  } = useAppStore();

  const [isDropdownOpen, setDropdownOpen] = useState(false);
  const [categorySearch, setCategorySearch] = useState("");

  const { categories, categorizedCount, uncategorizedCount } = useMemo(() => {
    const counts = new Map<string, number>();
    const clusters = new Map<string, number>();
    let uncategorizedCount = 0;
    for (const p of points) {
      if (isUncategorized(p)) {
        uncategorizedCount++;
        continue;
      }
      counts.set(p.category!, (counts.get(p.category!) ?? 0) + 1);
      clusters.set(p.category!, p.cluster);
    }
    const categories: CategoryInfo[] = [...counts.keys()]
      .sort()
      .map((name) => ({
        name,
        count: counts.get(name)!,
        color: getClusterColor(clusters.get(name)!),
      }));
    return {
      categories,
      categorizedCount: points.length - uncategorizedCount,
      uncategorizedCount,
    };
  }, [points]);

  const searchedCategories = categories.filter((c) =>
    c.name.toLowerCase().includes(categorySearch.trim().toLowerCase()),
  );

  const visibleCategoryCount = categories.filter(
    (c) => !hiddenCategories.has(c.name),
  ).length;
  const dropdownSummary =
    visibleCategoryCount === categories.length
      ? "All categories"
      : `${visibleCategoryCount} of ${categories.length} categories`;

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
        <label className="filter-option">
          <span className="filter-option-label">Categorized</span>

          <div className="filter-option-controls">
            <span className="filter-count">
              {categorizedCount.toLocaleString()}
            </span>

            <input
              className="filter-checkbox"
              type="checkbox"
              checked={showCategorized}
              onChange={toggleCategorized}
            />
          </div>
        </label>

        <label className="filter-option">
          <span className="filter-option-label">Uncategorized</span>

          <div className="filter-option-controls">
            <span className="filter-count">
              {uncategorizedCount.toLocaleString()}
            </span>

            <input
              className="filter-checkbox"
              type="checkbox"
              checked={showUncategorized}
              onChange={toggleUncategorized}
            />
          </div>
        </label>
      </section>

      <section className="filter-section">
        <h3 className="filter-section-title">Filter by Category</h3>

        <div className="filter-dropdown">
          <button
            className="filter-dropdown-btn"
            type="button"
            onClick={() => {
              setDropdownOpen((open) => !open);
              setCategorySearch("");
            }}
            aria-expanded={isDropdownOpen}
          >
            <span>{dropdownSummary}</span>
            <span
              className={`filter-dropdown-caret${isDropdownOpen ? " open" : ""}`}
              aria-hidden="true"
            >
              ▾
            </span>
          </button>

          {isDropdownOpen && (
            <div className="filter-dropdown-panel">
              <input
                className="filter-dropdown-search"
                type="search"
                placeholder="Search categories…"
                value={categorySearch}
                onChange={(e) => setCategorySearch(e.target.value)}
                autoFocus
              />

              {searchedCategories.length === 0 && (
                <span className="filter-dropdown-empty">No matches</span>
              )}

              {searchedCategories.map(({ name, count, color }) => (
                <label key={name} className="filter-option">
                  <span className="filter-option-label">
                    <span
                      className="filter-category-dot"
                      style={{ background: color }}
                    />
                    {name}
                  </span>

                  <div className="filter-option-controls">
                    <span className="filter-count">
                      {count.toLocaleString()}
                    </span>

                    <input
                      className="filter-checkbox"
                      type="checkbox"
                      checked={!hiddenCategories.has(name)}
                      onChange={() => toggleCategory(name)}
                    />
                  </div>
                </label>
              ))}
            </div>
          )}
        </div>
      </section>
    </aside>
  );
}
