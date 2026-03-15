import { useState } from 'react';
import { useGoogleDriveGallery } from '../hooks/useGoogleDriveGallery';
import './GoogleDriveGallery.css';

const FOLDER_ID = import.meta.env.VITE_GOOGLE_DRIVE_FOLDER_ID;
const API_KEY = import.meta.env.VITE_GOOGLE_DRIVE_API_KEY;
const REFRESH_INTERVAL = Number(import.meta.env.VITE_GALLERY_REFRESH_INTERVAL) || 300_000;

export default function GoogleDriveGallery() {
    const [lightboxImg, setLightboxImg] = useState(null);
    const { images, loading, error, refresh, lastUpdated } = useGoogleDriveGallery({
        folderId: FOLDER_ID,
        apiKey: API_KEY,
        refreshInterval: REFRESH_INTERVAL,
        enabled: !!(FOLDER_ID && API_KEY),
    });

    // Don't render if not configured
    if (!FOLDER_ID || !API_KEY) return null;

    const formatTime = (date) =>
        date
            ? date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            : '--';

    return (
        <section className="gdrive-gallery" id="gallery">
            <div className="gdrive-gallery__header">
                <h2 className="gdrive-gallery__title">Photo Gallery</h2>
                <p className="gdrive-gallery__subtitle">
                    Latest moments from ChessHub Academy
                </p>
                <div className="gdrive-gallery__meta">
                    {lastUpdated && (
                        <span className="gdrive-gallery__updated">
                            Updated {formatTime(lastUpdated)}
                        </span>
                    )}
                    <button
                        className="gdrive-gallery__refresh-btn"
                        onClick={refresh}
                        disabled={loading}
                        title="Refresh gallery"
                    >
                        <span className={loading ? 'spinning' : ''}>↻</span>
                        {loading ? 'Loading…' : 'Refresh'}
                    </button>
                </div>
            </div>

            {error && (
                <div className="gdrive-gallery__error">
                    <span>⚠ Could not load gallery: {error}</span>
                    <button onClick={refresh}>Retry</button>
                </div>
            )}

            {loading && images.length === 0 && (
                <div className="gdrive-gallery__skeleton">
                    {Array.from({ length: 6 }).map((_, i) => (
                        <div key={i} className="gdrive-gallery__skeleton-card" />
                    ))}
                </div>
            )}

            {!loading && !error && images.length === 0 && (
                <p className="gdrive-gallery__empty">No images found in the gallery folder.</p>
            )}

            {images.length > 0 && (
                <div className="gdrive-gallery__grid">
                    {images.map((img) => (
                        <button
                            key={img.id}
                            className="gdrive-gallery__item"
                            onClick={() => setLightboxImg(img)}
                            aria-label={`View ${img.name}`}
                        >
                            <img
                                src={img.thumb}
                                alt={img.name}
                                loading="lazy"
                                onError={(e) => {
                                    // Fallback to drive.google.com direct link
                                    if (e.target.src !== img.fallbackSrc) {
                                        e.target.src = img.fallbackSrc;
                                    }
                                }}
                            />
                            <div className="gdrive-gallery__overlay">
                                <span className="gdrive-gallery__zoom">🔍</span>
                            </div>
                        </button>
                    ))}
                </div>
            )}

            {/* Lightbox */}
            {lightboxImg && (
                <div
                    className="gdrive-lightbox"
                    onClick={() => setLightboxImg(null)}
                    role="dialog"
                    aria-modal="true"
                    aria-label="Image viewer"
                >
                    <button
                        className="gdrive-lightbox__close"
                        onClick={() => setLightboxImg(null)}
                        aria-label="Close"
                    >
                        ✕
                    </button>
                    <img
                        src={lightboxImg.src}
                        alt={lightboxImg.name}
                        className="gdrive-lightbox__img"
                        onClick={(e) => e.stopPropagation()}
                        onError={(e) => {
                            if (e.target.src !== lightboxImg.fallbackSrc) {
                                e.target.src = lightboxImg.fallbackSrc;
                            }
                        }}
                    />
                    <p className="gdrive-lightbox__caption">{lightboxImg.name}</p>
                </div>
            )}
        </section>
    );
}
