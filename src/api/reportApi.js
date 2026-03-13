import { supabase } from '../services/supabase';

export async function getProgressReports(studentId) {
    if (!supabase) return [];
    const { data, error } = await supabase
        .from('progress_reports')
        .select('*')
        .eq('student_id', studentId)
        .order('generated_at', { ascending: false });
    if (error) throw error;
    return data;
}

export async function getAllReports() {
    if (!supabase) return [];
    const { data, error } = await supabase
        .from('progress_reports')
        .select('*, student:student_profiles(full_name, email, parent_email)')
        .order('generated_at', { ascending: false });
    if (error) throw error;
    return data;
}

export async function createReport(report) {
    if (!supabase) throw new Error('Supabase not configured');
    const { data, error } = await supabase
        .from('progress_reports')
        .insert([report])
        .select()
        .single();
    if (error) throw error;
    return data;
}

export async function deleteReport(id) {
    if (!supabase) throw new Error('Supabase not configured');
    const { error } = await supabase
        .from('progress_reports')
        .delete()
        .eq('id', id);
    if (error) throw error;
}
