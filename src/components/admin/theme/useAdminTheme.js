import { useState, useEffect } from 'react';

export function useAdminTheme() {
    const [isDark, setIsDark] = useState(() => localStorage.getItem('admin-theme') === 'dark');
    useEffect(() => {
        const handler = () => setIsDark(localStorage.getItem('admin-theme') === 'dark');
        window.addEventListener('storage', handler);
        return () => window.removeEventListener('storage', handler);
    }, []);
    return { isDark, setIsDark };
}
