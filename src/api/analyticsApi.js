import { supabase } from '../services/supabase';

export async function trackEvent(eventType, eventData = {}, pagePath = '') {
    if (!supabase) return;
    try {
        await supabase.from('analytics_events').insert([{
            event_type: eventType,
            event_data: eventData,
            page_path: pagePath || window.location.pathname,
            session_id: getSessionId(),
        }]);
    } catch {
        // Analytics should never break the app
    }
}

export async function getAnalyticsSummary(startDate, endDate) {
    const { data, error } = await supabase
        .from('analytics_daily')
        .select('*')
        .gte('date', startDate)
        .lte('date', endDate)
        .order('date', { ascending: true });
    if (error) throw error;
    return data;
}

export async function getEventCounts(eventType, startDate, endDate) {
    const { count, error } = await supabase
        .from('analytics_events')
        .select('*', { count: 'exact', head: true })
        .eq('event_type', eventType)
        .gte('created_at', startDate)
        .lte('created_at', endDate);
    if (error) throw error;
    return count;
}

export async function getTopPages(startDate, endDate, limit = 10) {
    const { data, error } = await supabase
        .rpc('get_top_pages', { start_date: startDate, end_date: endDate, page_limit: limit });
    if (error) {
        // Fallback if RPC not available
        const { data: events } = await supabase
            .from('analytics_events')
            .select('page_path')
            .eq('event_type', 'page_view')
            .gte('created_at', startDate)
            .lte('created_at', endDate);
        if (!events) return [];
        const counts = {};
        events.forEach(e => { counts[e.page_path] = (counts[e.page_path] || 0) + 1; });
        return Object.entries(counts)
            .sort((a, b) => b[1] - a[1])
            .slice(0, limit)
            .map(([path, count]) => ({ page_path: path, count }));
    }
    return data;
}

export async function aggregateDaily(date) {
    const dayStart = `${date}T00:00:00`;
    const dayEnd = `${date}T23:59:59`;

    const [visitors, pageViews, bookings, sales, registrations, signups] = await Promise.all([
        getEventCounts('page_view', dayStart, dayEnd),
        getEventCounts('page_view', dayStart, dayEnd),
        getEventCounts('demo_booking', dayStart, dayEnd),
        getEventCounts('ebook_purchase', dayStart, dayEnd),
        getEventCounts('tournament_register', dayStart, dayEnd),
        getEventCounts('signup', dayStart, dayEnd),
    ]);

    const { data, error } = await supabase
        .from('analytics_daily')
        .upsert([{
            date,
            visitors: visitors || 0,
            page_views: pageViews || 0,
            demo_bookings: bookings || 0,
            ebook_sales: sales || 0,
            tournament_registrations: registrations || 0,
            new_signups: signups || 0,
        }], { onConflict: 'date' })
        .select()
        .single();
    if (error) throw error;
    return data;
}

function getSessionId() {
    let sid = sessionStorage.getItem('ch_session_id');
    if (!sid) {
        sid = crypto.randomUUID();
        sessionStorage.setItem('ch_session_id', sid);
    }
    return sid;
}
