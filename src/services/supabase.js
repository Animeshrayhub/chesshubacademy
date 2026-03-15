import { createClient } from '@supabase/supabase-js';

// Supabase configuration — env vars are required
const rawSupabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const rawSupabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

const supabaseUrl = typeof rawSupabaseUrl === 'string' ? rawSupabaseUrl.trim() : rawSupabaseUrl;
const supabaseAnonKey = typeof rawSupabaseAnonKey === 'string'
    ? rawSupabaseAnonKey.replace(/\s+/g, '')
    : rawSupabaseAnonKey;

export function getSupabaseEnvDiagnostics() {
    const hasUrl = typeof rawSupabaseUrl === 'string' && rawSupabaseUrl.trim().length > 0;
    const sanitizedKey = typeof rawSupabaseAnonKey === 'string' ? rawSupabaseAnonKey.replace(/\s+/g, '') : '';
    const hasAnonKey = typeof sanitizedKey === 'string' && sanitizedKey.length > 0;
    const anonKeyLooksJwt = hasAnonKey && sanitizedKey.split('.').length === 3;
    return {
        hasUrl,
        hasAnonKey,
        anonKeyLooksJwt,
        urlPreview: hasUrl ? `${rawSupabaseUrl.trim().slice(0, 32)}...` : null,
        anonKeyLength: hasAnonKey ? sanitizedKey.length : 0,
    };
}

if (typeof rawSupabaseAnonKey === 'string' && /\s/.test(rawSupabaseAnonKey)) {
    console.warn('[ChessHub] VITE_SUPABASE_ANON_KEY contains whitespace/newlines; sanitized automatically.');
}

if (!supabaseUrl || !supabaseAnonKey) {
    console.warn(
        '[ChessHub] Missing Supabase environment variables.\n' +
        'Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your .env file.\n' +
        'Database features will be unavailable.'
    );
}

// Create Supabase client (will be null if env vars missing or invalid)
let _supabase = null;
try {
    if (supabaseUrl && supabaseAnonKey) {
        _supabase = createClient(supabaseUrl, supabaseAnonKey);
    }
} catch (err) {
    console.error('[ChessHub] Failed to create Supabase client:', err.message);
}
export const supabase = _supabase;

// Database helper functions

function requireClient() {
    if (!supabase) {
        return { success: false, error: new Error('Supabase not configured') };
    }
    return null;
}

/**
 * Save demo assessment to database
 */
export async function saveDemoAssessment(data) {
    const check = requireClient();
    if (check) return check;
    try {
        const { data: result, error } = await supabase
            .from('demo_assessments')
            .insert([{
                name: data.name,
                email: data.email,
                phone: data.phone,
                age: data.age,
                experience: data.experience,
                game_pgn: data.gameData?.pgn || '',
                game_moves: data.gameData?.history || [],
                accuracy: data.assessment?.accuracy || 0,
                tactical_rating: data.assessment?.tacticalRating || 0,
                positional_rating: data.assessment?.positionalRating || 0,
                recommended_course: data.assessment?.recommendedCourse || '',
                strengths: data.assessment?.strengths || [],
                weaknesses: data.assessment?.weaknesses || [],
                suggested_focus: data.assessment?.suggestedFocus || [],
                created_at: new Date().toISOString()
            }])
            .select();

        if (error) {
            console.error('Supabase error:', error);
            return { success: false, error };
        }

        return { success: true, data: result };
    } catch (error) {
        console.error('Error saving demo assessment:', error);
        return { success: false, error };
    }
}

/**
 * Get leaderboard data
 */
export async function getLeaderboard(period = 'all') {
    const check = requireClient();
    if (check) return check;
    try {
        let query = supabase
            .from('leaderboard')
            .select('*')
            .order('score', { ascending: false })
            .limit(10);

        // Filter by period if needed
        if (period !== 'all') {
            const now = new Date();
            let startDate;

            switch (period) {
                case 'daily':
                    startDate = new Date(now.setHours(0, 0, 0, 0));
                    break;
                case 'weekly':
                    startDate = new Date(now.setDate(now.getDate() - 7));
                    break;
                case 'monthly':
                    startDate = new Date(now.setMonth(now.getMonth() - 1));
                    break;
            }

            if (startDate) {
                query = query.gte('created_at', startDate.toISOString());
            }
        }

        const { data, error } = await query;

        if (error) {
            console.error('Supabase error:', error);
            return { success: false, error };
        }

        return { success: true, data };
    } catch (error) {
        console.error('Error fetching leaderboard:', error);
        return { success: false, error };
    }
}

/**
 * Update user stats
 */
export async function updateUserStats(userId, stats) {
    const check = requireClient();
    if (check) return check;
    try {
        const { data, error } = await supabase
            .from('user_stats')
            .upsert([{
                user_id: userId,
                xp: stats.xp,
                level: stats.level,
                total_puzzles: stats.totalPuzzles,
                current_streak: stats.currentStreak,
                best_streak: stats.bestStreak,
                updated_at: new Date().toISOString()
            }])
            .select();

        if (error) {
            console.error('Supabase error:', error);
            return { success: false, error };
        }

        return { success: true, data };
    } catch (error) {
        console.error('Error updating user stats:', error);
        return { success: false, error };
    }
}

/**
 * Get user stats
 */
export async function getUserStats(userId) {
    const check = requireClient();
    if (check) return check;
    try {
        const { data, error } = await supabase
            .from('user_stats')
            .select('*')
            .eq('user_id', userId)
            .single();

        if (error && error.code !== 'PGRST116') { // Not found is ok
            console.error('Supabase error:', error);
            return { success: false, error };
        }

        return { success: true, data: data || null };
    } catch (error) {
        console.error('Error fetching user stats:', error);
        return { success: false, error };
    }
}

/**
 * Update leaderboard entry
 */
export async function updateLeaderboardEntry(username, score, streak) {
    const check = requireClient();
    if (check) return check;
    try {
        const { data, error } = await supabase
            .from('leaderboard')
            .upsert([{
                username,
                score,
                streak,
                updated_at: new Date().toISOString()
            }])
            .select();

        if (error) {
            console.error('Supabase error:', error);
            return { success: false, error };
        }

        return { success: true, data };
    } catch (error) {
        console.error('Error updating leaderboard:', error);
        return { success: false, error };
    }
}

export default supabase;
