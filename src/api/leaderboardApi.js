import { supabase } from '../services/supabase';

export async function getLeaderboard(period = 'all') {
    if (!supabase) {
        return [];
    }

    let query = supabase
        .from('leaderboard')
        .select('*')
        .order('score', { ascending: false })
        .limit(10);

    if (period !== 'all' && period !== 'all-time') {
        const now = new Date();
        let startDate;
        switch (period) {
            case 'daily':
                startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
                break;
            case 'weekly':
                startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
                break;
            case 'monthly':
                startDate = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
                break;
        }
        if (startDate) {
            query = query.gte('updated_at', startDate.toISOString());
        }
    }

    const { data, error } = await query;
    if (error) {
        console.error('Error fetching leaderboard:', error);
        return [];
    }
    return data.map((entry, index) => ({
        rank: index + 1,
        name: entry.username,
        score: entry.score,
        streak: entry.streak,
        avatar: index === 0 ? '👑' : index === 1 ? '🔥' : index === 2 ? '⭐' : '🎯',
    }));
}

export async function updateLeaderboardEntry(username, score, streak) {
    if (!supabase) return { success: false };
    const { error } = await supabase
        .from('leaderboard')
        .upsert([{ username, score, streak, updated_at: new Date().toISOString() }]);
    if (error) {
        console.error('Error updating leaderboard:', error);
        return { success: false, error };
    }
    return { success: true };
}
