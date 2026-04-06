// Stub realtime data hook (no backend)
import { useState, useEffect } from 'react';

export const useRealtimeData = (table, fetchFunction) => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const loadData = async () => {
            try {
                if (fetchFunction) {
                    const result = await fetchFunction();
                    setData(result || []);
                }
            } catch (err) {
                setError(err);
                console.error('Error loading data:', err);
            } finally {
                setLoading(false);
            }
        };

        loadData();
    }, []);

    return { data, loading, error };
};
