import "./LoadingScreen.css";

interface LoadingScreenProps {
    message?: string;
}

export function LoadingScreen({ message = "Loading audio data…" }: LoadingScreenProps) {
    return (
        <div className="loading-screen">
            <div className="loading-content">

                {/* Spinner */}
                <div className="loading-spinner">
                    <div className="spinner-ring" />
                    <div className="spinner-ring spinner-ring--delay" />
                </div>

                {/* متن */}
                <p className="loading-message">{message}</p>
                <p className="loading-sub">Connecting to backend · localhost:8000</p>

                {/* موج صوتی انیمیشن */}
                <div className="loading-wave">
                    {Array.from({ length: 12 }).map((_, i) => (
                        <div
                            key={i}
                            className="loading-wave-bar"
                            style={{ animationDelay: `${i * 0.08}s` }}
                        />
                    ))}
                </div>

            </div>
        </div>
    );
}
