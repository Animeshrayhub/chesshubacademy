import { supabase } from '../services/supabase';

export async function getAllDemoStudents() {
    if (!supabase) return [];
    const { data, error } = await supabase
        .from('demo_students')
        .select('*')
        .order('created_at', { ascending: false });
    if (error) {
        console.error('Error fetching demo students:', error);
        return [];
    }
    return data;
}

export async function createDemoStudent(student) {
    if (!supabase) return { success: false, error: 'Supabase not configured' };
    const { data, error } = await supabase
        .from('demo_students')
        .insert([{
            name: student.name,
            email: student.email || null,
            phone: student.phone || null,
            demo_username: student.demo_username,
            demo_password: student.demo_password,
            demo_date: student.demo_date || null,
            status: 'active',
            notes: student.notes || null,
        }])
        .select()
        .single();
    if (error) {
        console.error('Error creating demo student:', error);
        return { success: false, error };
    }
    return { success: true, data };
}

export async function updateDemoStudent(id, updates) {
    if (!supabase) return { success: false, error: 'Supabase not configured' };
    const { data, error } = await supabase
        .from('demo_students')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();
    if (error) {
        console.error('Error updating demo student:', error);
        return { success: false, error };
    }
    return { success: true, data };
}

export async function deleteDemoStudent(id) {
    if (!supabase) return { success: false };
    const { error } = await supabase
        .from('demo_students')
        .delete()
        .eq('id', id);
    if (error) {
        console.error('Error deleting demo student:', error);
        return { success: false, error };
    }
    return { success: true };
}

export async function loginDemoStudent(username, password) {
    if (!supabase) return { success: false, error: 'Supabase not configured' };
    try {
        // Server-side auth via edge function — password is never returned to the browser
        const { data, error } = await supabase.functions.invoke('demo-login', {
            body: { username, password },
        });
        if (error) {
            return { success: false, error: 'Invalid demo credentials' };
        }
        if (data?.error) {
            return { success: false, error: data.error };
        }
        return { success: true, data: data.data };
    } catch {
        return { success: false, error: 'Invalid demo credentials' };
    }
}

export async function convertDemoToStudent(demoId) {
    if (!supabase) return { success: false, error: 'Supabase not configured' };

    // Get demo student info
    const { data: demo, error: fetchErr } = await supabase
        .from('demo_students')
        .select('*')
        .eq('id', demoId)
        .single();

    if (fetchErr || !demo) {
        return { success: false, error: 'Demo student not found' };
    }

    // Create student profile in student_profiles table
    const { data: studentProfile, error: profileErr } = await supabase
        .from('student_profiles')
        .insert([{
            full_name: demo.name,
            email: demo.email || null,
            phone: demo.phone || null,
            level: 'beginner',
        }])
        .select()
        .single();

    if (profileErr) {
        console.error('Error creating student profile from demo:', profileErr);
        return { success: false, error: profileErr };
    }

    // Mark demo account as converted
    await supabase
        .from('demo_students')
        .update({
            status: 'converted',
            converted_student_id: studentProfile.id,
            updated_at: new Date().toISOString(),
        })
        .eq('id', demoId);

    return { success: true, data: studentProfile };
}
