import { useState, useEffect } from 'react';
import { getEbooks, createEbook, updateEbook, deleteEbook } from '../../api/ebookApi';

export default function AdminEbooks() {
  const [ebooks, setEbooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({
    title: '', description: '', price: 0, cover_image: '',
    drive_link: '', preview_images: '', is_free: false,
  });

  async function load() {
    setLoading(true);
    setEbooks(await getEbooks());
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  function openEdit(ebook) {
    setEditing(ebook.id);
    setForm({
      title: ebook.title || '',
      description: ebook.description || '',
      price: ebook.price || 0,
      cover_image: ebook.cover_image || '',
      drive_link: ebook.drive_link || '',
      preview_images: (ebook.preview_images || []).join('\n'),
      is_free: ebook.is_free || false,
    });
  }

  function openNew() {
    setEditing('new');
    setForm({ title: '', description: '', price: 0, cover_image: '', drive_link: '', preview_images: '', is_free: false });
  }

  async function handleSave(e) {
    e.preventDefault();
    const payload = {
      ...form,
      price: Number(form.price),
      preview_images: form.preview_images.split('\n').map(s => s.trim()).filter(Boolean),
    };

    if (editing === 'new') {
      await createEbook(payload);
    } else {
      await updateEbook(editing, payload);
    }
    setEditing(null);
    load();
  }

  async function handleDelete(id) {
    if (!confirm('Delete this ebook?')) return;
    await deleteEbook(id);
    load();
  }

  return (
    <div className="admin-section">
      <div className="section-header">
        <h2>📚 Ebooks</h2>
        <button className="btn btn-primary" onClick={openNew}>+ Add Ebook</button>
      </div>

      {editing && (
        <form className="admin-form glass-card" onSubmit={handleSave}>
          <h3>{editing === 'new' ? 'Add Ebook' : 'Edit Ebook'}</h3>
          <label>Title<input value={form.title} onChange={e => setForm({...form, title: e.target.value})} required /></label>
          <label>Description<textarea value={form.description} onChange={e => setForm({...form, description: e.target.value})} rows={3} /></label>
          <label>Price (₹)<input type="number" min="0" step="1" value={form.price} onChange={e => setForm({...form, price: e.target.value})} /></label>
          <label>Cover Image URL<input value={form.cover_image} onChange={e => setForm({...form, cover_image: e.target.value})} /></label>
          <label>Google Drive Link<input value={form.drive_link} onChange={e => setForm({...form, drive_link: e.target.value})} /></label>
          <label>Preview Image URLs (one per line)<textarea value={form.preview_images} onChange={e => setForm({...form, preview_images: e.target.value})} rows={3} /></label>
          <label className="checkbox-label">
            <input type="checkbox" checked={form.is_free} onChange={e => setForm({...form, is_free: e.target.checked})} />
            Free ebook
          </label>
          <div className="form-actions">
            <button type="submit" className="btn btn-primary">Save</button>
            <button type="button" className="btn btn-secondary" onClick={() => setEditing(null)}>Cancel</button>
          </div>
        </form>
      )}

      {loading ? <p>Loading...</p> : (
        <table className="admin-table">
          <thead><tr><th>Title</th><th>Price</th><th>Free</th><th>Actions</th></tr></thead>
          <tbody>
            {ebooks.map(ebook => (
              <tr key={ebook.id}>
                <td>{ebook.title}</td>
                <td>₹{ebook.price}</td>
                <td>{ebook.is_free ? '✅' : '❌'}</td>
                <td>
                  <button className="btn btn-secondary btn-xs" onClick={() => openEdit(ebook)}>Edit</button>
                  <button className="btn btn-danger btn-xs" onClick={() => handleDelete(ebook.id)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <style>{`
        .admin-section { }
        .section-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem; }
        .admin-form { padding: 1.5rem; margin-bottom: 1.5rem; display: flex; flex-direction: column; gap: 0.75rem; }
        .admin-form label { display: flex; flex-direction: column; gap: 0.25rem; font-size: 0.9rem; color: #ccc; }
        .admin-form input, .admin-form textarea { padding: 0.5rem; border-radius: 6px; border: 1px solid #444; background: #111; color: #fff; }
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
