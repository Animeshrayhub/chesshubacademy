import { supabase } from '../services/supabase';

export async function getStudentActivity(studentId) {
    if (!supabase) return null;
    const { data, error } = await supabase
        .from('student_activity')
        .select('*')
        .eq('student_id', studentId)
        .single();
    if (error) return null;
    return data;
}

export async function upsertStudentActivity(studentId, updates) {
    if (!supabase) return null;
    const { data, error } = await supabase
        .from('student_activity')
        .upsert({ student_id: studentId, ...updates, updated_at: new Date().toISOString() }, { onConflict: 'student_id' })
        .select()
        .single();
    if (error) { console.error('upsertStudentActivity error:', error); return null; }
    return data;
}

export async function incrementActivity(studentId, field) {
    if (!supabase) return null;
    const current = await getStudentActivity(studentId);
    const val = current ? (current[field] || 0) + 1 : 1;
    return upsertStudentActivity(studentId, { [field]: val, last_active: new Date().toISOString() });
}

export async function getAllStudentActivity() {
    if (!supabase) return [];
    const { data, error } = await supabase
        .from('student_activity')
        .select('*, student:student_profiles(full_name, email)')
        .order('last_active', { ascending: false });
    if (error) { console.error('getAllStudentActivity error:', error); return []; }
    return data;
}
