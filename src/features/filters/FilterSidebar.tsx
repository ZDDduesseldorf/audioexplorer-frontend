export interface CategoryInfo {
  name: string;
  count: number;
  color: string;
}

interface FilterSidebarProps {
  categories: CategoryInfo[];
  hiddenCategories: ReadonlySet<string>;
  onToggleCategory: (name: string) => void;
  onClose: () => void;
}

export function FilterSidebar({
  categories,
  hiddenCategories,
  onToggleCategory,
  onClose,
}: FilterSidebarProps) {
  return (
    <aside className="filter-sidebar" aria-label="Filter sidebar">
      <div className="filter-header">
        <h2 className="filter-title">Filters</h2>

        <button
          className="filter-close-btn"
          type="button"
          onClick={onClose}
          aria-label="Hide filter sidebar"
        >
          ←
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
                onChange={() => onToggleCategory(name)}
              />
            </div>
          </label>
        ))}
      </section>
    </aside>
  );
}
