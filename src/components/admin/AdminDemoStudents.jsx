import { useState, useEffect } from 'react';
import {
    getAllDemoStudents,
    createDemoStudent,
    updateDemoStudent,
    deleteDemoStudent,
    convertDemoToStudent,
} from '../../api/demoStudentApi';

export default function AdminDemoStudents() {
    const [demoStudents, setDemoStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [showForm, setShowForm] = useState(false);
    const [converting, setConverting] = useState(null);
    const [form, setForm] = useState({
        name: '', email: '', phone: '', demo_username: '', demo_password: '', demo_date: '', notes: '',
    });

    const loadData = async () => {
        const data = await getAllDemoStudents();
        setDemoStudents(data || []);
        setLoading(false);
    };

    useEffect(() => {
        let cancelled = false;
        getAllDemoStudents().then(data => {
            if (!cancelled) {
                setDemoStudents(data || []);
                setLoading(false);
            }
        });
        return () => { cancelled = true; };
    }, []);

    const generateCredentials = () => {
        const name = form.name.trim().toLowerCase().replace(/\s+/g, '');
        const suffix = Math.floor(1000 + Math.random() * 9000);
        const pwd = Math.random().toString(36).slice(2, 10);
        setForm(p => ({
            ...p,
            demo_username: name ? `demo_${name}_${suffix}` : `demo_${suffix}`,
            demo_password: pwd,
        }));
    };

    const handleCreate = async (e) => {
        e.preventDefault();
        if (!form.demo_username || !form.demo_password) {
            return;
        }
        const result = await createDemoStudent(form);
        if (result.success) {
            setShowForm(false);
            setForm({ name: '', email: '', phone: '', demo_username: '', demo_password: '', demo_date: '', notes: '' });
            loadData();
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Delete this demo student?')) return;
        await deleteDemoStudent(id);
        loadData();
    };

    const handleConvert = async (id) => {
        if (!window.confirm('Convert this demo student to a full student? This will create a student profile entry.')) return;
        setConverting(id);
        const result = await convertDemoToStudent(id);
        if (result.success) {
            loadData();
        }
        setConverting(null);
    };

    const handleStatusChange = async (id, status) => {
        await updateDemoStudent(id, { status });
        loadData();
    };

    const filtered = demoStudents.filter(s =>
        s.name?.toLowerCase().includes(search.toLowerCase()) ||
        s.demo_username?.toLowerCase().includes(search.toLowerCase()) ||
        s.email?.toLowerCase().includes(search.toLowerCase())
    );

    const statusCounts = {
        active: demoStudents.filter(s => s.status === 'active').length,
        pending: demoStudents.filter(s => s.status === 'pending').length,
        converted: demoStudents.filter(s => s.status === 'converted').length,
        expired: demoStudents.filter(s => s.status === 'expired' || s.status === 'demo_completed').length,
    };

    if (loading) return <div style={S.loading}>Loading demo students...</div>;

    return (
        <div>
            <div style={S.topBar}>
                <h2 style={S.title}>Demo Students ({demoStudents.length})</h2>
                <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                    <input value={search} onChange={e => setSearch(e.target.value)}
                        style={S.search} placeholder="Search by name or username..." />
                    <button onClick={() => setShowForm(true)} style={S.addBtn}>+ Create Demo Account</button>
                </div>
            </div>

            {showForm && (
                <div style={S.formOverlay}>
                    <form onSubmit={handleCreate} style={S.formCard}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
                            <h3 style={{ margin: 0 }}>Create Demo Student</h3>
                            <button type="button" onClick={() => setShowForm(false)} style={S.closeBtn}>×</button>
                        </div>
                        <div style={S.formGrid}>
                            <div style={S.field}>
                                <label style={S.formLabel}>Full Name *</label>
                                <input required value={form.name}
                                    onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                                    style={S.formInput} placeholder="Student name" />
                            </div>
                            <div style={S.field}>
                                <label style={S.formLabel}>Email</label>
                                <input type="email" value={form.email}
                                    onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
                                    style={S.formInput} placeholder="student@email.com" />
                            </div>
                            <div style={S.field}>
                                <label style={S.formLabel}>Phone</label>
                                <input value={form.phone}
                                    onChange={e => setForm(p => ({ ...p, phone: e.target.value }))}
                                    style={S.formInput} placeholder="+91 XXXXX XXXXX" />
                            </div>
                            <div style={S.field}>
                                <label style={S.formLabel}>Demo Date</label>
                                <input type="datetime-local" value={form.demo_date}
                                    onChange={e => setForm(p => ({ ...p, demo_date: e.target.value }))}
                                    style={S.formInput} />
                            </div>
                            <div style={S.field}>
                                <label style={S.formLabel}>Demo Username *</label>
                                <input required value={form.demo_username}
                                    onChange={e => setForm(p => ({ ...p, demo_username: e.target.value }))}
                                    style={S.formInput} placeholder="demo_username" />
                            </div>
                            <div style={S.field}>
                                <label style={S.formLabel}>Demo Password *</label>
                                <input required value={form.demo_password}
                                    onChange={e => setForm(p => ({ ...p, demo_password: e.target.value }))}
                                    style={S.formInput} placeholder="password" />
                            </div>
                            <div style={{ gridColumn: '1 / -1' }}>
                                <button type="button" onClick={generateCredentials} style={S.genBtn}>
                                    🔑 Auto-Generate Credentials
                                </button>
                            </div>
                            <div style={{ ...S.field, gridColumn: '1 / -1' }}>
                                <label style={S.formLabel}>Notes</label>
                                <textarea value={form.notes}
                                    onChange={e => setForm(p => ({ ...p, notes: e.target.value }))}
                                    style={{ ...S.formInput, minHeight: '60px', resize: 'vertical' }}
                                    placeholder="Admin notes about this demo student..." />
                            </div>
                        </div>
                        <button type="submit" style={S.submitBtn}>Create Demo Account</button>
                    </form>
                </div>
            )}

            <div style={S.stats}>
                <div style={S.statCard}>
                    <span style={S.statValue}>{demoStudents.length}</span>
                    <span style={S.statLabel}>Total</span>
                </div>
                <div style={{ ...S.statCard, borderTop: '3px solid #10b981' }}>
                    <span style={S.statValue}>{statusCounts.active}</span>
                    <span style={S.statLabel}>Active</span>
                </div>
                <div style={{ ...S.statCard, borderTop: '3px solid #8b5cf6' }}>
                    <span style={S.statValue}>{statusCounts.converted}</span>
                    <span style={S.statLabel}>Converted</span>
                </div>
                <div style={{ ...S.statCard, borderTop: '3px solid #6b7280' }}>
                    <span style={S.statValue}>{statusCounts.expired}</span>
                    <span style={S.statLabel}>Expired</span>
                </div>
            </div>

            <div style={S.table}>
                <div style={S.tableHeader}>
                    <span style={{ flex: 2 }}>Name</span>
                    <span style={{ flex: 2 }}>Username</span>
                    <span style={{ flex: 1 }}>Password</span>
                    <span style={{ flex: 1 }}>Status</span>
                    <span style={{ flex: 1 }}>Demo Date</span>
                    <span style={{ flex: 1 }}>Created</span>
                    <span style={{ flex: 2 }}>Actions</span>
                </div>
                {filtered.length === 0 ? (
                    <p style={S.empty}>No demo students found.</p>
                ) : filtered.map(s => (
                    <div key={s.id} style={S.tableRow}>
                        <span style={{ flex: 2, fontWeight: 600 }}>
                            {s.name}
                            {s.email && <span style={{ display: 'block', fontSize: '11px', color: 'rgba(255,255,255,0.4)' }}>{s.email}</span>}
                        </span>
                        <span style={{ flex: 2, fontSize: '12px', fontFamily: 'monospace' }}>{s.demo_username}</span>
                        <span style={{ flex: 1, fontSize: '12px', fontFamily: 'monospace' }}>{s.demo_password}</span>
                        <span style={{ flex: 1 }}>
                            <span style={{ ...S.statusBadge, background: statusColor(s.status) }}>{s.status}</span>
                        </span>
                        <span style={{ flex: 1, fontSize: '12px' }}>
                            {s.demo_date ? new Date(s.demo_date).toLocaleDateString() : '—'}
                        </span>
                        <span style={{ flex: 1, fontSize: '12px' }}>
                            {new Date(s.created_at).toLocaleDateString()}
                        </span>
                        <span style={{ flex: 2, display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                            {(s.status === 'active' || s.status === 'pending' || s.status === 'demo_completed') && (
                                <button
                                    onClick={() => handleConvert(s.id)}
                                    disabled={converting === s.id}
                                    style={S.convertBtn}
                                    title="Convert to full student"
                                >
                                    {converting === s.id ? '...' : '🎓 Convert'}
                                </button>
                            )}
                            {s.status === 'active' && (
                                <button onClick={() => handleStatusChange(s.id, 'expired')}
                                    style={S.expireBtn} title="Expire demo">
                                    ⏰
                                </button>
                            )}
                            {s.status !== 'converted' && (
                                <button onClick={() => handleDelete(s.id)} style={S.deleteBtn}>🗑️</button>
                            )}
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
}

function statusColor(status) {
    return {
        pending: '#f59e0b',
        active: '#10b981',
        demo_completed: '#3b82f6',
        converted: '#8b5cf6',
        expired: '#6b7280',
    }[status] || '#6b7280';
}

const S = {
    loading: { textAlign: 'center', padding: '40px', color: 'rgba(255,255,255,0.5)' },
    topBar: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' },
    title: { fontSize: '22px', fontWeight: 600 },
    search: { padding: '8px 16px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.15)', background: 'rgba(255,255,255,0.05)', color: '#fff', fontSize: '13px', outline: 'none', width: '280px' },
    addBtn: { padding: '8px 20px', borderRadius: '8px', border: 'none', background: 'linear-gradient(135deg, #f59e0b, #d97706)', color: '#fff', cursor: 'pointer', fontWeight: 600, fontSize: '13px' },
    stats: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '24px' },
    statCard: { background: 'rgba(255,255,255,0.05)', borderRadius: '12px', padding: '20px', textAlign: 'center' },
    statValue: { display: 'block', fontSize: '28px', fontWeight: 700 },
    statLabel: { fontSize: '12px', color: 'rgba(255,255,255,0.5)' },
    table: { background: 'rgba(255,255,255,0.03)', borderRadius: '12px', overflow: 'hidden' },
    tableHeader: { display: 'flex', padding: '12px 16px', background: 'rgba(255,255,255,0.05)', fontSize: '11px', color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', fontWeight: 600 },
    tableRow: { display: 'flex', padding: '14px 16px', borderBottom: '1px solid rgba(255,255,255,0.05)', alignItems: 'center', fontSize: '13px' },
    statusBadge: { padding: '3px 10px', borderRadius: '12px', color: '#fff', fontSize: '11px', fontWeight: 600, textTransform: 'capitalize' },
    empty: { textAlign: 'center', padding: '24px', color: 'rgba(255,255,255,0.4)' },
    deleteBtn: { background: 'none', border: 'none', cursor: 'pointer', fontSize: '16px', padding: '4px' },
    convertBtn: { padding: '4px 10px', borderRadius: '6px', border: 'none', background: 'rgba(139,92,246,0.3)', color: '#c4b5fd', cursor: 'pointer', fontSize: '12px', fontWeight: 600 },
    expireBtn: { background: 'none', border: 'none', cursor: 'pointer', fontSize: '16px', padding: '4px' },
    genBtn: { padding: '8px 16px', borderRadius: '8px', border: '1px dashed rgba(255,255,255,0.2)', background: 'transparent', color: 'rgba(255,255,255,0.6)', cursor: 'pointer', fontSize: '13px', width: '100%' },
    formOverlay: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 },
    formCard: { background: '#1a1a3e', borderRadius: '16px', padding: '32px', width: '90%', maxWidth: '600px', maxHeight: '90vh', overflowY: 'auto', border: '1px solid rgba(255,255,255,0.1)' },
    formGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' },
    field: { display: 'flex', flexDirection: 'column', gap: '4px' },
    formLabel: { fontSize: '12px', color: 'rgba(255,255,255,0.6)', fontWeight: 600 },
    formInput: { padding: '10px 14px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.15)', background: 'rgba(255,255,255,0.05)', color: '#fff', fontSize: '13px', outline: 'none' },
    closeBtn: { background: 'none', border: 'none', color: '#fff', fontSize: '24px', cursor: 'pointer' },
    submitBtn: { width: '100%', marginTop: '20px', padding: '12px', borderRadius: '8px', border: 'none', background: 'linear-gradient(135deg, #f59e0b, #d97706)', color: '#fff', cursor: 'pointer', fontWeight: 600, fontSize: '14px' },
};
