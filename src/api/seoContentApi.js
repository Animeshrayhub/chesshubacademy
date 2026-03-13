import { supabase } from '../services/supabase';

export async function getSEOContent() {
  if (!supabase) return [];
  const { data, error } = await supabase
    .from('seo_content')
    .select('*')
    .eq('published', true)
    .order('created_at', { ascending: false });
  if (error) { console.error('getSEOContent error:', error); return []; }
  return data;
}

export async function getAllSEOContent() {
  if (!supabase) return [];
  const { data, error } = await supabase
    .from('seo_content')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) { console.error('getAllSEOContent error:', error); return []; }
  return data;
}

export async function getSEOContentBySlug(slug) {
  if (!supabase) return null;
  const { data, error } = await supabase
    .from('seo_content')
    .select('*')
    .eq('slug', slug)
    .eq('published', true)
    .single();
  if (error) { console.error('getSEOContentBySlug error:', error); return null; }
  return data;
}

export async function getSEOContentByCategory(category) {
  if (!supabase) return [];
  const { data, error } = await supabase
    .from('seo_content')
    .select('*')
    .eq('published', true)
    .eq('category', category)
    .order('created_at', { ascending: false });
  if (error) { console.error('getSEOContentByCategory error:', error); return []; }
  return data;
}

export async function createSEOContent(content) {
  if (!supabase) return null;
  const { data, error } = await supabase
    .from('seo_content')
    .insert([content])
    .select()
    .single();
  if (error) { console.error('createSEOContent error:', error); return null; }
  return data;
}

export async function updateSEOContent(id, updates) {
  if (!supabase) return null;
  const { data, error } = await supabase
    .from('seo_content')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();
  if (error) { console.error('updateSEOContent error:', error); return null; }
  return data;
}

export async function deleteSEOContent(id) {
  if (!supabase) return false;
  const { error } = await supabase.from('seo_content').delete().eq('id', id);
  if (error) { console.error('deleteSEOContent error:', error); return false; }
  return true;
}

export async function getAllPublishedSEOSlugs() {
  if (!supabase) return [];
  const { data, error } = await supabase
    .from('seo_content')
    .select('slug, updated_at')
    .eq('published', true);
  if (error) { console.error('getAllPublishedSEOSlugs error:', error); return []; }
  return data;
}
