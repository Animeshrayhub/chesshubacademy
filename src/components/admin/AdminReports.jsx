import { useState, useEffect } from 'react';
import { getAllReports, createReport, deleteReport } from '../../api/reportApi';
import { getAllStudents } from '../../api/studentApi';

export default function AdminReports() {
    const [reports, setReports] = useState([]);
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [form, setForm] = useState({
        student_id: '', report_period: '',
        attendance_pct: 0, sessions_attended: 0, sessions_total: 0,
        puzzles_solved: 0, rating_start: 0, rating_end: 0,
        improvement_areas: '', coach_notes: '',
        recommended_exercises: '', strengths: '',
    });

    const loadData = async () => {
        try {
            const [r, s] = await Promise.all([getAllReports(), getAllStudents()]);
            setReports(r || []);
            setStudents(s || []);
        } catch { /* empty */ }
        setLoading(false);
    };

    useEffect(() => { loadData(); }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        const report = {
            ...form,
            attendance_pct: parseFloat(form.attendance_pct) || 0,
            sessions_attended: parseInt(form.sessions_attended) || 0,
            sessions_total: parseInt(form.sessions_total) || 0,
            puzzles_solved: parseInt(form.puzzles_solved) || 0,
            rating_start: parseInt(form.rating_start) || 0,
            rating_end: parseInt(form.rating_end) || 0,
            improvement_areas: form.improvement_areas.split('\n').filter(Boolean),
            recommended_exercises: form.recommended_exercises.split('\n').filter(Boolean),
            strengths: form.strengths.split('\n').filter(Boolean),
        };
        await createReport(report);
        setShowForm(false);
        setForm({ student_id: '', report_period: '', attendance_pct: 0, sessions_attended: 0, sessions_total: 0, puzzles_solved: 0, rating_start: 0, rating_end: 0, improvement_areas: '', coach_notes: '', recommended_exercises: '', strengths: '' });
        loadData();
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Delete this report?')) return;
        await deleteReport(id);
        loadData();
    };

    if (loading) return <div style={S.loading}>Loading...</div>;

    return (
        <div>
            <div style={S.topBar}>
                <h2 style={S.title}>Progress Reports</h2>
                <button onClick={() => setShowForm(!showForm)} style={S.addBtn}>+ Generate Report</button>
            </div>

            {showForm && (
                <form onSubmit={handleSubmit} style={S.form}>
                    <h3>Generate Progress Report</h3>
                    <div style={S.grid3}>
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
                            <label style={S.label}>Report Period</label>
                            <input value={form.report_period} onChange={e => setForm(p => ({ ...p, report_period: e.target.value }))}
                                style={S.input} placeholder="e.g., January 2026" required />
                        </div>
                        <div style={S.field}>
                            <label style={S.label}>Attendance %</label>
                            <input type="number" min="0" max="100" value={form.attendance_pct}
                                onChange={e => setForm(p => ({ ...p, attendance_pct: e.target.value }))} style={S.input} />
                        </div>
                    </div>
                    <div style={S.grid3}>
                        <div style={S.field}>
                            <label style={S.label}>Sessions Attended</label>
                            <input type="number" value={form.sessions_attended}
                                onChange={e => setForm(p => ({ ...p, sessions_attended: e.target.value }))} style={S.input} />
                        </div>
                        <div style={S.field}>
                            <label style={S.label}>Total Sessions</label>
                            <input type="number" value={form.sessions_total}
                                onChange={e => setForm(p => ({ ...p, sessions_total: e.target.value }))} style={S.input} />
                        </div>
                        <div style={S.field}>
                            <label style={S.label}>Puzzles Solved</label>
                            <input type="number" value={form.puzzles_solved}
                                onChange={e => setForm(p => ({ ...p, puzzles_solved: e.target.value }))} style={S.input} />
                        </div>
                    </div>
                    <div style={S.grid2}>
                        <div style={S.field}>
                            <label style={S.label}>Rating Start</label>
                            <input type="number" value={form.rating_start}
                                onChange={e => setForm(p => ({ ...p, rating_start: e.target.value }))} style={S.input} />
                        </div>
                        <div style={S.field}>
                            <label style={S.label}>Rating End</label>
                            <input type="number" value={form.rating_end}
                                onChange={e => setForm(p => ({ ...p, rating_end: e.target.value }))} style={S.input} />
                        </div>
                    </div>
                    <div style={S.field}>
                        <label style={S.label}>Strengths (one per line)</label>
                        <textarea value={form.strengths} onChange={e => setForm(p => ({ ...p, strengths: e.target.value }))}
                            style={{ ...S.input, minHeight: '60px' }} placeholder="Tactical awareness&#10;Opening preparation" />
                    </div>
                    <div style={S.field}>
                        <label style={S.label}>Improvement Areas (one per line)</label>
                        <textarea value={form.improvement_areas} onChange={e => setForm(p => ({ ...p, improvement_areas: e.target.value }))}
                            style={{ ...S.input, minHeight: '60px' }} placeholder="Endgame technique&#10;Time management" />
                    </div>
                    <div style={S.field}>
                        <label style={S.label}>Coach Notes</label>
                        <textarea value={form.coach_notes} onChange={e => setForm(p => ({ ...p, coach_notes: e.target.value }))}
                            style={{ ...S.input, minHeight: '80px' }} placeholder="Detailed notes about student performance..." />
                    </div>
                    <div style={S.field}>
                        <label style={S.label}>Recommended Exercises (one per line)</label>
                        <textarea value={form.recommended_exercises} onChange={e => setForm(p => ({ ...p, recommended_exercises: e.target.value }))}
                            style={{ ...S.input, minHeight: '60px' }} placeholder="Practice 10 endgame puzzles daily&#10;Study Ruy Lopez variations" />
                    </div>
                    <div style={S.formActions}>
                        <button type="submit" style={S.addBtn}>Generate Report</button>
                        <button type="button" onClick={() => setShowForm(false)} style={S.cancelBtn}>Cancel</button>
                    </div>
                </form>
            )}

            <div style={S.cards}>
                {reports.length === 0 ? (
                    <p style={S.empty}>No reports generated yet.</p>
                ) : reports.map(r => (
                    <div key={r.id} style={S.card}>
                        <div style={S.cardTop}>
                            <div>
                                <strong>{r.student?.full_name || 'Unknown'}</strong>
                                <div style={S.meta}>{r.report_period} &middot; {new Date(r.generated_at).toLocaleDateString()}</div>
                            </div>
                            <button onClick={() => handleDelete(r.id)} style={S.deleteBtn}>Delete</button>
                        </div>
                        <div style={S.reportStats}>
                            <div><span style={S.reportLabel}>Attendance</span><span style={S.reportVal}>{r.attendance_pct}%</span></div>
                            <div><span style={S.reportLabel}>Sessions</span><span style={S.reportVal}>{r.sessions_attended}/{r.sessions_total}</span></div>
                            <div><span style={S.reportLabel}>Puzzles</span><span style={S.reportVal}>{r.puzzles_solved}</span></div>
                            <div>
                                <span style={S.reportLabel}>Rating</span>
                                <span style={S.reportVal}>
                                    {r.rating_start} → {r.rating_end}
                                    {r.rating_end > r.rating_start && <span style={S.positive}> +{r.rating_end - r.rating_start}</span>}
                                </span>
                            </div>
                        </div>
                        {r.strengths?.length > 0 && (
                            <div style={S.listSection}><strong>Strengths:</strong> {r.strengths.join(', ')}</div>
                        )}
                        {r.improvement_areas?.length > 0 && (
                            <div style={S.listSection}><strong>Improve:</strong> {r.improvement_areas.join(', ')}</div>
                        )}
                        {r.coach_notes && (
                            <div style={S.notes}><strong>Coach Notes:</strong> {r.coach_notes}</div>
                        )}
                        {r.student?.parent_email && (
                            <div style={S.parentInfo}>Parent: {r.student.parent_email}</div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}

const S = {
    loading: { textAlign: 'center', padding: '40px', color: 'rgba(255,255,255,0.5)' },
    topBar: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' },
    title: { fontSize: '22px', fontWeight: 600 },
    addBtn: { padding: '10px 20px', borderRadius: '8px', border: 'none', background: '#8b5cf6', color: '#fff', cursor: 'pointer', fontWeight: 600 },
    cancelBtn: { padding: '10px 20px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.2)', background: 'transparent', color: '#fff', cursor: 'pointer' },
    deleteBtn: { padding: '4px 12px', borderRadius: '6px', border: 'none', background: '#ef4444', color: '#fff', cursor: 'pointer', fontSize: '11px' },
    form: { background: 'rgba(255,255,255,0.05)', borderRadius: '12px', padding: '24px', marginBottom: '24px' },
    grid3: { display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px', marginBottom: '12px' },
    grid2: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' },
    field: { display: 'flex', flexDirection: 'column', gap: '4px', marginBottom: '8px' },
    label: { fontSize: '12px', color: 'rgba(255,255,255,0.6)' },
    input: { padding: '8px 12px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.15)', background: 'rgba(255,255,255,0.05)', color: '#fff', fontSize: '13px', outline: 'none' },
    formActions: { display: 'flex', gap: '12px', marginTop: '12px' },
    cards: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(400px, 1fr))', gap: '16px' },
    card: { background: 'rgba(255,255,255,0.05)', borderRadius: '12px', padding: '24px' },
    cardTop: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' },
    meta: { fontSize: '12px', color: 'rgba(255,255,255,0.4)', marginTop: '4px' },
    reportStats: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' },
    reportLabel: { display: 'block', fontSize: '11px', color: 'rgba(255,255,255,0.4)' },
    reportVal: { fontSize: '16px', fontWeight: 600 },
    positive: { color: '#10b981' },
    listSection: { fontSize: '13px', color: 'rgba(255,255,255,0.7)', marginBottom: '8px' },
    notes: { fontSize: '13px', color: 'rgba(255,255,255,0.6)', padding: '12px', borderRadius: '8px', background: 'rgba(255,255,255,0.03)', marginTop: '8px' },
    parentInfo: { fontSize: '11px', color: 'rgba(255,255,255,0.3)', marginTop: '12px' },
    empty: { textAlign: 'center', padding: '24px', color: 'rgba(255,255,255,0.4)', gridColumn: '1 / -1' },
};
