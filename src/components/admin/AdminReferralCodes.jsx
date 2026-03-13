import { useState, useEffect } from 'react';
import { getAllReferralCodes, addReward } from '../../api/referralCodeApi';

const REWARD_TYPES = ['free_class', 'discount', 'tournament_entry'];

export default function AdminReferralCodes() {
    const [codes, setCodes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [rewardFor, setRewardFor] = useState(null);
    const [rewardType, setRewardType] = useState('free_class');

    const load = async () => {
        setLoading(true);
        setCodes(await getAllReferralCodes());
        setLoading(false);
    };

    useEffect(() => { load(); }, []);

    const handleReward = async () => {
        if (!rewardFor) return;
        await addReward(rewardFor, { type: rewardType });
        setRewardFor(null);
        load();
    };

    const totalReferrals = codes.reduce((sum, c) => sum + (c.referrals_count || 0), 0);

    return (
        <div>
            <h2 style={S.title}>🎟️ Referral Codes</h2>
            <p style={{ color: '#aaa', marginBottom: '16px' }}>Codes are auto-generated for each student. Students share their link to earn rewards.</p>

            <div style={S.statsRow}>
                <div style={S.stat}><span style={S.statVal}>{codes.length}</span><span style={S.statLbl}>Active Codes</span></div>
                <div style={S.stat}><span style={S.statVal}>{totalReferrals}</span><span style={S.statLbl}>Total Referrals</span></div>
            </div>

            {loading ? <p style={{ color: '#aaa' }}>Loading...</p> : (
                <table style={S.table}>
                    <thead>
                        <tr>
                            <th style={S.th}>Student</th>
                            <th style={S.th}>Code</th>
                            <th style={S.th}>Referrals</th>
                            <th style={S.th}>Rewards</th>
                            <th style={S.th}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {codes.map(c => (
                            <tr key={c.id}>
                                <td style={S.td}>
                                    <strong>{c.student?.full_name || '—'}</strong>
                                    <div style={{ fontSize: '0.75rem', color: '#888' }}>{c.student?.email || ''}</div>
                                </td>
                                <td style={S.td}>
                                    <code style={S.code}>{c.code}</code>
                                    <div style={{ fontSize: '0.7rem', color: '#888', marginTop: '2px' }}>
                                        chesshubacademy.com/ref/{c.code}
                                    </div>
                                </td>
                                <td style={S.td}><span style={S.countBadge}>{c.referrals_count || 0}</span></td>
                                <td style={S.td}>
                                    {(c.rewards || []).length > 0
                                        ? (c.rewards || []).map((r, i) => (
                                            <span key={i} style={S.rewardBadge}>{r.type}</span>
                                        ))
                                        : <span style={{ color: '#666', fontSize: '0.85rem' }}>None</span>
                                    }
                                </td>
                                <td style={S.td}>
                                    {rewardFor === c.id ? (
                                        <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
                                            <select value={rewardType} onChange={e => setRewardType(e.target.value)} style={S.sel}>
                                                {REWARD_TYPES.map(t => <option key={t} value={t}>{t.replace('_', ' ')}</option>)}
                                            </select>
                                            <button onClick={handleReward} style={S.saveBtn}>Give</button>
                                            <button onClick={() => setRewardFor(null)} style={S.cancelBtn}>✕</button>
                                        </div>
                                    ) : (
                                        <button onClick={() => setRewardFor(c.id)} style={S.rewardBtn}>🎁 Reward</button>
                                    )}
                                </td>
                            </tr>
                        ))}
                        {codes.length === 0 && (
                            <tr><td colSpan="5" style={{ textAlign: 'center', padding: '2rem', color: '#888' }}>No referral codes generated yet. Codes are auto-created when students visit their dashboard.</td></tr>
                        )}
                    </tbody>
                </table>
            )}
        </div>
    );
}

const S = {
    title: { fontSize: '22px', fontWeight: 600, marginBottom: '4px' },
    statsRow: { display: 'flex', gap: '16px', marginBottom: '20px' },
    stat: { background: 'rgba(255,255,255,0.05)', borderRadius: '10px', padding: '16px 24px', display: 'flex', flexDirection: 'column', alignItems: 'center' },
    statVal: { fontSize: '24px', fontWeight: 700 },
    statLbl: { fontSize: '11px', color: 'rgba(255,255,255,0.5)', marginTop: '4px' },
    table: { width: '100%', borderCollapse: 'collapse' },
    th: { textAlign: 'left', padding: '10px', borderBottom: '1px solid #333', color: '#aaa', fontSize: '0.8rem', textTransform: 'uppercase' },
    td: { padding: '10px', borderBottom: '1px solid rgba(255,255,255,0.05)' },
    code: { padding: '3px 8px', borderRadius: '4px', background: 'rgba(139,92,246,0.1)', color: '#a78bfa', fontFamily: 'monospace', fontSize: '0.9rem' },
    countBadge: { padding: '3px 10px', borderRadius: '10px', background: 'rgba(16,185,129,0.15)', color: '#6ee7b7', fontWeight: 600 },
    rewardBadge: { display: 'inline-block', padding: '2px 6px', borderRadius: '6px', background: 'rgba(245,158,11,0.15)', color: '#fbbf24', fontSize: '0.7rem', marginRight: '4px', textTransform: 'capitalize' },
    rewardBtn: { padding: '4px 10px', border: '1px solid #555', borderRadius: '4px', background: 'transparent', color: '#ccc', cursor: 'pointer', fontSize: '0.8rem' },
    sel: { background: 'rgba(15,15,35,0.8)', border: '1px solid #444', borderRadius: '4px', padding: '4px', color: '#fff', fontSize: '0.75rem' },
    saveBtn: { padding: '4px 8px', border: 'none', borderRadius: '4px', background: '#8b5cf6', color: '#fff', cursor: 'pointer', fontSize: '0.75rem' },
    cancelBtn: { padding: '4px 8px', border: 'none', borderRadius: '4px', background: 'transparent', color: '#f87171', cursor: 'pointer', fontSize: '0.85rem' },
};
