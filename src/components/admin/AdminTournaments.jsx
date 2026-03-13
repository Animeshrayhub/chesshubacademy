import { useState, useEffect } from 'react';
import { getTournaments, createTournament, updateTournament, deleteTournament, getRegistrations, updateRegistrationStatus } from '../../api/tournamentApi';
import { createLead } from '../../api/leadApi';
import { generateTournamentFollowUp } from '../../services/whatsappService';

export default function AdminTournaments() {
  const [tournaments, setTournaments] = useState([]);
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null);
  const [viewRegs, setViewRegs] = useState(null);
  const [form, setForm] = useState({
    name: '', description: '', date: '', entry_fee: 0,
    registration_deadline: '', result_link: '',
    max_players: 0, tournament_type: 'open', rating_limit: 0,
  });

  async function load() {
    setLoading(true);
    setTournaments(await getTournaments());
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  function openNew() {
    setEditing('new');
    setForm({ name: '', description: '', date: '', entry_fee: 0, registration_deadline: '', result_link: '', max_players: 0, tournament_type: 'open', rating_limit: 0 });
  }

  function openEdit(t) {
    setEditing(t.id);
    setForm({
      name: t.name, description: t.description || '',
      date: t.date ? t.date.substring(0, 16) : '',
      entry_fee: t.entry_fee || 0,
      registration_deadline: t.registration_deadline ? t.registration_deadline.substring(0, 16) : '',
      result_link: t.result_link || '',
      max_players: t.max_players || 0,
      tournament_type: t.tournament_type || 'open',
      rating_limit: t.rating_limit || 0,
    });
  }

  async function handleSave(e) {
    e.preventDefault();
    const payload = { ...form, entry_fee: Number(form.entry_fee), max_players: Number(form.max_players), rating_limit: Number(form.rating_limit) };
    if (!payload.date) delete payload.date;
    if (!payload.registration_deadline) delete payload.registration_deadline;

    if (editing === 'new') await createTournament(payload);
    else await updateTournament(editing, payload);
    setEditing(null);
    load();
  }

  async function handleDelete(id) {
    if (!confirm('Delete this tournament?')) return;
    await deleteTournament(id);
    load();
  }

  async function showRegistrations(tournamentId) {
    setViewRegs(tournamentId);
    setRegistrations(await getRegistrations(tournamentId));
  }

  async function handleRegStatus(id, status) {
    await updateRegistrationStatus(id, status);
    showRegistrations(viewRegs);
  }

  return (
    <div className="admin-section">
      <div className="section-header">
        <h2>🏆 Tournaments</h2>
        <button className="btn btn-primary" onClick={openNew}>+ Add Tournament</button>
      </div>

      {editing && (
        <form className="admin-form glass-card" onSubmit={handleSave}>
          <h3>{editing === 'new' ? 'Add Tournament' : 'Edit Tournament'}</h3>
          <label>Name<input value={form.name} onChange={e => setForm({...form, name: e.target.value})} required /></label>
          <label>Description<textarea value={form.description} onChange={e => setForm({...form, description: e.target.value})} rows={3} /></label>
          <label>Date<input type="datetime-local" value={form.date} onChange={e => setForm({...form, date: e.target.value})} /></label>
          <label>Entry Fee (₹)<input type="number" min="0" value={form.entry_fee} onChange={e => setForm({...form, entry_fee: e.target.value})} /></label>
          <label>Registration Deadline<input type="datetime-local" value={form.registration_deadline} onChange={e => setForm({...form, registration_deadline: e.target.value})} /></label>
          <label>Result Link<input value={form.result_link} onChange={e => setForm({...form, result_link: e.target.value})} /></label>
          <label>Max Players<input type="number" min="0" value={form.max_players} onChange={e => setForm({...form, max_players: e.target.value})} /></label>
          <label>Tournament Type
            <select value={form.tournament_type} onChange={e => setForm({...form, tournament_type: e.target.value})}>
              <option value="open">Open</option>
              <option value="rated">Rated</option>
              <option value="beginner">Beginner</option>
              <option value="advanced">Advanced</option>
            </select>
          </label>
          <label>Rating Limit (0=none)<input type="number" min="0" value={form.rating_limit} onChange={e => setForm({...form, rating_limit: e.target.value})} /></label>
          <div className="form-actions">
            <button type="submit" className="btn btn-primary">Save</button>
            <button type="button" className="btn btn-secondary" onClick={() => setEditing(null)}>Cancel</button>
          </div>
        </form>
      )}

      {loading ? <p>Loading...</p> : (
        <table className="admin-table">
          <thead><tr><th>Name</th><th>Date</th><th>Fee</th><th>Type</th><th>Players</th><th>Actions</th></tr></thead>
          <tbody>
            {tournaments.map(t => (
              <tr key={t.id}>
                <td>{t.name}</td>
                <td>{t.date ? new Date(t.date).toLocaleDateString() : '—'}</td>
                <td>{t.entry_fee > 0 ? `₹${t.entry_fee}` : 'Free'}</td>
                <td style={{textTransform:'capitalize'}}>{t.tournament_type || 'open'}</td>
                <td>{t.registered_players || 0}{t.max_players > 0 ? `/${t.max_players}` : ''}</td>
                <td>
                  <button className="btn btn-secondary btn-xs" onClick={() => openEdit(t)}>Edit</button>
                  <button className="btn btn-secondary btn-xs" onClick={() => showRegistrations(t.id)}>Regs</button>
                  <button className="btn btn-danger btn-xs" onClick={() => handleDelete(t.id)}>Delete</button>
                  {new Date(t.date) < new Date() && (
                    <button className="btn btn-secondary btn-xs" style={{background:'#10b981'}} onClick={async () => {
                      const regs = await getRegistrations(t.id);
                      for (const r of regs) {
                        await createLead({ name: r.name, email: r.email, phone: r.phone, source: 'tournament', status: 'new', notes: `Tournament: ${t.name}` });
                      }
                      alert(`${regs.length} leads captured from tournament!`);
                    }}>Capture Leads</button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {/* Registrations Panel */}
      {viewRegs && (
        <div className="registrations-panel glass-card">
          <div className="section-header">
            <h3>Registrations</h3>
            <button className="btn btn-secondary btn-sm" onClick={() => setViewRegs(null)}>Close</button>
          </div>
          {registrations.length === 0 ? <p>No registrations.</p> : (
            <div className="reg-list">
              {registrations.map(r => (
                <div key={r.id} className="reg-item">
                  <div>
                    <strong>{r.name}</strong> — {r.email} — {r.phone}
                    <span className={`status-badge status-${r.status}`}>{r.status}</span>
                  </div>
                  {r.payment_screenshot && (
                    <a href={r.payment_screenshot} target="_blank" rel="noopener noreferrer">View Screenshot</a>
                  )}
                  {r.status === 'pending' && (
                    <div className="reg-actions">
                      <button className="btn btn-primary btn-xs" onClick={() => handleRegStatus(r.id, 'approved')}>Approve</button>
                      <button className="btn btn-danger btn-xs" onClick={() => handleRegStatus(r.id, 'rejected')}>Reject</button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      <style>{`
        .section-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem; }
        .admin-form { padding: 1.5rem; margin-bottom: 1.5rem; display: flex; flex-direction: column; gap: 0.75rem; }
        .admin-form label { display: flex; flex-direction: column; gap: 0.25rem; font-size: 0.9rem; color: #ccc; }
        .admin-form input, .admin-form textarea { padding: 0.5rem; border-radius: 6px; border: 1px solid #444; background: #111; color: #fff; }
        .form-actions { display: flex; gap: 0.5rem; }
        .admin-table { width: 100%; border-collapse: collapse; }
        .admin-table th, .admin-table td { padding: 0.75rem; text-align: left; border-bottom: 1px solid #333; }
        .admin-table th { color: #aaa; font-size: 0.85rem; text-transform: uppercase; }
        .btn-xs { padding: 0.25rem 0.5rem; font-size: 0.8rem; margin-right: 0.25rem; }
        .btn-sm { padding: 0.3rem 0.75rem; font-size: 0.85rem; }
        .btn-danger { background: #dc2626; color: #fff; border: none; border-radius: 6px; cursor: pointer; }
        .registrations-panel { padding: 1.5rem; margin-top: 1.5rem; }
        .reg-list { display: flex; flex-direction: column; gap: 0.75rem; }
        .reg-item { display: flex; flex-wrap: wrap; gap: 0.5rem; align-items: center; padding: 0.5rem 0; border-bottom: 1px solid #333; font-size: 0.9rem; }
        .reg-item a { color: var(--primary, #8b5cf6); font-size: 0.85rem; }
        .reg-actions { display: flex; gap: 0.25rem; }
        .status-badge { display: inline-block; padding: 0.15rem 0.5rem; border-radius: 12px; font-size: 0.75rem; font-weight: 600; text-transform: uppercase; margin-left: 0.5rem; }
        .status-pending { background: #854d0e; color: #fef3c7; }
        .status-approved { background: #166534; color: #dcfce7; }
        .status-rejected { background: #991b1b; color: #fee2e2; }
      `}</style>
    </div>
  );
}
