import { useState, useEffect } from 'react';
import { getAllReferrals, updateReferralStatus } from '../../api/referralApi';

export default function AdminReferrals() {
  const [referrals, setReferrals] = useState([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    setReferrals(await getAllReferrals());
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  async function handleStatus(id, status) {
    await updateReferralStatus(id, status);
    load();
  }

  const totalReferrals = referrals.length;
  const enrolled = referrals.filter(r => r.status === 'enrolled').length;

  return (
    <div className="admin-section">
      <h2>🔗 Referrals</h2>

      <div className="referral-stats">
        <div className="glass-card stat-mini">
          <span className="stat-val">{totalReferrals}</span>
          <span className="stat-lbl">Total Referrals</span>
        </div>
        <div className="glass-card stat-mini">
          <span className="stat-val">{enrolled}</span>
          <span className="stat-lbl">Enrolled</span>
        </div>
      </div>

      {loading ? <p>Loading...</p> : referrals.length === 0 ? (
        <p className="empty">No referrals yet.</p>
      ) : (
        <table className="admin-table">
          <thead><tr><th>Referrer ID</th><th>Referred Email</th><th>Status</th><th>Date</th><th>Actions</th></tr></thead>
          <tbody>
            {referrals.map(r => (
              <tr key={r.id}>
                <td style={{fontSize:'0.8rem'}}>{r.referrer_user_id?.substring(0,8) || '—'}</td>
                <td>{r.referred_email}</td>
                <td><span className={`status-badge status-${r.status}`}>{r.status}</span></td>
                <td style={{fontSize:'0.85rem'}}>{new Date(r.created_at).toLocaleDateString()}</td>
                <td>
                  {r.status === 'pending' && (
                    <button className="btn btn-primary btn-xs" onClick={() => handleStatus(r.id, 'enrolled')}>
                      Mark Enrolled
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <style>{`
        .referral-stats { display: flex; gap: 1rem; margin-bottom: 1.5rem; }
        .stat-mini { padding: 1rem 1.5rem; display: flex; flex-direction: column; align-items: center; }
        .stat-val { font-size: 1.5rem; font-weight: 700; }
        .stat-lbl { font-size: 0.85rem; color: #aaa; }
        .empty { color: #aaa; }
        .admin-table { width: 100%; border-collapse: collapse; }
        .admin-table th, .admin-table td { padding: 0.75rem; text-align: left; border-bottom: 1px solid #333; }
        .admin-table th { color: #aaa; font-size: 0.85rem; text-transform: uppercase; }
        .btn-xs { padding: 0.25rem 0.5rem; font-size: 0.8rem; }
        .status-badge { display: inline-block; padding: 0.15rem 0.5rem; border-radius: 12px; font-size: 0.75rem; font-weight: 600; text-transform: uppercase; }
        .status-pending { background: #854d0e; color: #fef3c7; }
        .status-enrolled { background: #166534; color: #dcfce7; }
      `}</style>
    </div>
  );
}
