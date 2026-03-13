import { useState } from 'react';
import './VideoFrame.css';

export default function VideoFrame({ meetingLink }) {
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [iframeError, setIframeError] = useState(false);

    if (!meetingLink) {
        return (
            <div className="video-frame video-frame--empty">
                <span className="video-frame__icon">📹</span>
                <p>No meeting link set</p>
                <p className="video-frame__hint">Coach can add a meeting link from the session settings</p>
            </div>
        );
    }

    if (iframeError) {
        return (
            <div className="video-frame video-frame--fallback">
                <span className="video-frame__icon">🔗</span>
                <p>Video cannot be embedded</p>
                <a
                    href={meetingLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="video-frame__open-btn"
                >
                    Open Meeting in New Tab →
                </a>
            </div>
        );
    }

    return (
        <div className={`video-frame ${isFullscreen ? 'video-frame--fullscreen' : ''}`}>
            <div className="video-frame__toolbar">
                <button
                    className="video-frame__btn"
                    onClick={() => setIsFullscreen(!isFullscreen)}
                    title={isFullscreen ? 'Exit fullscreen' : 'Fullscreen'}
                >
                    {isFullscreen ? '⊟' : '⊞'}
                </button>
                <a
                    href={meetingLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="video-frame__btn"
                    title="Open in new tab"
                >
                    ↗
                </a>
            </div>
            <iframe
                src={meetingLink}
                className="video-frame__iframe"
                allow="camera;microphone;display-capture;fullscreen"
                allowFullScreen
                onError={() => setIframeError(true)}
                onLoad={(e) => {
                    try {
                        // If cross-origin blocks access, the iframe loaded but may not work
                        const _ = e.target.contentWindow.location.href;
                    } catch {
                        // Cross-origin is expected for external meeting links
                    }
                }}
            />
        </div>
    );
}
