import { supabase } from '../services/supabase';

export async function getPuzzles(limit = 50) {
    if (!supabase) return [];
    const { data, error } = await supabase
        .from('puzzles')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(limit);
    if (error) { console.error('getPuzzles error:', error); return []; }
    return data;
}

export async function getRandomPuzzle(ratingRange = [800, 2500]) {
    if (!supabase) return null;
    const { data, error } = await supabase
        .from('puzzles')
        .select('*')
        .gte('rating', ratingRange[0])
        .lte('rating', ratingRange[1])
        .limit(20);
    if (error) { console.error('getRandomPuzzle error:', error); return null; }
    if (!data || data.length === 0) return null;
    return data[Math.floor(Math.random() * data.length)];
}

export async function createPuzzle(puzzle) {
    if (!supabase) return null;
    const { data, error } = await supabase
        .from('puzzles')
        .insert([puzzle])
        .select()
        .single();
    if (error) { console.error('createPuzzle error:', error); return null; }
    return data;
}

export async function deletePuzzle(id) {
    if (!supabase) return false;
    const { error } = await supabase.from('puzzles').delete().eq('id', id);
    if (error) { console.error('deletePuzzle error:', error); return false; }
    return true;
}

export async function recordPuzzleAttempt(attempt) {
    if (!supabase) return null;
    const { data, error } = await supabase
        .from('puzzle_attempts')
        .insert([attempt])
        .select()
        .single();
    if (error) { console.error('recordPuzzleAttempt error:', error); return null; }
    return data;
}

export async function getPuzzleAttempts(studentId) {
    if (!supabase) return [];
    const { data, error } = await supabase
        .from('puzzle_attempts')
        .select('*, puzzle:puzzles(fen, rating, themes)')
        .eq('student_id', studentId)
        .order('attempted_at', { ascending: false });
    if (error) { console.error('getPuzzleAttempts error:', error); return []; }
    return data;
}

export async function getPuzzleLeaderboard() {
    if (!supabase) return [];
    const { data, error } = await supabase
        .from('puzzle_attempts')
        .select('student_id, solved')
        .eq('solved', true);
    if (error) return [];
    const counts = {};
    (data || []).forEach(a => { counts[a.student_id] = (counts[a.student_id] || 0) + 1; });
    return Object.entries(counts)
        .map(([student_id, solved]) => ({ student_id, solved }))
        .sort((a, b) => b.solved - a.solved)
        .slice(0, 20);
}
