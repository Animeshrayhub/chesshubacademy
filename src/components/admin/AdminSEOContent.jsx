import { useState, useEffect } from 'react';
import { getAllSEOContent, createSEOContent, updateSEOContent, deleteSEOContent } from '../../api/seoContentApi';

const CATEGORIES = ['opening', 'endgame', 'strategy', 'puzzle', 'training', 'general'];
const DIFFICULTY_LEVELS = ['beginner', 'intermediate', 'advanced'];

export default function AdminSEOContent() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({
    title: '', slug: '', content: '', category: 'general', target_keyword: '',
    difficulty_level: 'beginner', meta_title: '', meta_description: '',
    featured_image: '', published: false
  });

  const loadItems = async () => {
    setLoading(true);
    const data = await getAllSEOContent();
    setItems(data);
    setLoading(false);
  };

  useEffect(() => { loadItems(); }, []);

  const resetForm = () => {
    setEditing(null);
    setForm({
      title: '', slug: '', content: '', category: 'general', target_keyword: '',
      difficulty_level: 'beginner', meta_title: '', meta_description: '',
      featured_image: '', published: false
    });
  };

  const handleEdit = (item) => {
    setEditing(item.id);
    setForm({
      title: item.title || '',
      slug: item.slug || '',
      content: item.content || '',
      category: item.category || 'general',
      target_keyword: item.target_keyword || '',
      difficulty_level: item.difficulty_level || 'beginner',
      meta_title: item.meta_title || '',
      meta_description: item.meta_description || '',
      featured_image: item.featured_image || '',
      published: item.published || false
    });
  };

  const generateSlug = (title) => title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = { ...form, slug: form.slug || generateSlug(form.title) };
    if (editing) {
      await updateSEOContent(editing, payload);
    } else {
      await createSEOContent(payload);
    }
    resetForm();
    loadItems();
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this content?')) return;
    await deleteSEOContent(id);
    loadItems();
  };

  return (
    <div className="admin-seo-content">
      <h2>SEO Content Engine</h2>
      <p style={{ color: '#aaa', marginBottom: '1.5rem' }}>Create SEO-optimized lessons and guides that appear on programmatic pages and at /learn/[slug]</p>

      <form onSubmit={handleSubmit} className="seo-form">
        <div className="form-row">
          <div className="form-group" style={{ flex: 2 }}>
            <label>Title</label>
            <input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} required placeholder="e.g. Sicilian Defense for Beginners" />
          </div>
          <div className="form-group" style={{ flex: 1 }}>
            <label>Slug</label>
            <input value={form.slug} onChange={e => setForm({ ...form, slug: e.target.value })} placeholder="auto-generated" />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Category</label>
            <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}>
              {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label>Difficulty</label>
            <select value={form.difficulty_level} onChange={e => setForm({ ...form, difficulty_level: e.target.value })}>
              {DIFFICULTY_LEVELS.map(d => <option key={d} value={d}>{d}</option>)}
            </select>
          </div>
          <div className="form-group" style={{ flex: 2 }}>
            <label>Target Keyword</label>
            <input value={form.target_keyword} onChange={e => setForm({ ...form, target_keyword: e.target.value })} placeholder="e.g. sicilian defense guide" />
          </div>
        </div>

        <div className="form-group">
          <label>Content (HTML)</label>
          <textarea value={form.content} onChange={e => setForm({ ...form, content: e.target.value })} rows={10} placeholder="<h2>Introduction</h2><p>...</p>" />
        </div>

        <div className="form-row">
          <div className="form-group" style={{ flex: 1 }}>
            <label>Meta Title <span style={{ color: '#666', fontSize: '0.8rem' }}>({form.meta_title.length}/60)</span></label>
            <input value={form.meta_title} onChange={e => setForm({ ...form, meta_title: e.target.value })} placeholder="SEO title for search results" />
          </div>
          <div className="form-group" style={{ flex: 1 }}>
            <label>Featured Image URL</label>
            <input value={form.featured_image} onChange={e => setForm({ ...form, featured_image: e.target.value })} placeholder="https://..." />
          </div>
        </div>

        <div className="form-group">
          <label>Meta Description <span style={{ color: '#666', fontSize: '0.8rem' }}>({form.meta_description.length}/160)</span></label>
          <textarea value={form.meta_description} onChange={e => setForm({ ...form, meta_description: e.target.value })} rows={2} placeholder="Brief description for search results" />
        </div>

        <div className="form-row" style={{ alignItems: 'center' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
            <input type="checkbox" checked={form.published} onChange={e => setForm({ ...form, published: e.target.checked })} />
            Published
          </label>
          <div style={{ marginLeft: 'auto', display: 'flex', gap: '8px' }}>
            {editing && <button type="button" onClick={resetForm} className="btn-cancel">Cancel</button>}
            <button type="submit" className="btn-save">{editing ? 'Update' : 'Create'}</button>
          </div>
        </div>
      </form>

      {loading ? <p style={{ color: '#aaa' }}>Loading...</p> : (
        <table className="seo-table">
          <thead>
            <tr>
              <th>Title</th>
              <th>Category</th>
              <th>Keyword</th>
              <th>Level</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {items.map(item => (
              <tr key={item.id}>
                <td>
                  <strong>{item.title}</strong>
                  <br /><span style={{ fontSize: '0.75rem', color: '#888' }}>/learn/{item.slug}</span>
                </td>
                <td><span className="cat-badge">{item.category}</span></td>
                <td style={{ fontSize: '0.85rem', color: '#aaa' }}>{item.target_keyword || '—'}</td>
                <td><span className="level-badge">{item.difficulty_level}</span></td>
                <td>{item.published ? <span style={{ color: '#6ee7b7' }}>✓ Live</span> : <span style={{ color: '#f87171' }}>Draft</span>}</td>
                <td>
                  <button onClick={() => handleEdit(item)} className="btn-action">Edit</button>
                  <button onClick={() => handleDelete(item.id)} className="btn-action btn-danger">Delete</button>
                </td>
              </tr>
            ))}
            {items.length === 0 && (
              <tr><td colSpan="6" style={{ textAlign: 'center', color: '#888', padding: '2rem' }}>No SEO content yet. Create your first lesson above.</td></tr>
            )}
          </tbody>
        </table>
      )}

      <style>{`
        .admin-seo-content { color: #fff; }
        .admin-seo-content h2 { margin-bottom: 4px; }
        .seo-form { background: rgba(30,30,60,0.4); border: 1px solid #333; border-radius: 12px; padding: 1.5rem; margin-bottom: 2rem; }
        .form-row { display: flex; gap: 1rem; flex-wrap: wrap; margin-bottom: 1rem; }
        .form-group { display: flex; flex-direction: column; gap: 4px; flex: 1; min-width: 150px; }
        .form-group label { font-size: 0.85rem; color: #ccc; }
        .form-group input, .form-group select, .form-group textarea { background: rgba(15,15,35,0.8); border: 1px solid #444; border-radius: 6px; padding: 8px 12px; color: #fff; font-size: 0.9rem; }
        .form-group textarea { resize: vertical; font-family: inherit; }
        .btn-save { padding: 8px 20px; border: none; border-radius: 6px; background: linear-gradient(135deg, #8b5cf6, #3b82f6); color: #fff; font-weight: 600; cursor: pointer; }
        .btn-cancel { padding: 8px 20px; border: 1px solid #555; border-radius: 6px; background: transparent; color: #ccc; cursor: pointer; }
        .seo-table { width: 100%; border-collapse: collapse; }
        .seo-table th { text-align: left; padding: 10px 12px; border-bottom: 1px solid #333; color: #aaa; font-size: 0.8rem; text-transform: uppercase; }
        .seo-table td { padding: 10px 12px; border-bottom: 1px solid rgba(255,255,255,0.05); }
        .cat-badge { font-size: 0.75rem; padding: 2px 8px; border-radius: 8px; background: rgba(139,92,246,0.15); color: #a78bfa; text-transform: capitalize; }
        .level-badge { font-size: 0.75rem; padding: 2px 8px; border-radius: 8px; background: rgba(16,185,129,0.15); color: #6ee7b7; text-transform: capitalize; }
        .btn-action { padding: 4px 10px; border: 1px solid #555; border-radius: 4px; background: transparent; color: #ccc; cursor: pointer; margin-right: 4px; font-size: 0.8rem; }
        .btn-danger { border-color: #f87171; color: #f87171; }
      `}</style>
    </div>
  );
}
