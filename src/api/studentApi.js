import { supabase } from '../services/supabase';

export async function getStudentProfile(userId) {
    if (!supabase) throw new Error('Supabase not configured');
    const { data, error } = await supabase
        .from('student_profiles')
        .select('*')
        .eq('user_id', userId)
        .single();
    if (error) throw error;
    return data;
}

export async function updateStudentProfile(id, updates) {
    if (!supabase) throw new Error('Supabase not configured');
    const { data, error } = await supabase
        .from('student_profiles')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
    if (error) throw error;
    return data;
}

export async function getAllStudents() {
    if (!supabase) return [];
    const { data, error } = await supabase
        .from('student_profiles')
        .select('*')
        .order('created_at', { ascending: false });
    if (error) throw error;
    return data;
}

export async function getStudentCourses(studentId) {
    if (!supabase) return [];
    const { data, error } = await supabase
        .from('student_courses')
        .select('*')
        .eq('student_id', studentId)
        .order('enrolled_at', { ascending: false });
    if (error) throw error;
    return data;
}

export async function enrollStudentCourse(studentId, courseId) {
    if (!supabase) throw new Error('Supabase not configured');
    const { data, error } = await supabase
        .from('student_courses')
        .insert([{ student_id: studentId, course_id: courseId }])
        .select()
        .single();
    if (error) throw error;
    return data;
}

export async function updateStudentCourse(id, updates) {
    if (!supabase) throw new Error('Supabase not configured');
    const { data, error } = await supabase
        .from('student_courses')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
    if (error) throw error;
    return data;
}

export async function getStudentProgress(studentId, metricType = null) {
    if (!supabase) return [];
    let query = supabase
        .from('student_progress')
        .select('*')
        .eq('student_id', studentId)
        .order('recorded_at', { ascending: true });
    if (metricType) query = query.eq('metric_type', metricType);
    const { data, error } = await query;
    if (error) throw error;
    return data;
}

export async function addProgressEntry(studentId, metricType, metricValue) {
    if (!supabase) throw new Error('Supabase not configured');
    const { data, error } = await supabase
        .from('student_progress')
        .insert([{ student_id: studentId, metric_type: metricType, metric_value: metricValue }])
        .select()
        .single();
    if (error) throw error;
    return data;
}

export async function getHomework(studentId) {
    if (!supabase) return [];
    const { data, error } = await supabase
        .from('homework_assignments')
        .select('*')
        .eq('student_id', studentId)
        .order('assigned_at', { ascending: false });
    if (error) throw error;
    return data;
}

export async function submitHomework(id, submissionText, submissionUrl) {
    if (!supabase) throw new Error('Supabase not configured');
    const { data, error } = await supabase
        .from('homework_assignments')
        .update({
            status: 'submitted',
            submission_text: submissionText,
            submission_url: submissionUrl,
            submitted_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select()
        .single();
    if (error) throw error;
    return data;
}

export async function getAllHomework() {
    if (!supabase) return [];
    const { data, error } = await supabase
        .from('homework_assignments')
        .select('*, student:student_profiles(full_name, email)')
        .order('assigned_at', { ascending: false });
    if (error) throw error;
    return data;
}

export async function createHomework(assignment) {
    if (!supabase) throw new Error('Supabase not configured');
    const { data, error } = await supabase
        .from('homework_assignments')
        .insert([assignment])
        .select()
        .single();
    if (error) throw error;
    return data;
}

export async function createStudentProfile(profile) {
    if (!supabase) return { success: false, error: 'Supabase not configured' };
    const { data, error } = await supabase
        .from('student_profiles')
        .insert([{
            user_id: profile.user_id || null,
            full_name: profile.name,
            email: profile.email,
            phone: profile.phone || null,
            level: profile.level || 'beginner',
            parent_name: profile.parent_name || null,
            parent_email: profile.parent_email || null,
            age: profile.age || null,
            plan_type: profile.plan_type || null,
            plan_price: profile.plan_price || null,
            sessions_remaining: profile.sessions_remaining || 0,
            sessions_completed: 0,
            status: 'active',
            assigned_coach_id: profile.assigned_coach_id || null,
        }])
        .select()
        .single();
    if (error) {
        console.error('Error creating student profile:', error);
        return { success: false, error };
    }
    return { success: true, data };
}

export async function deleteStudent(id) {
    if (!supabase) return { success: false };
    const { error } = await supabase
        .from('student_profiles')
        .delete()
        .eq('id', id);
    if (error) {
        console.error('Error deleting student:', error);
        return { success: false, error };
    }
    return { success: true };
}

export async function reviewHomework(id, feedback, grade) {
    if (!supabase) throw new Error('Supabase not configured');
    const { data, error } = await supabase
        .from('homework_assignments')
        .update({
            status: 'reviewed',
            coach_feedback: feedback,
            grade: grade,
            reviewed_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select()
        .single();
    if (error) throw error;
    return data;
}
