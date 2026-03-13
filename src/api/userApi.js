import { supabase } from '../services/supabase';

export async function getUserRecord(userId) {
    if (!supabase || !userId) return null;
    const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .maybeSingle();
    if (error) return null;
    return data || null;
}

export async function setUserStatus(userId, status) {
    if (!supabase) return { success: false, error: 'Supabase not configured' };
    const allowed = ['active', 'inactive'];
    if (!allowed.includes(status)) {
        return { success: false, error: 'Invalid status' };
    }

    const { error } = await supabase
        .from('users')
        .update({ status })
        .eq('id', userId);

    if (error) {
        console.error('Error updating user status:', error);
        return { success: false, error: error.message };
    }
    return { success: true };
}

export async function resetUserPassword(userId, newPassword) {
    if (!supabase) return { success: false, error: 'Supabase not configured' };
    if (!newPassword || newPassword.length < 6) {
        return { success: false, error: 'Password must be at least 6 characters' };
    }

    const { data, error } = await supabase.functions.invoke('reset-user-password', {
        body: { user_id: userId, password: newPassword },
    });

    if (error) {
        return { success: false, error: error.message || 'Failed to reset password' };
    }
    if (data?.error) {
        return { success: false, error: data.error };
    }
    return { success: true };
}

export async function getAdminOverviewCounts() {
    if (!supabase) {
        return {
            students: 0,
            coaches: 0,
            sessionsToday: 0,
            upcomingClasses: 0,
            demoBookings: 0,
        };
    }

    const today = new Date().toISOString().split('T')[0];

    const [students, coaches, sessionsToday, upcomingClasses, demoBookings] = await Promise.allSettled([
        supabase.from('student_profiles').select('id', { count: 'exact', head: true }),
        supabase.from('coaches').select('id', { count: 'exact', head: true }),
        supabase.from('sessions').select('id', { count: 'exact', head: true }).eq('date', today),
        supabase.from('sessions').select('id', { count: 'exact', head: true }).gte('date', today).eq('status', 'scheduled'),
        supabase.from('bookings').select('id', { count: 'exact', head: true }),
    ]);

    const countOrZero = (r) => (r.status === 'fulfilled' ? (r.value.count || 0) : 0);

    return {
        students: countOrZero(students),
        coaches: countOrZero(coaches),
        sessionsToday: countOrZero(sessionsToday),
        upcomingClasses: countOrZero(upcomingClasses),
        demoBookings: countOrZero(demoBookings),
    };
}
