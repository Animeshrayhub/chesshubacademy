import { supabase } from '../services/supabase';

export async function getReferralCode(studentId) {
    if (!supabase) return null;
    const { data, error } = await supabase
        .from('referral_codes')
        .select('*')
        .eq('student_id', studentId)
        .single();
    if (error) return null;
    return data;
}

export async function getOrCreateReferralCode(studentId, studentName) {
    if (!supabase) return null;
    const existing = await getReferralCode(studentId);
    if (existing) return existing;

    const code = 'CHESS' + Math.random().toString(36).substring(2, 6).toUpperCase();
    const { data, error } = await supabase
        .from('referral_codes')
        .insert([{ student_id: studentId, code }])
        .select()
        .single();
    if (error) { console.error('createReferralCode error:', error); return null; }
    return data;
}

export async function getReferralByCode(code) {
    if (!supabase) return null;
    const { data, error } = await supabase
        .from('referral_codes')
        .select('*')
        .eq('code', code)
        .single();
    if (error) return null;
    return data;
}

export async function incrementReferralCount(code) {
    if (!supabase) return null;
    const ref = await getReferralByCode(code);
    if (!ref) return null;
    const { data, error } = await supabase
        .from('referral_codes')
        .update({ referrals_count: (ref.referrals_count || 0) + 1 })
        .eq('id', ref.id)
        .select()
        .single();
    if (error) { console.error('incrementReferralCount error:', error); return null; }
    return data;
}

export async function getAllReferralCodes() {
    if (!supabase) return [];
    const { data, error } = await supabase
        .from('referral_codes')
        .select('*, student:student_profiles(full_name, email)')
        .order('referrals_count', { ascending: false });
    if (error) { console.error('getAllReferralCodes error:', error); return []; }
    return data;
}

export async function addReward(id, reward) {
    if (!supabase) return null;
    const { data: current } = await supabase.from('referral_codes').select('rewards').eq('id', id).single();
    const rewards = [...(current?.rewards || []), { ...reward, date: new Date().toISOString() }];
    const { data, error } = await supabase
        .from('referral_codes')
        .update({ rewards })
        .eq('id', id)
        .select()
        .single();
    if (error) { console.error('addReward error:', error); return null; }
    return data;
}
