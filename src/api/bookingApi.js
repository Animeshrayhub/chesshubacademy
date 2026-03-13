import { supabase } from '../services/supabase';
import { appendBookingToSheet } from '../services/googleSheets';

export async function getBookings() {
    if (!supabase) {
        return JSON.parse(localStorage.getItem('demoBookings') || '[]').reverse();
    }
    const { data, error } = await supabase
        .from('bookings')
        .select('*')
        .order('created_at', { ascending: false });
    if (error) return [];
    return data;
}

export async function createBooking(booking) {
    // Always send to Google Sheet (fire-and-forget)
    appendBookingToSheet(booking).catch(() => {});

    if (!supabase) {
        const bookings = JSON.parse(localStorage.getItem('demoBookings') || '[]');
        const newBooking = { ...booking, id: Date.now(), created_at: new Date().toISOString() };
        bookings.push(newBooking);
        localStorage.setItem('demoBookings', JSON.stringify(bookings));
        return { success: true, data: newBooking };
    }
    const { data, error } = await supabase
        .from('bookings')
        .insert([{
            name: booking.name,
            email: booking.email,
            phone: booking.phone,
            preferred_date: booking.preferredDate,
            preferred_time: booking.preferredTime,
            message: booking.message || '',
            status: 'pending',
        }])
        .select()
        .single();
    if (error) {
        console.error('Error creating booking:', error);
        return { success: false, error };
    }
    return { success: true, data };
}

export async function updateBookingStatus(id, status) {
    if (!supabase) {
        const bookings = JSON.parse(localStorage.getItem('demoBookings') || '[]');
        const updated = bookings.map(b => b.id === id ? { ...b, status } : b);
        localStorage.setItem('demoBookings', JSON.stringify(updated));
        return { success: true };
    }
    const { error } = await supabase
        .from('bookings')
        .update({ status })
        .eq('id', id);
    if (error) {
        console.error('Error updating booking:', error);
        return { success: false, error };
    }
    return { success: true };
}

export async function deleteBooking(id) {
    if (!supabase) {
        const bookings = JSON.parse(localStorage.getItem('demoBookings') || '[]');
        localStorage.setItem('demoBookings', JSON.stringify(bookings.filter(b => b.id !== id)));
        return { success: true };
    }
    const { error } = await supabase
        .from('bookings')
        .delete()
        .eq('id', id);
    if (error) {
        console.error('Error deleting booking:', error);
        return { success: false, error };
    }
    return { success: true };
}

export async function bulkUpdateBookingStatus(ids, status) {
    if (!supabase) {
        const bookings = JSON.parse(localStorage.getItem('demoBookings') || '[]');
        const updated = bookings.map(b => ids.includes(b.id) ? { ...b, status } : b);
        localStorage.setItem('demoBookings', JSON.stringify(updated));
        return { success: true };
    }
    const { error } = await supabase
        .from('bookings')
        .update({ status })
        .in('id', ids);
    if (error) {
        console.error('Error in bulk update:', error);
        return { success: false, error };
    }
    return { success: true };
}
