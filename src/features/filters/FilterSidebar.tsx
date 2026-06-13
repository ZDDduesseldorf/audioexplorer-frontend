import { useState } from "react";

interface FilterSidebarProps {
  onClose: () => void;
}
export function FilterSidebar({ onClose }: FilterSidebarProps) {
  const [showLabeled, setShowLabeled] = useState(true);
  const [showUnlabeled, setShowUnlabeled] = useState(true);
  const [showTestLabel, setShowTestLabel] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  
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
        <label className="filter-option">
          <span>labeled</span>
          
          <input
            className="filter-checkbox"
            type="checkbox"
            checked={showLabeled}
            onChange={(event) => setShowLabeled(event.target.checked)}
          />
        </label>

        <label className="filter-option">
          <span>unlabeled</span>
          
          <input
            className="filter-checkbox"
            type="checkbox"
            checked={showUnlabeled}
            onChange={(event) => setShowUnlabeled(event.target.checked)}
          />
        </label>
      </section>
      <section className="filter-section filter-label-section">
        <h3 className="filter-section-title">Filter by Label</h3>

        <label className="filter-option">
          <span>test label</span>

          <div className="filter-option-controls">
            <span className="filter-count">xx</span>
            
            <input
              className="filter-checkbox"
              type="checkbox"
              checked={showTestLabel}
              onChange={(event) => setShowTestLabel(event.target.checked)}
            />
          </div>
        </label>
      </section>

      <section className="filter-section filter-search-section">
        <h3 className="filter-section-title">Search</h3>

        <label className="filter-search">
          <svg
            className="filter-search-icon"
            aria-hidden="true"
            viewBox="0 0 24 24"
          >
            <circle cx="11" cy="11" r="6" />
            <path d="M16 16L21 21"/>
          </svg>
          <input
            className="filter-search-input"
            type="search"
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            placeholder="Search label"
            aria-label="Search label"
          />
        </label>
      </section>
    </aside>
  );
}