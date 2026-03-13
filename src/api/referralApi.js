import { supabase } from '../services/supabase';

export async function getReferrals(userId) {
  if (!supabase) return [];
  const { data, error } = await supabase
    .from('referrals')
    .select('*')
    .eq('referrer_user_id', userId)
    .order('created_at', { ascending: false });
  if (error) { console.error('getReferrals error:', error); return []; }
  return data;
}

export async function getAllReferrals() {
  if (!supabase) return [];
  const { data, error } = await supabase
    .from('referrals')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) { console.error('getAllReferrals error:', error); return []; }
  return data;
}

export async function createReferral(referral) {
  if (!supabase) return null;
  const { data, error } = await supabase
    .from('referrals')
    .insert([referral])
    .select()
    .single();
  if (error) { console.error('createReferral error:', error); return null; }
  return data;
}

export async function updateReferralStatus(id, status) {
  if (!supabase) return null;
  const { data, error } = await supabase
    .from('referrals')
    .update({ status })
    .eq('id', id)
    .select()
    .single();
  if (error) { console.error('updateReferralStatus error:', error); return null; }
  return data;
}

export function generateReferralCode(userId) {
  if (!userId) return '';
  return 'CH-' + userId.substring(0, 8).toUpperCase();
}
