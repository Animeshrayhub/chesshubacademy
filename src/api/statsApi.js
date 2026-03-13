import { supabase } from '../services/supabase';

export async function getUserStats(userId) {
    if (!supabase) {
        return {
            xp: parseInt(localStorage.getItem('userXP') || '0'),
            level: parseInt(localStorage.getItem('userLevel') || '1'),
            total_puzzles: parseInt(localStorage.getItem('totalPuzzles') || '0'),
            current_streak: parseInt(localStorage.getItem('puzzleStreak') || '0'),
            best_streak: parseInt(localStorage.getItem('bestStreak') || '0'),
        };
    }
    const { data, error } = await supabase
        .from('user_stats')
        .select('*')
        .eq('user_id', userId)
        .single();
    if (error && error.code !== 'PGRST116') {
        console.error('Error fetching user stats:', error);
        return null;
    }
    return data || null;
}

export async function updateUserStats(userId, stats) {
    if (!supabase) {
        if (stats.xp !== undefined) localStorage.setItem('userXP', String(stats.xp));
        if (stats.level !== undefined) localStorage.setItem('userLevel', String(stats.level));
        if (stats.total_puzzles !== undefined) localStorage.setItem('totalPuzzles', String(stats.total_puzzles));
        if (stats.current_streak !== undefined) localStorage.setItem('puzzleStreak', String(stats.current_streak));
        if (stats.best_streak !== undefined) localStorage.setItem('bestStreak', String(stats.best_streak));
        return { success: true };
    }
    const { error } = await supabase
        .from('user_stats')
        .upsert([{ user_id: userId, ...stats, updated_at: new Date().toISOString() }]);
    if (error) {
        console.error('Error updating user stats:', error);
        return { success: false, error };
    }
    return { success: true };
}
