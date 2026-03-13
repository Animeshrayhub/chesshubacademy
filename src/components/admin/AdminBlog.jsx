import { useState, useEffect } from 'react';
import { getAllBlogPosts, createBlogPost, updateBlogPost, deleteBlogPost } from '../../api/blogApi';
import { BLOG_CATEGORIES, SEO_KEYWORDS, calculateReadingTime, calculateSEOScore } from '../../utils/seoKeywords';

export default function AdminBlog() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null);
  const [seoScore, setSeoScore] = useState(null);
  const [form, setForm] = useState({
    title: '', slug: '', content: '', featured_image: '',
    meta_title: '', meta_description: '', published: false,
    category: '', keywords: '', featured: false, author: 'ChessHub Academy',
  });

  const defaultForm = {
    title: '', slug: '', content: '', featured_image: '',
    meta_title: '', meta_description: '', published: false,
    category: '', keywords: '', featured: false, author: 'ChessHub Academy',
  };

  async function load() {
    setLoading(true);
    setPosts(await getAllBlogPosts());
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  // Live SEO score
  useEffect(() => {
    if (editing) {
      const result = calculateSEOScore(form);
      setSeoScore(result);
    } else {
      setSeoScore(null);
    }
  }, [form, editing]);

  function openNew() {
    setEditing('new');
    setForm(defaultForm);
  }

  function openEdit(post) {
    setEditing(post.id);
    setForm({
      title: post.title, slug: post.slug, content: post.content || '',
      featured_image: post.featured_image || '',
      meta_title: post.meta_title || '', meta_description: post.meta_description || '',
      published: post.published || false,
      category: post.category || '', keywords: post.keywords || '',
      featured: post.featured || false, author: post.author || 'ChessHub Academy',
    });
  }

  function generateSlug(title) {
    return title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  }

  async function handleSave(e) {
    e.preventDefault();
    const payload = {
      ...form,
      reading_time: calculateReadingTime(form.content),
    };
    if (!payload.slug) payload.slug = generateSlug(payload.title);

    if (editing === 'new') await createBlogPost(payload);
    else await updateBlogPost(editing, payload);
    setEditing(null);
    load();
  }

  async function handleDelete(id) {
    if (!confirm('Delete this blog post?')) return;
    await deleteBlogPost(id);
    load();
  }

  function scoreColor(score) {
    if (score >= 80) return '#10b981';
    if (score >= 50) return '#f59e0b';
    return '#ef4444';
  }

  function getPostSEOScore(post) {
    return calculateSEOScore(post).score;
  }

  return (
    <div className="admin-section">
      <div className="section-header">
        <h2>📝 Blog Posts</h2>
        <button className="btn btn-primary" onClick={openNew}>+ New Post</button>
      </div>

      {editing && (
        <form className="admin-form glass-card" onSubmit={handleSave}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3>{editing === 'new' ? 'Create Post' : 'Edit Post'}</h3>
            {seoScore && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '0.8rem', color: '#aaa' }}>SEO Score</span>
                <span style={{
                  fontSize: '1.4rem', fontWeight: 700,
                  color: scoreColor(seoScore.score),
                }}>{seoScore.score}/100</span>
              </div>
            )}
          </div>

          {seoScore && seoScore.issues.length > 0 && (
            <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '8px', padding: '10px 14px', fontSize: '0.8rem' }}>
              <strong style={{ color: '#f87171' }}>SEO Issues:</strong>
              <ul style={{ margin: '4px 0 0', paddingLeft: '18px', color: '#fca5a5' }}>
                {seoScore.issues.map((issue, i) => <li key={i}>{issue}</li>)}
              </ul>
            </div>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
            <label>Title
              <input value={form.title} onChange={e => {
                setForm({...form, title: e.target.value, slug: generateSlug(e.target.value)});
              }} required />
            </label>
            <label>Slug<input value={form.slug} onChange={e => setForm({...form, slug: e.target.value})} /></label>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
            <label>Category
              <select value={form.category} onChange={e => setForm({...form, category: e.target.value})}
                style={{ padding: '0.5rem', borderRadius: '6px', border: '1px solid #444', background: '#111', color: '#fff' }}>
                <option value="">— Select Category —</option>
                {BLOG_CATEGORIES.map(c => (
                  <option key={c.id} value={c.id}>{c.icon} {c.label}</option>
                ))}
              </select>
            </label>
            <label>Author
              <input value={form.author} onChange={e => setForm({...form, author: e.target.value})} />
            </label>
          </div>

          <label>SEO Keywords (comma separated)
            <input value={form.keywords} onChange={e => setForm({...form, keywords: e.target.value})}
              placeholder="learn chess online, chess openings, chess strategy" />
            <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap', marginTop: '4px' }}>
              {SEO_KEYWORDS.slice(0, 8).map(k => (
                <button type="button" key={k.keyword}
                  onClick={() => {
                    const existing = form.keywords ? form.keywords.split(',').map(s => s.trim()) : [];
                    if (!existing.includes(k.keyword)) {
                      setForm({ ...form, keywords: [...existing, k.keyword].join(', ') });
                    }
                  }}
                  style={{ fontSize: '0.7rem', padding: '2px 8px', borderRadius: '10px', border: '1px solid #555', background: 'transparent', color: '#aaa', cursor: 'pointer' }}>
                  + {k.keyword}
                </button>
              ))}
            </div>
          </label>

          <label>Content (HTML)
            <textarea value={form.content} onChange={e => setForm({...form, content: e.target.value})} rows={10} />
          </label>
          <label>Featured Image URL<input value={form.featured_image} onChange={e => setForm({...form, featured_image: e.target.value})} /></label>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
            <label>Meta Title
              <input value={form.meta_title} onChange={e => setForm({...form, meta_title: e.target.value})} />
              <span style={{ fontSize: '0.75rem', color: (form.meta_title||'').length >= 30 && (form.meta_title||'').length <= 60 ? '#10b981' : '#f59e0b' }}>
                {(form.meta_title||'').length}/60
              </span>
            </label>
            <label>Meta Description
              <textarea value={form.meta_description} onChange={e => setForm({...form, meta_description: e.target.value})} rows={2} />
              <span style={{ fontSize: '0.75rem', color: (form.meta_description||'').length >= 120 && (form.meta_description||'').length <= 160 ? '#10b981' : '#f59e0b' }}>
                {(form.meta_description||'').length}/160
              </span>
            </label>
          </div>

          <div style={{ display: 'flex', gap: '1.5rem' }}>
            <label className="checkbox-label">
              <input type="checkbox" checked={form.published} onChange={e => setForm({...form, published: e.target.checked})} />
              Published
            </label>
            <label className="checkbox-label">
              <input type="checkbox" checked={form.featured} onChange={e => setForm({...form, featured: e.target.checked})} />
              ⭐ Featured Post
            </label>
          </div>

          <div className="form-actions">
            <button type="submit" className="btn btn-primary">Save</button>
            <button type="button" className="btn btn-secondary" onClick={() => setEditing(null)}>Cancel</button>
          </div>
        </form>
      )}

      {loading ? <p>Loading...</p> : (
        <table className="admin-table">
          <thead><tr><th>Title</th><th>Category</th><th>SEO</th><th>Published</th><th>Featured</th><th>Date</th><th>Actions</th></tr></thead>
          <tbody>
            {posts.map(post => {
              const postScore = getPostSEOScore(post);
              return (
                <tr key={post.id}>
                  <td>{post.title}</td>
                  <td style={{fontSize:'0.8rem'}}>
                    {BLOG_CATEGORIES.find(c => c.id === post.category)?.label || '—'}
                  </td>
                  <td>
                    <span style={{
                      padding: '2px 8px', borderRadius: '10px', fontSize: '0.75rem', fontWeight: 700,
                      background: `${scoreColor(postScore)}22`, color: scoreColor(postScore),
                    }}>{postScore}</span>
                  </td>
                  <td>{post.published ? '✅' : '📝'}</td>
                  <td>{post.featured ? '⭐' : ''}</td>
                  <td style={{fontSize:'0.85rem'}}>{new Date(post.created_at).toLocaleDateString()}</td>
                  <td>
                    <button className="btn btn-secondary btn-xs" onClick={() => openEdit(post)}>Edit</button>
                    <button className="btn btn-danger btn-xs" onClick={() => handleDelete(post.id)}>Delete</button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}

      <style>{`
        .section-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem; }
        .admin-form { padding: 1.5rem; margin-bottom: 1.5rem; display: flex; flex-direction: column; gap: 0.75rem; }
        .admin-form label { display: flex; flex-direction: column; gap: 0.25rem; font-size: 0.9rem; color: #ccc; }
        .admin-form input, .admin-form textarea, .admin-form select { padding: 0.5rem; border-radius: 6px; border: 1px solid #444; background: #111; color: #fff; font-family: inherit; }
        .checkbox-label { flex-direction: row !important; align-items: center; gap: 0.5rem !important; }
        .form-actions { display: flex; gap: 0.5rem; }
        .admin-table { width: 100%; border-collapse: collapse; }
        .admin-table th, .admin-table td { padding: 0.75rem; text-align: left; border-bottom: 1px solid #333; }
        .admin-table th { color: #aaa; font-size: 0.85rem; text-transform: uppercase; }
        .btn-xs { padding: 0.25rem 0.5rem; font-size: 0.8rem; margin-right: 0.25rem; }
        .btn-danger { background: #dc2626; color: #fff; border: none; border-radius: 6px; cursor: pointer; }
      `}</style>
    </div>
  );
}
