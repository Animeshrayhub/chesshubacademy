import { supabase } from '../services/supabase';

export async function getSessions(studentId) {
    if (!supabase) return [];
    let query = supabase
        .from('sessions')
        .select('*, coach:coaches(id, name, title)')
        .order('date', { ascending: true });
    if (studentId) query = query.eq('student_id', studentId);
    const { data, error } = await query;
    if (error) throw error;
    return data;
}

export async function getUpcomingSessions(studentId) {
    if (!supabase) return [];
    const today = new Date().toISOString().split('T')[0];
    let query = supabase
        .from('sessions')
        .select('*, coach:coaches(id, name, title)')
        .gte('date', today)
        .eq('status', 'scheduled')
        .order('date', { ascending: true });
    if (studentId) query = query.eq('student_id', studentId);
    const { data, error } = await query;
    if (error) throw error;
    return data;
}

export async function getAllSessions() {
    if (!supabase) return [];
    const { data, error } = await supabase
        .from('sessions')
        .select('*, student:student_profiles(full_name, email)')
        .order('date', { ascending: false });
    if (error) throw error;
    return data;
}

export async function createSession(session) {
    if (!supabase) throw new Error('Supabase not configured');
    const { data, error } = await supabase
        .from('sessions')
        .insert([session])
        .select()
        .single();
    if (error) throw error;
    return data;
}

export async function updateSession(id, updates) {
    if (!supabase) throw new Error('Supabase not configured');
    const { data, error } = await supabase
        .from('sessions')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
    if (error) throw error;
    return data;
}

export async function deleteSession(id) {
    if (!supabase) throw new Error('Supabase not configured');
    const { error } = await supabase
        .from('sessions')
        .delete()
        .eq('id', id);
    if (error) throw error;
}
