import { useState, useEffect } from 'react';
import { getAllContent, createContent, updateContent, deleteContent } from '../../api/contentApi';

const CONTENT_TYPES = [
  { key: 'testimonial', label: 'Testimonials' },
  { key: 'statistic', label: 'Statistics' },
  { key: 'coach_profile', label: 'Coach Profiles' },
  { key: 'course', label: 'Courses' },
];

const FIELD_MAP = {
  testimonial: ['name', 'role', 'text', 'avatar', 'rating'],
  statistic: ['label', 'value', 'icon', 'description'],
  coach_profile: ['name', 'title', 'rating', 'photo', 'specialization', 'bio'],
  course: ['name', 'level', 'price', 'description', 'features', 'duration'],
};

export default function AdminContentManager() {
  const [activeType, setActiveType] = useState('testimonial');
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null);
  const [formData, setFormData] = useState({});

  async function load() {
    setLoading(true);
    setItems(await getAllContent(activeType));
    setLoading(false);
  }

  useEffect(() => { load(); }, [activeType]);

  function openNew() {
    setEditing('new');
    const fields = FIELD_MAP[activeType] || [];
    const data = {};
    fields.forEach(f => data[f] = '');
    setFormData(data);
  }

  function openEdit(item) {
    setEditing(item.id);
    setFormData(item.content_data || {});
  }

  async function handleSave(e) {
    e.preventDefault();
    const payload = {
      content_type: activeType,
      content_data: formData,
      is_active: true,
    };

    if (editing === 'new') await createContent(payload);
    else await updateContent(editing, payload);
    setEditing(null);
    load();
  }

  async function handleDelete(id) {
    if (!confirm('Delete this item?')) return;
    await deleteContent(id);
    load();
  }

  async function handleToggle(item) {
    await updateContent(item.id, { is_active: !item.is_active });
    load();
  }

  const fields = FIELD_MAP[activeType] || [];

  return (
    <div className="admin-section">
      <h2>📄 Content Manager</h2>

      <div className="content-tabs">
        {CONTENT_TYPES.map(ct => (
          <button key={ct.key}
            className={`btn btn-sm ${activeType === ct.key ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => { setActiveType(ct.key); setEditing(null); }}>
            {ct.label}
          </button>
        ))}
      </div>

      <div className="section-header">
        <h3>{CONTENT_TYPES.find(c => c.key === activeType)?.label}</h3>
        <button className="btn btn-primary btn-sm" onClick={openNew}>+ Add</button>
      </div>

      {editing && (
        <form className="admin-form glass-card" onSubmit={handleSave}>
          <h4>{editing === 'new' ? 'Add Item' : 'Edit Item'}</h4>
          {fields.map(field => (
            <label key={field}>
              {field.charAt(0).toUpperCase() + field.slice(1)}
              {field === 'text' || field === 'bio' || field === 'description' || field === 'features' ? (
                <textarea value={formData[field] || ''} rows={3}
                  onChange={e => setFormData({...formData, [field]: e.target.value})} />
              ) : (
                <input value={formData[field] || ''}
                  onChange={e => setFormData({...formData, [field]: e.target.value})} />
              )}
            </label>
          ))}
          <div className="form-actions">
            <button type="submit" className="btn btn-primary">Save</button>
            <button type="button" className="btn btn-secondary" onClick={() => setEditing(null)}>Cancel</button>
          </div>
        </form>
      )}

      {loading ? <p>Loading...</p> : items.length === 0 ? (
        <p className="empty">No items. Add one above.</p>
      ) : (
        <div className="content-list">
          {items.map(item => (
            <div key={item.id} className={`content-item glass-card ${!item.is_active ? 'inactive' : ''}`}>
              <div className="content-item-body">
                {fields.slice(0, 3).map(f => (
                  <span key={f} className="content-field">
                    <strong>{f}:</strong> {String(item.content_data?.[f] || '—').substring(0, 60)}
                  </span>
                ))}
              </div>
              <div className="content-item-actions">
                <button className="btn btn-secondary btn-xs" onClick={() => handleToggle(item)}>
                  {item.is_active ? 'Hide' : 'Show'}
                </button>
                <button className="btn btn-secondary btn-xs" onClick={() => openEdit(item)}>Edit</button>
                <button className="btn btn-danger btn-xs" onClick={() => handleDelete(item.id)}>Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}

      <style>{`
        .content-tabs { display: flex; gap: 0.25rem; margin-bottom: 1.5rem; flex-wrap: wrap; }
        .section-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem; }
        .btn-sm { padding: 0.3rem 0.75rem; font-size: 0.85rem; }
        .admin-form { padding: 1.5rem; margin-bottom: 1.5rem; display: flex; flex-direction: column; gap: 0.75rem; }
        .admin-form label { display: flex; flex-direction: column; gap: 0.25rem; font-size: 0.9rem; color: #ccc; }
        .admin-form input, .admin-form textarea { padding: 0.5rem; border-radius: 6px; border: 1px solid #444; background: #111; color: #fff; font-family: inherit; }
        .form-actions { display: flex; gap: 0.5rem; }
        .empty { color: #aaa; }
        .content-list { display: flex; flex-direction: column; gap: 0.75rem; }
        .content-item { padding: 1rem; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 0.5rem; }
        .content-item.inactive { opacity: 0.5; }
        .content-item-body { display: flex; flex-direction: column; gap: 0.25rem; flex: 1; min-width: 200px; }
        .content-field { font-size: 0.85rem; color: #ccc; }
        .content-item-actions { display: flex; gap: 0.25rem; }
        .btn-xs { padding: 0.25rem 0.5rem; font-size: 0.8rem; }
        .btn-danger { background: #dc2626; color: #fff; border: none; border-radius: 6px; cursor: pointer; }
      `}</style>
    </div>
  );
}
