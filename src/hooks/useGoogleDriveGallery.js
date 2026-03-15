import { useState, useEffect, useCallback, useRef } from 'react';

const DRIVE_API_BASE = 'https://www.googleapis.com/drive/v3/files';

/**
 * Returns a direct thumbnail/view URL for a Google Drive image file.
 * sz=w1200 requests a 1200px-wide version (no auth required for public files).
 */
export function getDriveImageUrl(fileId, size = 800) {
    return `https://lh3.googleusercontent.com/d/${fileId}=w${size}`;
}

/**
 * Fallback direct link (works when the folder is shared with "Anyone with link").
 */
export function getDriveFallbackUrl(fileId) {
    return `https://drive.google.com/uc?export=view&id=${fileId}`;
}

/**
 * Fetch image list from a public Google Drive folder.
 * Requirements:
 *  - Folder must be shared as "Anyone with the link can view"
 *  - Google Drive API enabled in Google Cloud Console
 *  - An unrestricted API key (HTTP referrer restrictions allowed for your domain)
 *
 * @param {string} folderId  - Google Drive folder ID
 * @param {string} apiKey    - Google Drive API key
 * @returns {Promise<Array>} - Array of { id, name, mimeType, thumbnailLink }
 */
async function fetchDriveImages(folderId, apiKey) {
    if (!folderId || !apiKey) {
        throw new Error('Google Drive folder ID and API key are required');
    }

    // Common misconfiguration: OAuth client secret pasted instead of Drive API key
    if (apiKey.startsWith('GOCSPX-')) {
        throw new Error('Invalid credential type. Use Google Drive API key (starts with AIza), not OAuth client secret.');
    }

    const query = encodeURIComponent(
        `'${folderId}' in parents and mimeType contains 'image/' and trashed = false`
    );
    const fields = encodeURIComponent('files(id,name,mimeType,thumbnailLink,createdTime)');
    const orderBy = 'createdTime desc';
    const pageSize = 50;

    const url = `${DRIVE_API_BASE}?q=${query}&key=${apiKey}&fields=${fields}&orderBy=${encodeURIComponent(orderBy)}&pageSize=${pageSize}`;

    const res = await fetch(url);

    if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body?.error?.message || `Drive API error: ${res.status}`);
    }

    const json = await res.json();
    return (json.files || []).map((f) => ({
        id: f.id,
        name: f.name,
        mimeType: f.mimeType,
        createdTime: f.createdTime,
        // Use lh3 direct thumbnail URL (no sign-in required for public files)
        src: getDriveImageUrl(f.id, 800),
        thumb: getDriveImageUrl(f.id, 400),
        fallbackSrc: getDriveFallbackUrl(f.id),
    }));
}

/**
 * Hook: useGoogleDriveGallery
 *
 * Polls a Google Drive folder for images and refreshes on the given interval.
 *
 * @param {object} options
 * @param {string}  options.folderId        - Drive folder ID (from VITE_GOOGLE_DRIVE_FOLDER_ID)
 * @param {string}  options.apiKey          - Drive API key (from VITE_GOOGLE_DRIVE_API_KEY)
 * @param {number}  [options.refreshInterval=300000] - Poll interval in ms (default 5 min)
 * @param {boolean} [options.enabled=true]  - Set false to disable auto-fetching
 *
 * @returns {{ images, loading, error, refresh, lastUpdated }}
 */
export function useGoogleDriveGallery({
    folderId,
    apiKey,
    refreshInterval = 300_000,
    enabled = true,
}) {
    const [images, setImages] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [lastUpdated, setLastUpdated] = useState(null);
    const timerRef = useRef(null);
    const mountedRef = useRef(true);

    const normalizedFolderId = useCallback(() => {
        if (!folderId) return '';
        const value = String(folderId).trim();

        // Accept direct folder ID
        if (!value.includes('drive.google.com')) return value;

        // Accept full folder URL: https://drive.google.com/drive/folders/<ID>
        const match = value.match(/\/folders\/([^/?]+)/i);
        return match?.[1] || value;
    }, [folderId]);

    const refresh = useCallback(async () => {
        if (!folderId || !apiKey) return;
        setLoading(true);
        setError(null);
        try {
            const imgs = await fetchDriveImages(normalizedFolderId(), apiKey);
            if (mountedRef.current) {
                setImages(imgs);
                setLastUpdated(new Date());
            }
        } catch (err) {
            if (mountedRef.current) {
                setError(err.message);
            }
        } finally {
            if (mountedRef.current) {
                setLoading(false);
            }
        }
    }, [folderId, apiKey, normalizedFolderId]);

    useEffect(() => {
        mountedRef.current = true;
        return () => {
            mountedRef.current = false;
        };
    }, []);

    useEffect(() => {
        if (!enabled) return;
        // Initial fetch
        refresh();

        // Set up polling
        timerRef.current = setInterval(refresh, refreshInterval);
        return () => clearInterval(timerRef.current);
    }, [enabled, refresh, refreshInterval]);

    return { images, loading, error, refresh, lastUpdated };
}
