import { supabase } from '../services/supabase';

export async function getBlogPosts() {
  if (!supabase) return [];
  const { data, error } = await supabase
    .from('blog_posts')
    .select('*')
    .eq('published', true)
    .order('created_at', { ascending: false });
  if (error) { console.error('getBlogPosts error:', error); return []; }
  return data;
}

export async function getAllBlogPosts() {
  if (!supabase) return [];
  const { data, error } = await supabase
    .from('blog_posts')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) { console.error('getAllBlogPosts error:', error); return []; }
  return data;
}

export async function getBlogBySlug(slug) {
  if (!supabase) return null;
  const { data, error } = await supabase
    .from('blog_posts')
    .select('*')
    .eq('slug', slug)
    .eq('published', true)
    .single();
  if (error) { console.error('getBlogBySlug error:', error); return null; }
  return data;
}

export async function getBlogsByCategory(category) {
  if (!supabase) return [];
  const { data, error } = await supabase
    .from('blog_posts')
    .select('*')
    .eq('published', true)
    .eq('category', category)
    .order('created_at', { ascending: false });
  if (error) { console.error('getBlogsByCategory error:', error); return []; }
  return data;
}

export async function getFeaturedPosts() {
  if (!supabase) return [];
  const { data, error } = await supabase
    .from('blog_posts')
    .select('*')
    .eq('published', true)
    .eq('featured', true)
    .order('created_at', { ascending: false })
    .limit(3);
  if (error) { console.error('getFeaturedPosts error:', error); return []; }
  return data;
}

export async function getRelatedPosts(category, excludeSlug, limit = 3) {
  if (!supabase || !category) return [];
  const { data, error } = await supabase
    .from('blog_posts')
    .select('id, title, slug, featured_image, meta_description, category, created_at, reading_time')
    .eq('published', true)
    .eq('category', category)
    .neq('slug', excludeSlug)
    .order('created_at', { ascending: false })
    .limit(limit);
  if (error) { console.error('getRelatedPosts error:', error); return []; }
  return data;
}

export async function createBlogPost(post) {
  if (!supabase) return null;
  const { data, error } = await supabase
    .from('blog_posts')
    .insert([post])
    .select()
    .single();
  if (error) { console.error('createBlogPost error:', error); return null; }
  return data;
}

export async function updateBlogPost(id, updates) {
  if (!supabase) return null;
  const { data, error } = await supabase
    .from('blog_posts')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();
  if (error) { console.error('updateBlogPost error:', error); return null; }
  return data;
}

export async function deleteBlogPost(id) {
  if (!supabase) return false;
  const { error } = await supabase.from('blog_posts').delete().eq('id', id);
  if (error) { console.error('deleteBlogPost error:', error); return false; }
  return true;
}

export async function getAllPublishedSlugs() {
  if (!supabase) return [];
  const { data, error } = await supabase
    .from('blog_posts')
    .select('slug, updated_at')
    .eq('published', true);
  if (error) { console.error('getAllPublishedSlugs error:', error); return []; }
  return data;
}
