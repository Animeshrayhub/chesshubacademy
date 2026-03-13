import { useState, useEffect } from 'react';
import { getAllHomework, createHomework, reviewHomework } from '../../api/studentApi';
import { getAllStudents } from '../../api/studentApi';

export default function AdminHomework() {
    const [homework, setHomework] = useState([]);
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [reviewing, setReviewing] = useState(null);
    const [filter, setFilter] = useState('all');
    const [form, setForm] = useState({ student_id: '', title: '', description: '', due_date: '' });
    const [reviewForm, setReviewForm] = useState({ feedback: '', grade: '' });

    const loadData = async () => {
        try {
            const [h, s] = await Promise.all([getAllHomework(), getAllStudents()]);
            setHomework(h || []);
            setStudents(s || []);
        } catch { /* empty */ }
        setLoading(false);
    };

    useEffect(() => { loadData(); }, []);

    const handleCreate = async (e) => {
        e.preventDefault();
        await createHomework(form);
        setForm({ student_id: '', title: '', description: '', due_date: '' });
        setShowForm(false);
        loadData();
    };

    const handleReview = async (e) => {
        e.preventDefault();
        await reviewHomework(reviewing.id, reviewForm.feedback, reviewForm.grade);
        setReviewing(null);
        setReviewForm({ feedback: '', grade: '' });
        loadData();
    };

    const filtered = filter === 'all' ? homework : homework.filter(h => h.status === filter);

    if (loading) return <div style={S.loading}>Loading...</div>;

    return (
        <div>
            <div style={S.topBar}>
                <h2 style={S.title}>Homework Management</h2>
                <button onClick={() => setShowForm(!showForm)} style={S.addBtn}>+ Assign Homework</button>
            </div>

            <div style={S.filters}>
                {['all', 'pending', 'submitted', 'reviewed', 'late'].map(f => (
                    <button key={f} onClick={() => setFilter(f)}
                        style={{ ...S.filterBtn, ...(filter === f ? S.filterActive : {}) }}>
                        {f} ({f === 'all' ? homework.length : homework.filter(h => h.status === f).length})
                    </button>
                ))}
            </div>

            {showForm && (
                <form onSubmit={handleCreate} style={S.form}>
                    <h3>Assign New Homework</h3>
                    <div style={S.grid}>
                        <div style={S.field}>
                            <label style={S.label}>Student</label>
                            <select value={form.student_id} onChange={e => setForm(p => ({ ...p, student_id: e.target.value }))}
                                style={S.input} required>
                                <option value="">Select student</option>
                                {students.map(s => (
                                    <option key={s.id} value={s.id}>{s.full_name}</option>
                                ))}
                            </select>
                        </div>
                        <div style={S.field}>
                            <label style={S.label}>Due Date</label>
                            <input type="date" value={form.due_date} onChange={e => setForm(p => ({ ...p, due_date: e.target.value }))}
                                style={S.input} />
                        </div>
                    </div>
                    <div style={S.field}>
                        <label style={S.label}>Title</label>
                        <input value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))}
                            style={S.input} required placeholder="Homework title" />
                    </div>
                    <div style={S.field}>
                        <label style={S.label}>Description</label>
                        <textarea value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
                            style={{ ...S.input, minHeight: '80px' }} placeholder="Instructions for the student..." />
                    </div>
                    <div style={S.formActions}>
                        <button type="submit" style={S.addBtn}>Assign</button>
                        <button type="button" onClick={() => setShowForm(false)} style={S.cancelBtn}>Cancel</button>
                    </div>
                </form>
            )}

            {reviewing && (
                <form onSubmit={handleReview} style={{ ...S.form, borderLeft: '3px solid #10b981' }}>
                    <h3>Review: {reviewing.title}</h3>
                    <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.5)' }}>
                        Student: {reviewing.student?.full_name} | Submitted: {reviewing.submission_text || 'N/A'}
                    </p>
                    {reviewing.submission_url && (
                        <a href={reviewing.submission_url} target="_blank" rel="noopener noreferrer" style={S.link}>View Submission</a>
                    )}
                    <div style={S.grid}>
                        <div style={S.field}>
                            <label style={S.label}>Grade</label>
                            <input value={reviewForm.grade} onChange={e => setReviewForm(p => ({ ...p, grade: e.target.value }))}
                                style={S.input} placeholder="A+, B, etc." />
                        </div>
                    </div>
                    <div style={S.field}>
                        <label style={S.label}>Feedback</label>
                        <textarea value={reviewForm.feedback} onChange={e => setReviewForm(p => ({ ...p, feedback: e.target.value }))}
                            style={{ ...S.input, minHeight: '80px' }} placeholder="Coach feedback..." />
                    </div>
                    <div style={S.formActions}>
                        <button type="submit" style={S.addBtn}>Submit Review</button>
                        <button type="button" onClick={() => setReviewing(null)} style={S.cancelBtn}>Cancel</button>
                    </div>
                </form>
            )}

            <div style={S.cards}>
                {filtered.length === 0 ? (
                    <p style={S.empty}>No homework found.</p>
                ) : filtered.map(h => (
                    <div key={h.id} style={S.card}>
                        <div style={S.cardTop}>
                            <strong>{h.title}</strong>
                            <span style={{ ...S.statusBadge, background: statusColor(h.status) }}>{h.status}</span>
                        </div>
                        <div style={S.meta}>
                            <span>Student: {h.student?.full_name || '—'}</span>
                            {h.due_date && <span>Due: {new Date(h.due_date).toLocaleDateString()}</span>}
                        </div>
                        {h.description && <p style={S.desc}>{h.description}</p>}
                        {h.status === 'submitted' && (
                            <button onClick={() => { setReviewing(h); setReviewForm({ feedback: '', grade: '' }); }}
                                style={{ ...S.smallBtn, marginTop: '8px' }}>Review</button>
                        )}
                        {h.coach_feedback && (
                            <div style={S.feedback}>
                                <strong>Feedback:</strong> {h.coach_feedback}
                                {h.grade && <span style={S.grade}>Grade: {h.grade}</span>}
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}

function statusColor(s) {
    return { pending: '#f59e0b', submitted: '#3b82f6', reviewed: '#10b981', late: '#ef4444' }[s] || '#6b7280';
}

const S = {
    loading: { textAlign: 'center', padding: '40px', color: 'rgba(255,255,255,0.5)' },
    topBar: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' },
    title: { fontSize: '22px', fontWeight: 600 },
    addBtn: { padding: '10px 20px', borderRadius: '8px', border: 'none', background: '#8b5cf6', color: '#fff', cursor: 'pointer', fontWeight: 600 },
    cancelBtn: { padding: '10px 20px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.2)', background: 'transparent', color: '#fff', cursor: 'pointer' },
    filters: { display: 'flex', gap: '8px', marginBottom: '20px', flexWrap: 'wrap' },
    filterBtn: { padding: '6px 14px', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.15)', background: 'transparent', color: 'rgba(255,255,255,0.6)', cursor: 'pointer', fontSize: '12px', textTransform: 'capitalize' },
    filterActive: { background: '#8b5cf6', color: '#fff', borderColor: '#8b5cf6' },
    form: { background: 'rgba(255,255,255,0.05)', borderRadius: '12px', padding: '24px', marginBottom: '24px' },
    grid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' },
    field: { display: 'flex', flexDirection: 'column', gap: '4px', marginBottom: '8px' },
    label: { fontSize: '12px', color: 'rgba(255,255,255,0.6)' },
    input: { padding: '8px 12px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.15)', background: 'rgba(255,255,255,0.05)', color: '#fff', fontSize: '13px', outline: 'none' },
    formActions: { display: 'flex', gap: '12px', marginTop: '12px' },
    link: { color: '#8b5cf6', fontSize: '13px' },
    cards: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '16px' },
    card: { background: 'rgba(255,255,255,0.05)', borderRadius: '12px', padding: '20px' },
    cardTop: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' },
    statusBadge: { padding: '3px 10px', borderRadius: '12px', color: '#fff', fontSize: '11px', fontWeight: 600, textTransform: 'capitalize' },
    meta: { display: 'flex', gap: '16px', fontSize: '12px', color: 'rgba(255,255,255,0.4)', marginBottom: '8px' },
    desc: { fontSize: '13px', color: 'rgba(255,255,255,0.6)', margin: '8px 0' },
    smallBtn: { padding: '6px 14px', borderRadius: '6px', border: 'none', background: '#10b981', color: '#fff', cursor: 'pointer', fontSize: '12px', fontWeight: 600 },
    feedback: { marginTop: '12px', padding: '12px', borderRadius: '8px', background: 'rgba(16,185,129,0.08)', fontSize: '13px', color: 'rgba(255,255,255,0.7)' },
    grade: { marginLeft: '12px', padding: '2px 8px', borderRadius: '6px', background: 'rgba(139,92,246,0.2)', fontSize: '12px' },
    empty: { textAlign: 'center', padding: '24px', color: 'rgba(255,255,255,0.4)', gridColumn: '1 / -1' },
};
