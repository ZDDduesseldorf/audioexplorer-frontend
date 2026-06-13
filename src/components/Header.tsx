import Logo from "../assets/test_logo.png";

interface HeaderProps {
  onAboutClick: () => void;
  onLogoClick: () => void;
}

export function Header({ onAboutClick, onLogoClick }: HeaderProps) {
  return (
    <header className="site-header">
      <button
        className="logo-button"
        type="button"
        onClick={onLogoClick}
        aria-label="go to main page"
      >
        <img className="site-logo" src={Logo} alt="Audio Explorer" />
      </button>

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
