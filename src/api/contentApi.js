import { supabase } from '../services/supabase';

export async function getContentByType(contentType) {
  if (!supabase) return [];
  const { data, error } = await supabase
    .from('site_content')
    .select('*')
    .eq('content_type', contentType)
    .eq('is_active', true)
    .order('sort_order', { ascending: true });
  if (error) return [];
  return data;
}

export async function getAllContent(contentType) {
  if (!supabase) return [];
  let query = supabase
    .from('site_content')
    .select('*')
    .order('sort_order', { ascending: true });
  if (contentType) query = query.eq('content_type', contentType);
  const { data, error } = await query;
  if (error) { console.error('getAllContent error:', error); return []; }
  return data;
}

export async function createContent(item) {
  if (!supabase) return null;
  const { data, error } = await supabase
    .from('site_content')
    .insert([item])
    .select()
    .single();
  if (error) { console.error('createContent error:', error); return null; }
  return data;
}

export async function updateContent(id, updates) {
  if (!supabase) return null;
  const { data, error } = await supabase
    .from('site_content')
    .update(updates)
    .eq('id', id)
    .select()
    .single();
  if (error) { console.error('updateContent error:', error); return null; }
  return data;
}

export async function deleteContent(id) {
  if (!supabase) return false;
  const { error } = await supabase.from('site_content').delete().eq('id', id);
  if (error) { console.error('deleteContent error:', error); return false; }
  return true;
}

export async function getYoutubeVideos() {
  if (!supabase) return [];
  const { data, error } = await supabase
    .from('youtube_videos')
    .select('*')
    .eq('is_active', true)
    .order('sort_order', { ascending: true });
  if (error) return [];
  return data;
}

export async function getAllYoutubeVideos() {
  if (!supabase) return [];
  const { data, error } = await supabase
    .from('youtube_videos')
    .select('*')
    .order('sort_order', { ascending: true });
  if (error) { console.error('getAllYoutubeVideos error:', error); return []; }
  return data;
}

export async function createYoutubeVideo(video) {
  if (!supabase) return null;
  const { data, error } = await supabase
    .from('youtube_videos')
    .insert([video])
    .select()
    .single();
  if (error) { console.error('createYoutubeVideo error:', error); return null; }
  return data;
}

export async function updateYoutubeVideo(id, updates) {
  if (!supabase) return null;
  const { data, error } = await supabase
    .from('youtube_videos')
    .update(updates)
    .eq('id', id)
    .select()
    .single();
  if (error) { console.error('updateYoutubeVideo error:', error); return null; }
  return data;
}

export async function deleteYoutubeVideo(id) {
  if (!supabase) return false;
  const { error } = await supabase.from('youtube_videos').delete().eq('id', id);
  if (error) { console.error('deleteYoutubeVideo error:', error); return false; }
  return true;
}
