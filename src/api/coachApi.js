import { supabase } from '../services/supabase';

const DEFAULT_COACHES = [
    {
        id: 1,
        name: 'GM Rajesh Kumar',
        title: 'GM',
        rating: 2650,
        email: 'rajesh@chesshub.com',
        phone: '+91 9876543210',
        specialization: 'Opening Theory, Endgames',
        experience: '15 years',
        hourly_rate: '₹2000',
        availability: 'available',
        students: 25,
        total_hours: 1250,
        rating_avg: 4.9,
        bio: 'Grandmaster with 15 years of coaching experience.',
        achievements: '2x National Champion, Asian Championship Bronze Medal',
        languages: 'English, Hindi, Tamil',
        photo_url: '👨‍🏫'
    },
    {
        id: 2,
        name: 'IM Priya Sharma',
        title: 'IM',
        rating: 2480,
        email: 'priya@chesshub.com',
        phone: '+91 9876543211',
        specialization: 'Tactics, Middle Game',
        experience: '10 years',
        hourly_rate: '₹1500',
        availability: 'available',
        students: 20,
        total_hours: 980,
        rating_avg: 4.8,
        bio: 'International Master specializing in tactical training.',
        achievements: 'Women\'s National Champion 2019, Commonwealth Games Silver',
        languages: 'English, Hindi',
        photo_url: '👩‍🏫'
    },
    {
        id: 3,
        name: 'FM Arjun Patel',
        title: 'FM',
        rating: 2350,
        email: 'arjun@chesshub.com',
        phone: '+91 9876543212',
        specialization: 'Kids Training, Fundamentals',
        experience: '8 years',
        hourly_rate: '₹1200',
        availability: 'busy',
        students: 15,
        total_hours: 750,
        rating_avg: 4.9,
        bio: 'FIDE Master with expertise in teaching young players.',
        achievements: 'State Champion, Youth Coach of the Year 2022',
        languages: 'English, Hindi, Gujarati',
        photo_url: '🧑‍🏫'
    }
];

export async function getCoaches() {
    if (!supabase) {
        const stored = JSON.parse(localStorage.getItem('coaches') || 'null');
        return stored || DEFAULT_COACHES;
    }
    const { data, error } = await supabase
        .from('coaches')
        .select('*')
        .order('id', { ascending: true });
    if (error || !data || data.length === 0) {
        return DEFAULT_COACHES;
    }
    return data;
}

export async function addCoach(coach) {
    if (!supabase) {
        const coaches = JSON.parse(localStorage.getItem('coaches') || '[]');
        const newCoach = { ...coach, id: Date.now() };
        coaches.push(newCoach);
        localStorage.setItem('coaches', JSON.stringify(coaches));
        return { success: true, data: newCoach };
    }
    const { data, error } = await supabase
        .from('coaches')
        .insert([coach])
        .select()
        .single();
    if (error) {
        console.error('Error adding coach:', error);
        return { success: false, error };
    }
    return { success: true, data };
}

export async function updateCoach(id, updates) {
    if (!supabase) {
        const coaches = JSON.parse(localStorage.getItem('coaches') || '[]');
        const updated = coaches.map(c => c.id === id ? { ...c, ...updates } : c);
        localStorage.setItem('coaches', JSON.stringify(updated));
        return { success: true };
    }
    const { error } = await supabase
        .from('coaches')
        .update(updates)
        .eq('id', id);
    if (error) {
        console.error('Error updating coach:', error);
        return { success: false, error };
    }
    return { success: true };
}

export async function deleteCoach(id) {
    if (!supabase) {
        const coaches = JSON.parse(localStorage.getItem('coaches') || '[]');
        localStorage.setItem('coaches', JSON.stringify(coaches.filter(c => c.id !== id)));
        return { success: true };
    }
    const { error } = await supabase
        .from('coaches')
        .delete()
        .eq('id', id);
    if (error) {
        console.error('Error deleting coach:', error);
        return { success: false, error };
    }
    return { success: true };
}
