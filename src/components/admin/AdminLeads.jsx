import { useState, useEffect } from 'react';
import { getLeads, updateLead, deleteLead, getLeadStats } from '../../api/leadApi';
import { generateWhatsAppLink } from '../../services/whatsappService';
import { sendDemoLeadEmail } from '../../services/emailAutomation';

const SOURCES = ['blog', 'demo_form', 'ebook_download', 'tournament', 'referral', 'youtube'];
const STATUSES = ['new', 'contacted', 'demo_booked', 'enrolled', 'lost'];

export default function AdminLeads() {
    const [leads, setLeads] = useState([]);
    const [stats, setStats] = useState({});
    const [loading, setLoading] = useState(true);
    const [filterSource, setFilterSource] = useState('');
    const [filterStatus, setFilterStatus] = useState('');

    const load = async () => {
        setLoading(true);
        const filters = {};
        if (filterSource) filters.source = filterSource;
        if (filterStatus) filters.status = filterStatus;
        const [l, s] = await Promise.all([getLeads(filters), getLeadStats()]);
        setLeads(l);
        setStats(s);
        setLoading(false);
    };

    useEffect(() => { load(); }, [filterSource, filterStatus]);

    const handleStatus = async (id, status) => {
        await updateLead(id, { status });
        load();
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Delete this lead?')) return;
        await deleteLead(id);
        load();
    };

    const handleWhatsApp = (lead) => {
        if (!lead.phone) { alert('No phone number for this lead'); return; }
        window.open(generateWhatsAppLink(lead.phone, lead.name), '_blank');
        handleStatus(lead.id, 'contacted');
    };

    const handleEmail = async (lead) => {
        if (!lead.email) { alert('No email for this lead'); return; }
        await sendDemoLeadEmail(lead.email, lead.name);
        handleStatus(lead.id, 'contacted');
    };

    return (
        <div>
            <h2 style={S.title}>📊 Lead Management</h2>

            <div style={S.statsGrid}>
                <div style={{ ...S.statCard, borderTopColor: '#8b5cf6' }}>
                    <div style={S.statVal}>{stats.total || 0}</div>
                    <div style={S.statLabel}>Total Leads</div>
                </div>
                {Object.entries(stats.bySource || {}).map(([src, count]) => (
                    <div key={src} style={{ ...S.statCard, borderTopColor: '#3b82f6' }}>
                        <div style={S.statVal}>{count}</div>
                        <div style={S.statLabel}>{src}</div>
                    </div>
                ))}
            </div>

            <div style={S.filters}>
                <select value={filterSource} onChange={e => setFilterSource(e.target.value)} style={S.select}>
                    <option value="">All Sources</option>
                    {SOURCES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
                <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} style={S.select}>
                    <option value="">All Statuses</option>
                    {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
            </div>

            {loading ? <p style={{ color: '#aaa' }}>Loading leads...</p> : (
                <table style={S.table}>
                    <thead>
                        <tr>
                            <th style={S.th}>Name</th>
                            <th style={S.th}>Contact</th>
                            <th style={S.th}>Source</th>
                            <th style={S.th}>Status</th>
                            <th style={S.th}>Date</th>
                            <th style={S.th}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {leads.map(lead => (
                            <tr key={lead.id}>
                                <td style={S.td}>
                                    <strong>{lead.name}</strong>
                                    {lead.notes && <div style={{ fontSize: '0.75rem', color: '#888' }}>{lead.notes}</div>}
                                </td>
                                <td style={S.td}>
                                    <div style={{ fontSize: '0.85rem' }}>{lead.email || '—'}</div>
                                    <div style={{ fontSize: '0.8rem', color: '#aaa' }}>{lead.phone || ''}</div>
                                </td>
                                <td style={S.td}><span style={S.srcBadge}>{lead.source}</span></td>
                                <td style={S.td}>
                                    <select value={lead.status} onChange={e => handleStatus(lead.id, e.target.value)}
                                        style={{ ...S.select, padding: '4px 8px', fontSize: '0.8rem' }}>
                                        {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                                    </select>
                                </td>
                                <td style={{ ...S.td, fontSize: '0.85rem', color: '#aaa' }}>
                                    {new Date(lead.created_at).toLocaleDateString()}
                                </td>
                                <td style={S.td}>
                                    <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                                        {lead.phone && (
                                            <button onClick={() => handleWhatsApp(lead)} style={S.waBtn} title="Send WhatsApp">
                                                📱 WhatsApp
                                            </button>
                                        )}
                                        {lead.email && (
                                            <button onClick={() => handleEmail(lead)} style={S.emailBtn} title="Send Email">
                                                ✉️ Email
                                            </button>
                                        )}
                                        <button onClick={() => handleDelete(lead.id)} style={S.delBtn}>🗑️</button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                        {leads.length === 0 && (
                            <tr><td colSpan="6" style={{ textAlign: 'center', padding: '2rem', color: '#888' }}>No leads found</td></tr>
                        )}
                    </tbody>
                </table>
            )}
        </div>
    );
}

const S = {
    title: { fontSize: '22px', fontWeight: 600, marginBottom: '20px' },
    statsGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: '12px', marginBottom: '20px' },
    statCard: { background: 'rgba(255,255,255,0.05)', borderRadius: '10px', padding: '16px', textAlign: 'center', borderTop: '3px solid' },
    statVal: { fontSize: '24px', fontWeight: 700 },
    statLabel: { fontSize: '11px', color: 'rgba(255,255,255,0.5)', marginTop: '4px', textTransform: 'capitalize' },
    filters: { display: 'flex', gap: '10px', marginBottom: '16px' },
    select: { background: 'rgba(15,15,35,0.8)', border: '1px solid #444', borderRadius: '6px', padding: '6px 12px', color: '#fff', fontSize: '0.85rem' },
    table: { width: '100%', borderCollapse: 'collapse' },
    th: { textAlign: 'left', padding: '10px', borderBottom: '1px solid #333', color: '#aaa', fontSize: '0.8rem', textTransform: 'uppercase' },
    td: { padding: '10px', borderBottom: '1px solid rgba(255,255,255,0.05)' },
    srcBadge: { fontSize: '0.75rem', padding: '2px 8px', borderRadius: '8px', background: 'rgba(139,92,246,0.15)', color: '#a78bfa', textTransform: 'capitalize' },
    waBtn: { padding: '4px 8px', border: '1px solid #25D366', borderRadius: '4px', background: 'rgba(37,211,102,0.1)', color: '#25D366', cursor: 'pointer', fontSize: '0.75rem' },
    emailBtn: { padding: '4px 8px', border: '1px solid #3b82f6', borderRadius: '4px', background: 'rgba(59,130,246,0.1)', color: '#93c5fd', cursor: 'pointer', fontSize: '0.75rem' },
    delBtn: { padding: '4px 8px', border: '1px solid #555', borderRadius: '4px', background: 'transparent', color: '#f87171', cursor: 'pointer', fontSize: '0.75rem' },
};
