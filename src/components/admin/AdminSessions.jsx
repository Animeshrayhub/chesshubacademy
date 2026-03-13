import { useState, useEffect } from 'react';
import { getAllSessions, createSession, updateSession, deleteSession } from '../../api/sessionApi';
import { getAllStudents } from '../../api/studentApi';
import { getCoaches } from '../../api/coachApi';
import { supabase } from '../../services/supabase';
import RescheduleSession from '../Training/RescheduleSession';

export default function AdminSessions() {
    const [sessions, setSessions] = useState([]);
    const [students, setStudents] = useState([]);
    const [coaches, setCoaches] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editing, setEditing] = useState(null);
    const [filter, setFilter] = useState('all');
    const [rescheduleSession, setRescheduleSession] = useState(null);
    const [form, setForm] = useState({
        title: '', student_id: '', coach_id: '', date: '', start_time: '',
        duration: 60, meeting_link: '', status: 'scheduled', notes: '',
    });

    const loadData = async () => {
        try {
            const [s, st, co] = await Promise.all([getAllSessions(), getAllStudents(), getCoaches()]);
            setSessions(s || []);
            setStudents(st || []);
            setCoaches(co || []);
        } catch { /* empty */ }
        setLoading(false);
    };

    useEffect(() => { loadData(); }, []);

    useEffect(() => {
        if (!supabase) return;
        const channel = supabase
            .channel('admin-sessions-realtime')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'sessions' }, () => loadData())
            .subscribe();
        return () => { supabase.removeChannel(channel); };
    }, []);

    const resetForm = () => {
        setForm({ title: '', student_id: '', coach_id: '', date: '', start_time: '', duration: 60, meeting_link: '', status: 'scheduled', notes: '' });
        setEditing(null);
        setShowForm(false);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editing) {
                await updateSession(editing.id, form);
            } else {
                await createSession(form);
            }
            resetForm();
            loadData();
        } catch { /* empty */ }
    };

    const handleEdit = (s) => {
        setForm({
            title: s.title || '',
            student_id: s.student_id || '',
            coach_id: s.coach_id || '',
            date: s.date,
            start_time: s.start_time,
            duration: s.duration,
            meeting_link: s.meeting_link || '',
            status: s.status,
            notes: s.notes || '',
        });
        setEditing(s);
        setShowForm(true);
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Delete this session?')) return;
        await deleteSession(id);
        loadData();
    };

    const handleStatusUpdate = async (id, status) => {
        await updateSession(id, { status });
        loadData();
    };

    const filtered = filter === 'all' ? sessions : sessions.filter(s => s.status === filter);

    if (loading) return <div style={S.loading}>Loading sessions...</div>;

    return (
        <div>
            <div style={S.topBar}>
                <h2 style={S.title}>Session Management</h2>
                <button onClick={() => { resetForm(); setShowForm(true); }} style={S.addBtn}>+ Schedule Session</button>
            </div>

            <div style={S.filters}>
                {['all', 'scheduled', 'completed', 'cancelled', 'no_show'].map(f => (
                    <button key={f} onClick={() => setFilter(f)}
                        style={{ ...S.filterBtn, ...(filter === f ? S.filterActive : {}) }}>
                        {f === 'all' ? 'All' : f.replace('_', ' ')}
                    </button>
                ))}
            </div>

            {showForm && (
                <form onSubmit={handleSubmit} style={S.form}>
                    <h3>{editing ? 'Edit Session' : 'Schedule New Session'}</h3>
                    <div style={S.grid}>
                        <div style={S.field}>
                            <label style={S.label}>Title</label>
                            <input value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))}
                                style={S.input} placeholder="Chess Session" />
                        </div>
                        <div style={S.field}>
                            <label style={S.label}>Student</label>
                            <select value={form.student_id} onChange={e => setForm(p => ({ ...p, student_id: e.target.value }))}
                                style={S.input} required>
                                <option value="">Select student</option>
                                {students.map(st => (
                                    <option key={st.id} value={st.id}>{st.full_name} ({st.email})</option>
                                ))}
                            </select>
                        </div>
                        <div style={S.field}>
                            <label style={S.label}>Assign Coach</label>
                            <select value={form.coach_id} onChange={e => setForm(p => ({ ...p, coach_id: e.target.value }))}
                                style={S.input}>
                                <option value="">Select coach (optional)</option>
                                {coaches.map(c => (
                                    <option key={c.id} value={c.id}>{c.name}{c.specialization ? ` — ${c.specialization}` : ''}</option>
                                ))}
                            </select>
                        </div>
                        <div style={S.field}>
                            <label style={S.label}>Date</label>
                            <input type="date" value={form.date} onChange={e => setForm(p => ({ ...p, date: e.target.value }))}
                                style={S.input} required />
                        </div>
                        <div style={S.field}>
                            <label style={S.label}>Start Time</label>
                            <input type="time" value={form.start_time} onChange={e => setForm(p => ({ ...p, start_time: e.target.value }))}
                                style={S.input} required />
                        </div>
                        <div style={S.field}>
                            <label style={S.label}>Duration (min)</label>
                            <input type="number" value={form.duration} onChange={e => setForm(p => ({ ...p, duration: parseInt(e.target.value) }))}
                                style={S.input} min="15" max="180" />
                        </div>
                        <div style={S.field}>
                            <label style={S.label}>Meeting Link</label>
                            <input value={form.meeting_link} onChange={e => setForm(p => ({ ...p, meeting_link: e.target.value }))}
                                style={S.input} placeholder="https://meet.google.com/..." />
                        </div>
                    </div>
                    <div style={S.field}>
                        <label style={S.label}>Notes</label>
                        <textarea value={form.notes} onChange={e => setForm(p => ({ ...p, notes: e.target.value }))}
                            style={{ ...S.input, minHeight: '60px' }} placeholder="Session notes..." />
                    </div>
                    <div style={S.formActions}>
                        <button type="submit" style={S.addBtn}>{editing ? 'Update' : 'Create'}</button>
                        <button type="button" onClick={resetForm} style={S.cancelBtn}>Cancel</button>
                    </div>
                </form>
            )}

            <div style={S.table}>
                <div style={S.tableHeader}>
                    <span style={{ flex: 2 }}>Session</span>
                    <span style={{ flex: 2 }}>Student</span>
                    <span style={{ flex: 1.5 }}>Coach</span>
                    <span style={{ flex: 1 }}>Date</span>
                    <span style={{ flex: 1 }}>Time</span>
                    <span style={{ flex: 1 }}>Status</span>
                    <span style={{ flex: 2 }}>Actions</span>
                </div>
                {filtered.length === 0 ? (
                    <p style={S.empty}>No sessions found.</p>
                ) : filtered.map(s => (
                    <div key={s.id} style={S.tableRow}>
                        <span style={{ flex: 2 }}>{s.title || 'Chess Session'}</span>
                        <span style={{ flex: 2 }}>{s.student?.full_name || '—'}</span>
                        <span style={{ flex: 1.5 }}>{coaches.find(c => c.id === s.coach_id)?.name || '—'}</span>
                        <span style={{ flex: 1 }}>{new Date(s.date).toLocaleDateString()}</span>
                        <span style={{ flex: 1 }}>{s.start_time}</span>
                        <span style={{ flex: 1 }}>
                            <span style={{ ...S.statusBadge, background: statusColor(s.status) }}>
                                {s.status}
                            </span>
                        </span>
                        <span style={{ flex: 2, display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                            {s.status === 'scheduled' && (
                                <>
                                    <button onClick={() => handleStatusUpdate(s.id, 'completed')} style={S.smallBtn}>Complete</button>
                                    <button onClick={() => handleStatusUpdate(s.id, 'no_show')} style={{ ...S.smallBtn, background: '#f59e0b' }}>No Show</button>
                                    <button onClick={() => setRescheduleSession(s)} style={{ ...S.smallBtn, background: '#8b5cf6' }}>Reschedule</button>
                                </>
                            )}
                            <button onClick={() => handleEdit(s)} style={{ ...S.smallBtn, background: '#3b82f6' }}>Edit</button>
                            <button onClick={() => handleDelete(s.id)} style={{ ...S.smallBtn, background: '#ef4444' }}>Delete</button>
                        </span>
                    </div>
                ))}
            </div>

            {rescheduleSession && (
                <RescheduleSession
                    session={rescheduleSession}
                    onClose={() => setRescheduleSession(null)}
                    onRescheduled={() => { setRescheduleSession(null); loadData(); }}
                />
            )}
        </div>
    );
}

