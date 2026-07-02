import Logo from "../assets/Logo_orange_gross.svg";

interface HeaderProps {
  onAboutClick: () => void;
  onLogoClick: () => void;
  pointCount?: number;
  clusterCount?: number;
}

export function Header({
  onAboutClick,
  onLogoClick,
  pointCount,
  clusterCount,
}: HeaderProps) {
  return (
    <header className="site-header">
      {/* لوگو — سمت چپ */}
      <button
        className="logo-button"
        type="button"
        onClick={onLogoClick}
        aria-label="go to main page"
      >
        <img className="site-logo" src={Logo} alt="Logo Audio Explorer" />
      </button>

      {/* آمار — وسط */}
      <div className="header-center">
        {pointCount !== undefined && (
          <div className="header-stats">
            <span className="header-stat-item">
              <span className="header-stat-value">
                {pointCount.toLocaleString()}
              </span>
              <span className="header-stat-label">sounds</span>
            </span>
            <span className="header-stat-divider">·</span>
            <span className="header-stat-item">
              <span className="header-stat-value">{clusterCount ?? "—"}</span>
              <span className="header-stat-label">clusters</span>
            </span>
          </div>
        )}
      </div>

      {/* دکمه About — سمت راست */}
      <button
        className="about-button"
        type="button"
        onClick={onAboutClick}
        aria-label="Open about page"
      >
        <span className="about-icon" aria-hidden="true">
          i
        </span>
        <span>About</span>
      </button>
    </header>
  );
}
