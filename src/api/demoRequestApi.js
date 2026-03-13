import { supabase } from '../services/supabase';
import { appendBookingToSheet } from '../services/googleSheets';

export async function createDemoRequest(request) {
    // Always send to Google Sheet (fire-and-forget)
    appendBookingToSheet({
        name: request.name,
        email: request.email,
        phone: request.phone,
        preferredDate: request.time_slot || '',
        preferredTime: '',
        message: request.message || '',
    }).catch(() => {});

    if (!supabase) {
        return { success: true, data: { ...request, id: Date.now() } };
    }

    const { data, error } = await supabase
        .from('demo_requests')
        .insert([{
            name: request.name,
            phone: request.phone || null,
            email: request.email || null,
            level: request.level || 'beginner',
            age: request.age || null,
            location: request.location || null,
            time_slot: request.time_slot || null,
            message: request.message || null,
            status: 'pending',
        }])
        .select()
        .single();

    if (error) {
        console.error('Error creating demo request:', error);
        return { success: false, error };
    }
    return { success: true, data };
}

export async function getDemoRequests() {
    if (!supabase) return [];
    const { data, error } = await supabase
        .from('demo_requests')
        .select('*')
        .order('created_at', { ascending: false });
    if (error) return [];
    return data;
}

export async function updateDemoRequest(id, updates) {
    if (!supabase) return { success: false };
    const { error } = await supabase
        .from('demo_requests')
        .update(updates)
        .eq('id', id);
    if (error) {
        console.error('Error updating demo request:', error);
        return { success: false, error };
    }
    return { success: true };
}

export async function deleteDemoRequest(id) {
    if (!supabase) return { success: false };
    const { error } = await supabase
        .from('demo_requests')
        .delete()
        .eq('id', id);
    if (error) {
        console.error('Error deleting demo request:', error);
        return { success: false, error };
    }
    return { success: true };
}
