import { useState, useEffect } from 'react';
import { getTournaments, createRegistration } from '../api/tournamentApi';
import { createLead } from '../api/leadApi';
import { supabase } from '../services/supabase';
import { Link } from 'react-router-dom';
import SmartCTA from '../components/SmartCTA';

export default function TournamentPage() {
  const [tournaments, setTournaments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTournament, setSelectedTournament] = useState(null);
  const [form, setForm] = useState({ name: '', email: '', phone: '' });
  const [screenshot, setScreenshot] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [status, setStatus] = useState(null);

  async function loadTournaments() {
    setLoading(true);
    const data = await getTournaments();
    setTournaments(data);
    setLoading(false);
  }

  useEffect(() => { loadTournaments(); }, []);

  async function handleRegister(e) {
    e.preventDefault();
    if (!selectedTournament) return;
    setSubmitting(true);

    let screenshotUrl = null;
    if (screenshot && supabase) {
      const fileName = `tournament_${Date.now()}_${screenshot.name}`;
      const { data: uploadData } = await supabase.storage
        .from('payment-screenshots')
        .upload(fileName, screenshot);
      if (uploadData) {
        const { data: urlData } = supabase.storage
          .from('payment-screenshots')
          .getPublicUrl(fileName);
        screenshotUrl = urlData?.publicUrl;
      }
    }

    const reg = await createRegistration({
      tournament_id: selectedTournament.id,
      name: form.name,
      email: form.email,
      phone: form.phone,
      payment_screenshot: screenshotUrl,
      status: 'pending',
    });

    // Capture as lead
    try {
      await createLead({
        name: form.name, email: form.email, phone: form.phone,
        source: 'tournament', status: 'new',
        notes: `Tournament registration: ${selectedTournament.name}`,
      });
    } catch { /* lead may already exist */ }

    setSubmitting(false);
    if (reg) {
      setStatus('success');
      setSelectedTournament(null);
      setForm({ name: '', email: '', phone: '' });
      setScreenshot(null);
    } else {
      setStatus('error');
    }
    setTimeout(() => setStatus(null), 4000);
  }

  const now = new Date();
  const upcoming = tournaments.filter(t => new Date(t.date) >= now);
  const past = tournaments.filter(t => new Date(t.date) < now);

  return (
    <div className="tournament-page">
      <nav className="page-nav">
        <div className="page-nav-inner">
          <Link to="/" className="back-link">← Back to Home</Link>
          <h2>🏆 Tournaments</h2>
        </div>
      </nav>

      {status === 'success' && (
        <div className="toast toast-success">Registration submitted! You'll be notified after approval.</div>
      )}
      {status === 'error' && (
        <div className="toast toast-error">Registration failed. Please try again.</div>
      )}

      {loading ? (
        <div className="page-loading">Loading tournaments...</div>
      ) : (
        <div className="tournament-sections">
          <section className="tournament-section">
            <h3>📅 Upcoming Tournaments</h3>
            {upcoming.length === 0 ? (
              <p className="empty-msg">No upcoming tournaments. Stay tuned!</p>
            ) : (
              <div className="tournament-grid">
                {upcoming.map((t) => (
                  <div key={t.id} className="tournament-card glass-card">
                    <h4>{t.name}</h4>
                    <p className="tournament-desc">{t.description}</p>
                    <div className="tournament-meta">
                      <span>📅 {new Date(t.date).toLocaleDateString()}</span>
                      <span>💰 {t.entry_fee > 0 ? `₹${t.entry_fee}` : 'FREE'}</span>
                      {t.tournament_type && <span style={{textTransform:'capitalize'}}>🏆 {t.tournament_type}</span>}
                    </div>
                    {t.max_players > 0 && (
                      <p style={{fontSize:'0.85rem',color:'#8b5cf6'}}>👥 {t.registered_players || 0}/{t.max_players} players</p>
                    )}
                    {t.rating_limit > 0 && (
                      <p style={{fontSize:'0.82rem',color:'#f59e0b'}}>Rating limit: {t.rating_limit}</p>
                    )}
                    {t.registration_deadline && (
                      <p className="deadline">Deadline: {new Date(t.registration_deadline).toLocaleDateString()}</p>
                    )}
                    {(!t.registration_deadline || new Date(t.registration_deadline) >= now) ? (
                      <button className="btn btn-primary btn-sm" onClick={() => setSelectedTournament(t)}>
                        Register Now
                      </button>
                    ) : (
                      <span className="closed-badge">Registration Closed</span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </section>

          {past.length > 0 && (
            <section className="tournament-section">
              <h3>🏅 Past Tournaments</h3>
              <div className="tournament-grid">
                {past.map((t) => (
                  <div key={t.id} className="tournament-card glass-card past">
                    <h4>{t.name}</h4>
                    <p className="tournament-desc">{t.description}</p>
                    <div className="tournament-meta">
                      <span>📅 {new Date(t.date).toLocaleDateString()}</span>
                    </div>
                    {t.result_link && (
                      <a href={t.result_link} target="_blank" rel="noopener noreferrer" className="btn btn-secondary btn-sm">
                        View Results
                      </a>
                    )}
                  </div>
                ))}
              </div>
            </section>
          )}

          <SmartCTA variant="tournament" />
        </div>
      )}

      {/* Registration Modal */}
      {selectedTournament && (
        <div className="modal-overlay" onClick={() => setSelectedTournament(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setSelectedTournament(null)}>×</button>
            <h3>Register: {selectedTournament.name}</h3>

            {selectedTournament.entry_fee > 0 && (
              <div className="payment-instructions">
                <h4>💳 Entry Fee: ₹{selectedTournament.entry_fee}</h4>
                <p>Send payment via UPI:</p>
                <p className="upi-id"><strong>UPI ID:</strong> clubchess259@okaxis</p>
                <p className="payment-note">Upload payment screenshot below.</p>
              </div>
            )}

            <form onSubmit={handleRegister} className="order-form">
              <input type="text" placeholder="Your Name" required value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })} />
              <input type="email" placeholder="Your Email" required value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })} />
              <input type="tel" placeholder="Your Phone" required value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })} />
              {selectedTournament.entry_fee > 0 && (
                <label className="file-label">
                  Payment Screenshot *
                  <input type="file" accept="image/*" required
                    onChange={(e) => setScreenshot(e.target.files[0])} />
                </label>
              )}
              <button type="submit" className="btn btn-primary" disabled={submitting}>
                {submitting ? 'Submitting...' : 'Submit Registration'}
              </button>
            </form>
          </div>
        </div>
      )}

      <style>{`
        .tournament-page { min-height: 100vh; background: var(--bg-primary, #0a0a1a); color: #fff; padding-bottom: 3rem; }
        .page-nav { background: rgba(20,20,40,0.95); border-bottom: 1px solid #333; padding: 1rem 2rem; position: sticky; top: 0; z-index: 100; }
        .page-nav-inner { max-width: 1200px; margin: 0 auto; display: flex; align-items: center; gap: 2rem; }
        .back-link { color: var(--primary, #8b5cf6); text-decoration: none; font-weight: 600; }
        .page-loading { text-align: center; padding: 4rem 2rem; color: #aaa; font-size: 1.2rem; }
        .tournament-sections { max-width: 1200px; margin: 0 auto; padding: 2rem; }
        .tournament-section { margin-bottom: 3rem; }
        .tournament-section h3 { font-size: 1.5rem; margin-bottom: 1.5rem; }
        .empty-msg { color: #aaa; }
        .tournament-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 1.5rem; }
        .tournament-card { padding: 1.5rem; border-radius: 12px; background: rgba(30,30,60,0.6); border: 1px solid #333; display: flex; flex-direction: column; gap: 0.5rem; }
        .tournament-card.past { opacity: 0.7; }
        .tournament-card h4 { margin: 0; font-size: 1.2rem; }
        .tournament-desc { color: #aaa; font-size: 0.9rem; }
        .tournament-meta { display: flex; gap: 1rem; font-size: 0.9rem; color: #ccc; }
        .deadline { font-size: 0.85rem; color: #f59e0b; }
        .closed-badge { color: #ef4444; font-weight: 600; font-size: 0.9rem; }
        .btn-sm { padding: 0.4rem 1rem; font-size: 0.85rem; }
        .modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.7); display: flex; align-items: center; justify-content: center; z-index: 1000; padding: 1rem; }
        .modal-content { background: #1a1a2e; border-radius: 12px; padding: 2rem; max-width: 500px; width: 100%; max-height: 90vh; overflow-y: auto; position: relative; }
        .modal-close { position: absolute; top: 0.5rem; right: 1rem; background: none; border: none; color: #fff; font-size: 1.5rem; cursor: pointer; }
        .payment-instructions { background: rgba(139,92,246,0.1); border: 1px solid rgba(139,92,246,0.3); border-radius: 8px; padding: 1rem; margin: 1rem 0; }
        .upi-id { font-size: 1.1rem; padding: 0.5rem; background: rgba(0,0,0,0.3); border-radius: 4px; text-align: center; }
        .payment-note { font-size: 0.85rem; color: #aaa; }
        .order-form { display: flex; flex-direction: column; gap: 0.75rem; }
        .order-form input[type="text"], .order-form input[type="email"], .order-form input[type="tel"] {
          padding: 0.6rem; border-radius: 6px; border: 1px solid #444; background: #111; color: #fff; }
        .file-label { font-size: 0.9rem; color: #aaa; }
        .toast { position: fixed; top: 80px; right: 1rem; padding: 1rem 1.5rem; border-radius: 8px; z-index: 1100; font-weight: 600; }
        .toast-success { background: #166534; color: #fff; }
        .toast-error { background: #991b1b; color: #fff; }
      `}</style>
    </div>
  );
}
