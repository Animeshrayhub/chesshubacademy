import { supabase } from '../services/supabase';

export async function getPuzzleHistory(studentId) {
    if (!supabase) return [];
    const { data, error } = await supabase
        .from('puzzle_history')
        .select('*')
        .eq('student_id', studentId)
        .order('attempted_at', { ascending: false });
    if (error) throw error;
    return data;
}

export async function addPuzzleAttempt(entry) {
    if (!supabase) throw new Error('Supabase not configured');
    const { data, error } = await supabase
        .from('puzzle_history')
        .insert([entry])
        .select()
        .single();
    if (error) throw error;
    return data;
}

export async function getGameAnalyses(studentId) {
    if (!supabase) return [];
    const { data, error } = await supabase
        .from('game_analysis_history')
        .select('*')
        .eq('student_id', studentId)
        .order('analyzed_at', { ascending: false });
    if (error) throw error;
    return data;
}

export async function addGameAnalysis(entry) {
    if (!supabase) throw new Error('Supabase not configured');
    const { data, error } = await supabase
        .from('game_analysis_history')
        .insert([entry])
        .select()
        .single();
    if (error) throw error;
    return data;
}

export async function getOpeningProgress(studentId) {
    if (!supabase) return [];
    const { data, error } = await supabase
        .from('opening_training_progress')
        .select('*')
        .eq('student_id', studentId)
        .order('mastery_pct', { ascending: false });
    if (error) throw error;
    return data;
}

export async function upsertOpeningProgress(entry) {
    if (!supabase) throw new Error('Supabase not configured');
    const { data, error } = await supabase
        .from('opening_training_progress')
        .upsert(entry, { onConflict: 'student_id,opening_name,color' })
        .select()
        .single();
    if (error) throw error;
    return data;
}
