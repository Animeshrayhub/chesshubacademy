import { supabase } from '../services/supabase';

export async function getCoachByUserId(userId) {
    if (!supabase || !userId) return null;
    const { data, error } = await supabase
        .from('coaches')
        .select('*')
        .eq('user_id', userId)
        .single();
    if (error) {
        console.error('Error fetching coach profile:', error);
        return null;
    }
    return data;
}

export async function getAssignedStudents(coachId) {
    if (!supabase) return [];
    const { data, error } = await supabase
        .from('student_profiles')
        .select('*')
        .eq('assigned_coach_id', coachId)
        .order('full_name', { ascending: true });
    if (error) {
        console.error('Error fetching assigned students:', error);
        return [];
    }
    return data;
}

export async function getCoachSessions(coachId) {
    if (!supabase) return [];
    const { data, error } = await supabase
        .from('sessions')
        .select('*, student:student_profiles(id, full_name, email, level)')
        .eq('coach_id', coachId)
        .order('date', { ascending: true });
    if (error) {
        console.error('Error fetching coach sessions:', error);
        return [];
    }
    return data;
}

export async function getCoachUpcomingSessions(coachId) {
    if (!supabase) return [];
    const today = new Date().toISOString().split('T')[0];
    const { data, error } = await supabase
        .from('sessions')
        .select('*, student:student_profiles(id, full_name, email, level)')
        .eq('coach_id', coachId)
        .gte('date', today)
        .eq('status', 'scheduled')
        .order('date', { ascending: true });
    if (error) {
        console.error('Error fetching upcoming sessions:', error);
        return [];
    }
    return data;
}

export async function getCoachHomework(coachId) {
    if (!supabase) return [];
    const { data, error } = await supabase
        .from('homework_assignments')
        .select('*, student:student_profiles(id, full_name, email)')
        .eq('coach_id', coachId)
        .order('assigned_at', { ascending: false });
    if (error) {
        console.error('Error fetching coach homework:', error);
        return [];
    }
    return data;
}

export async function updateSessionLink(sessionId, meetingLink) {
    if (!supabase) return { success: false };
    const { error } = await supabase
        .from('sessions')
        .update({ meeting_link: meetingLink })
        .eq('id', sessionId);
    if (error) {
        console.error('Error updating session link:', error);
        return { success: false, error };
    }
    return { success: true };
}

export async function markSessionComplete(sessionId, notes) {
    if (!supabase) return { success: false };

    // Get session details first to update student's sessions count
    const { data: session } = await supabase
        .from('sessions')
        .select('student_id')
        .eq('id', sessionId)
        .single();

    const { error } = await supabase
        .from('sessions')
        .update({
            status: 'completed',
            notes: notes || null,
            actual_end: new Date().toISOString(),
        })
        .eq('id', sessionId);

    if (error) {
        console.error('Error marking session complete:', error);
        return { success: false, error };
    }

    // Update student's session counts
    if (session?.student_id) {
        const { data: student } = await supabase
            .from('student_profiles')
            .select('sessions_completed, sessions_remaining')
            .eq('id', session.student_id)
            .single();

        if (student) {
            await supabase
                .from('student_profiles')
                .update({
                    sessions_completed: (student.sessions_completed || 0) + 1,
                    sessions_remaining: Math.max(0, (student.sessions_remaining || 0) - 1),
                })
                .eq('id', session.student_id);
        }
    }

    return { success: true };
}

export async function markSessionNoShow(sessionId) {
    if (!supabase) return { success: false };
    const { error } = await supabase
        .from('sessions')
        .update({ status: 'no_show' })
        .eq('id', sessionId);
    if (error) {
        console.error('Error marking no show:', error);
        return { success: false, error };
    }
    return { success: true };
}

export async function createCoachHomework(assignment) {
    if (!supabase) return { success: false };
    const { data, error } = await supabase
        .from('homework_assignments')
        .insert([assignment])
        .select()
        .single();
    if (error) {
        console.error('Error creating homework:', error);
        return { success: false, error };
    }
    return { success: true, data };
}

export async function reviewHomeworkByCoach(homeworkId, feedback, grade) {
    if (!supabase) return { success: false };
    const { error } = await supabase
        .from('homework_assignments')
        .update({
            status: 'reviewed',
            coach_feedback: feedback,
            grade: grade,
            reviewed_at: new Date().toISOString(),
        })
        .eq('id', homeworkId);
    if (error) {
        console.error('Error reviewing homework:', error);
        return { success: false, error };
    }
    return { success: true };
}

export async function getCoachStats(coachId) {
    if (!supabase) return null;

    const today = new Date().toISOString().split('T')[0];
    const monthStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0];

    const [students, upcomingSessions, allSessions, pendingHw] = await Promise.allSettled([
        supabase.from('student_profiles').select('id', { count: 'exact' }).eq('assigned_coach_id', coachId),
        supabase.from('sessions').select('id', { count: 'exact' }).eq('coach_id', coachId).gte('date', today).eq('status', 'scheduled'),
        supabase.from('sessions').select('id, duration', { count: 'exact' }).eq('coach_id', coachId).eq('status', 'completed').gte('date', monthStart),
        supabase.from('homework_assignments').select('id', { count: 'exact' }).eq('coach_id', coachId).eq('status', 'submitted'),
    ]);

    const totalStudents = students.status === 'fulfilled' ? (students.value.count || 0) : 0;
    const upcomingCount = upcomingSessions.status === 'fulfilled' ? (upcomingSessions.value.count || 0) : 0;
    const completedThisMonth = allSessions.status === 'fulfilled' ? (allSessions.value.count || 0) : 0;
    const pendingReviews = pendingHw.status === 'fulfilled' ? (pendingHw.value.count || 0) : 0;

    // Calculate hours this month
    let hoursThisMonth = 0;
    if (allSessions.status === 'fulfilled' && allSessions.value.data) {
        hoursThisMonth = allSessions.value.data.reduce((sum, s) => sum + (s.duration || 60) / 60, 0);
    }

    return {
        totalStudents,
        upcomingSessions: upcomingCount,
        completedThisMonth,
        pendingReviews,
        hoursThisMonth: Math.round(hoursThisMonth * 10) / 10,
    };
}
