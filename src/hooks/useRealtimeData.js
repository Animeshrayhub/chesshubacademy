import { useState, useEffect, useRef, useCallback } from 'react';
import { supabase } from '../services/supabase';

/**
 * Hook to subscribe to Supabase realtime changes for a table.
 * Returns the latest data and auto-refreshes on INSERT/UPDATE/DELETE.
 */
export function useRealtimeData(table, fetchFn) {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const fetchRef = useRef(fetchFn);

    useEffect(() => {
        fetchRef.current = fetchFn;
    });

    const loadData = useCallback(async () => {
        try {
            const result = await fetchRef.current();
            setData(result || []);
        } catch (err) {
            console.error(`Error fetching ${table}:`, err);
        }
        setLoading(false);
    }, [table]);

    useEffect(() => {
        loadData();

        if (!supabase) return;

        const channel = supabase
            .channel(`${table}-realtime`)
            .on('postgres_changes', { event: '*', schema: 'public', table }, () => {
                loadData();
            })
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [loadData, table]);

    return { data, loading, refresh: loadData };
}
