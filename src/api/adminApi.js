import { supabase } from '../services/supabase';

export async function createStudentAuth(email, password, fullName) {
    if (!supabase) return { success: false, error: 'Supabase not configured' };

    try {
        const { data, error } = await supabase.functions.invoke('create-student', {
            body: { email, password, full_name: fullName },
        });

        if (error) {
            console.error('Edge Function error:', error);
            return { success: false, error: error.message || 'Failed to create student account' };
        }

        if (data?.error) {
            return { success: false, error: data.error };
        }

        return {
            success: true,
            user_id: data.user_id,
            account_id: data.account_id,
            role: data.role || 'student',
        };
    } catch (err) {
        console.error('createStudentAuth error:', err);
        return { success: false, error: err.message || 'Failed to create student account' };
    }
}

export async function createCoachAuth(email, password, fullName) {
    if (!supabase) return { success: false, error: 'Supabase not configured' };

    try {
        const { data, error } = await supabase.functions.invoke('create-coach', {
            body: { email, password, full_name: fullName },
        });

        if (error) {
            console.error('Edge Function error:', error);
            return { success: false, error: error.message || 'Failed to create coach account' };
        }

        if (data?.error) {
            return { success: false, error: data.error };
        }

        return {
            success: true,
            user_id: data.user_id,
            account_id: data.account_id,
            role: data.role || 'coach',
        };
    } catch (err) {
        console.error('createCoachAuth error:', err);
        return { success: false, error: err.message || 'Failed to create coach account' };
    }
}
