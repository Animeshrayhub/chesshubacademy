import { supabase } from '../services/supabase';

export async function getEbooks() {
  if (!supabase) return [];
  const { data, error } = await supabase
    .from('ebooks')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) return [];
  return data;
}

export async function getEbook(id) {
  if (!supabase) return null;
  const { data, error } = await supabase
    .from('ebooks')
    .select('*')
    .eq('id', id)
    .single();
  if (error) { console.error('getEbook error:', error); return null; }
  return data;
}

export async function createEbook(ebook) {
  if (!supabase) return null;
  const { data, error } = await supabase
    .from('ebooks')
    .insert([ebook])
    .select()
    .single();
  if (error) { console.error('createEbook error:', error); return null; }
  return data;
}

export async function updateEbook(id, updates) {
  if (!supabase) return null;
  const { data, error } = await supabase
    .from('ebooks')
    .update(updates)
    .eq('id', id)
    .select()
    .single();
  if (error) { console.error('updateEbook error:', error); return null; }
  return data;
}

export async function deleteEbook(id) {
  if (!supabase) return false;
  const { error } = await supabase.from('ebooks').delete().eq('id', id);
  if (error) { console.error('deleteEbook error:', error); return false; }
  return true;
}

export async function createEbookOrder(order) {
  if (!supabase) return null;
  const { data, error } = await supabase
    .from('ebook_orders')
    .insert([order])
    .select()
    .single();
  if (error) { console.error('createEbookOrder error:', error); return null; }
  return data;
}

export async function getEbookOrders() {
  if (!supabase) return [];
  const { data, error } = await supabase
    .from('ebook_orders')
    .select('*, ebooks(title)')
    .order('created_at', { ascending: false });
  if (error) return [];
  return data;
}

export async function updateEbookOrderStatus(id, status) {
  if (!supabase) return null;
  const { data, error } = await supabase
    .from('ebook_orders')
    .update({ status })
    .eq('id', id)
    .select()
    .single();
  if (error) { console.error('updateEbookOrderStatus error:', error); return null; }
  return data;
}

export async function getApprovedOrder(ebookId, email) {
  if (!supabase) return null;
  const { data, error } = await supabase
    .from('ebook_orders')
    .select('*')
    .eq('ebook_id', ebookId)
    .eq('email', email)
    .eq('status', 'approved')
    .limit(1)
    .single();
  if (error) return null;
  return data;
}
