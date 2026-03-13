import { supabase } from '../services/supabase';

export async function createLead(lead) {
    if (!supabase) return null;
    const { data, error } = await supabase
        .from('leads')
        .insert([lead])
        .select()
        .single();
    if (error) { console.error('createLead error:', error); return null; }
    return data;
}

export async function getLeads(filters = {}) {
    if (!supabase) return [];
    let query = supabase.from('leads').select('*').order('created_at', { ascending: false });
    if (filters.source) query = query.eq('source', filters.source);
    if (filters.status) query = query.eq('status', filters.status);
    const { data, error } = await query;
    if (error) { console.error('getLeads error:', error); return []; }
    return data;
}

export async function updateLead(id, updates) {
    if (!supabase) return null;
    const { data, error } = await supabase
        .from('leads')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
    if (error) { console.error('updateLead error:', error); return null; }
    return data;
}

export async function deleteLead(id) {
    if (!supabase) return false;
    const { error } = await supabase.from('leads').delete().eq('id', id);
    if (error) { console.error('deleteLead error:', error); return false; }
    return true;
}

export async function getLeadStats() {
    if (!supabase) return {};
    const { data, error } = await supabase.from('leads').select('source, status');
    if (error) { console.error('getLeadStats error:', error); return {}; }

    const bySource = {};
    const byStatus = {};
    (data || []).forEach(l => {
        bySource[l.source] = (bySource[l.source] || 0) + 1;
        byStatus[l.status] = (byStatus[l.status] || 0) + 1;
    });
    return { total: data.length, bySource, byStatus };
}
