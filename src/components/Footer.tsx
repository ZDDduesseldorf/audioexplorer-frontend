import "./Footer.css";

interface FooterProps {
    status?: string;
}

export function Footer({ status }: FooterProps) {
    return (
        <footer className="site-footer">

            {/* سمت چپ */}
            <div className="footer-left">
                <span className="footer-brand">Audio Explorer</span>
                <span className="footer-version">v0.1.0</span>
                <a
                    href="https://github.com/ZDDduesseldorf/audioexplorer-frontend"
                    className="footer-link"
                    target="_blank"
                    rel="noopener noreferrer"
                >
                    GitHub ↗
                </a>
            </div>

            {/* وسط — وضعیت */}
            <div className="footer-center">
                {status && <span className="footer-status">{status}</span>}
            </div>

            {/* سمت راست */}
            <div className="footer-right">
                <span className="footer-event">Nacht der Wissenschaft · Düsseldorf 2026</span>
            </div>

        </footer>
    );
}