function statusColor(s) {
    return { scheduled: '#3b82f6', completed: '#10b981', cancelled: '#6b7280', no_show: '#ef4444' }[s] || '#6b7280';
}

const S = {
    loading: { textAlign: 'center', padding: '40px', color: 'rgba(255,255,255,0.5)' },
    topBar: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' },
    title: { fontSize: '22px', fontWeight: 600 },
    addBtn: { padding: '10px 20px', borderRadius: '8px', border: 'none', background: '#8b5cf6', color: '#fff', cursor: 'pointer', fontWeight: 600 },
    cancelBtn: { padding: '10px 20px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.2)', background: 'transparent', color: '#fff', cursor: 'pointer' },
    filters: { display: 'flex', gap: '8px', marginBottom: '20px' },
    filterBtn: { padding: '6px 14px', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.15)', background: 'transparent', color: 'rgba(255,255,255,0.6)', cursor: 'pointer', fontSize: '12px', textTransform: 'capitalize' },
    filterActive: { background: '#8b5cf6', color: '#fff', borderColor: '#8b5cf6' },
    form: { background: 'rgba(255,255,255,0.05)', borderRadius: '12px', padding: '24px', marginBottom: '24px' },
    grid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' },
    field: { display: 'flex', flexDirection: 'column', gap: '4px', marginBottom: '8px' },
    label: { fontSize: '12px', color: 'rgba(255,255,255,0.6)' },
    input: { padding: '8px 12px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.15)', background: 'rgba(255,255,255,0.05)', color: '#fff', fontSize: '13px', outline: 'none' },
    formActions: { display: 'flex', gap: '12px', marginTop: '12px' },
    table: { background: 'rgba(255,255,255,0.03)', borderRadius: '12px', overflow: 'hidden' },
    tableHeader: { display: 'flex', padding: '12px 16px', background: 'rgba(255,255,255,0.05)', fontSize: '12px', color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', fontWeight: 600 },
    tableRow: { display: 'flex', padding: '14px 16px', borderBottom: '1px solid rgba(255,255,255,0.05)', alignItems: 'center', fontSize: '13px' },
    statusBadge: { padding: '3px 10px', borderRadius: '12px', color: '#fff', fontSize: '11px', fontWeight: 600, textTransform: 'capitalize' },
    smallBtn: { padding: '4px 10px', borderRadius: '6px', border: 'none', background: '#10b981', color: '#fff', cursor: 'pointer', fontSize: '11px', fontWeight: 600 },
    empty: { textAlign: 'center', padding: '24px', color: 'rgba(255,255,255,0.4)' },
};
