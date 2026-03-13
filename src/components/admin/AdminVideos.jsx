import { useState, useEffect } from 'react';
import { getAllYoutubeVideos, createYoutubeVideo, updateYoutubeVideo, deleteYoutubeVideo } from '../../api/contentApi';

export default function AdminVideos() {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ title: '', video_id: '', sort_order: 0, is_active: true });

  async function load() {
    setLoading(true);
    setVideos(await getAllYoutubeVideos());
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  function openNew() {
    setEditing('new');
    setForm({ title: '', video_id: '', sort_order: 0, is_active: true });
  }

  function openEdit(v) {
    setEditing(v.id);
    setForm({ title: v.title, video_id: v.video_id, sort_order: v.sort_order || 0, is_active: v.is_active });
  }

  function extractVideoId(input) {
    const match = input.match(/(?:v=|youtu\.be\/|embed\/)([a-zA-Z0-9_-]{11})/);
    return match ? match[1] : input;
  }

  async function handleSave(e) {
    e.preventDefault();
    const payload = { ...form, video_id: extractVideoId(form.video_id), sort_order: Number(form.sort_order) };
    if (editing === 'new') await createYoutubeVideo(payload);
    else await updateYoutubeVideo(editing, payload);
    setEditing(null);
    load();
  }

  async function handleDelete(id) {
    if (!confirm('Delete this video?')) return;
    await deleteYoutubeVideo(id);
    load();
  }

  return (
    <div className="admin-section">
      <div className="section-header">
        <h2>🎥 YouTube Videos</h2>
        <button className="btn btn-primary" onClick={openNew}>+ Add Video</button>
      </div>

      {editing && (
        <form className="admin-form glass-card" onSubmit={handleSave}>
          <h3>{editing === 'new' ? 'Add Video' : 'Edit Video'}</h3>
          <label>Title<input value={form.title} onChange={e => setForm({...form, title: e.target.value})} required /></label>
          <label>YouTube Video ID or URL<input value={form.video_id} onChange={e => setForm({...form, video_id: e.target.value})} required placeholder="e.g. dQw4w9WgXcQ or full URL" /></label>
          <label>Sort Order<input type="number" value={form.sort_order} onChange={e => setForm({...form, sort_order: e.target.value})} /></label>
          <label className="checkbox-label">
            <input type="checkbox" checked={form.is_active} onChange={e => setForm({...form, is_active: e.target.checked})} />
            Active
          </label>
          <div className="form-actions">
            <button type="submit" className="btn btn-primary">Save</button>
            <button type="button" className="btn btn-secondary" onClick={() => setEditing(null)}>Cancel</button>
          </div>
        </form>
      )}

      {loading ? <p>Loading...</p> : (
        <table className="admin-table">
          <thead><tr><th>Title</th><th>Video ID</th><th>Order</th><th>Active</th><th>Actions</th></tr></thead>
          <tbody>
            {videos.map(v => (
              <tr key={v.id}>
                <td>{v.title}</td>
                <td style={{fontSize:'0.85rem', color:'#aaa'}}>{v.video_id}</td>
                <td>{v.sort_order}</td>
                <td>{v.is_active ? '✅' : '❌'}</td>
                <td>
                  <button className="btn btn-secondary btn-xs" onClick={() => openEdit(v)}>Edit</button>
                  <button className="btn btn-danger btn-xs" onClick={() => handleDelete(v.id)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <style>{`
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
