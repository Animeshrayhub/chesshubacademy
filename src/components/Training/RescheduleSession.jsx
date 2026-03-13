import { useState } from 'react';
import { updateSession } from '../../api/sessionApi';

export default function RescheduleSession({ session, students, onClose, onSaved }) {
    const [form, setForm] = useState({
        date: '',
        start_time: '',
        reschedule_reason: '',
    });
    const [saving, setSaving] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!form.date || !form.start_time || !form.reschedule_reason.trim()) return;
        setSaving(true);
        try {
            await updateSession(session.id, {
                date: form.date,
                start_time: form.start_time,
                reschedule_reason: form.reschedule_reason,
                rescheduled_from: session.date + ' ' + session.start_time,
                status: 'scheduled',
            });
            onSaved?.();
        } catch { /* empty */ }
        setSaving(false);
    };

    const studentName = students?.find(s => s.id === session.student_id)?.full_name || 'Student';

    return (
        <div style={S.overlay} onClick={onClose}>
            <div style={S.modal} onClick={e => e.stopPropagation()}>
                <button onClick={onClose} style={S.closeBtn}>&times;</button>
                <h3 style={S.title}>📅 Reschedule Session</h3>
                <div style={S.info}>
                    <span><strong>Session:</strong> {session.title || 'Chess Session'}</span>
                    <span><strong>Student:</strong> {studentName}</span>
                    <span><strong>Original:</strong> {new Date(session.date).toLocaleDateString()} at {session.start_time}</span>
                </div>
                <form onSubmit={handleSubmit} style={S.form}>
                    <div style={S.field}>
                        <label style={S.label}>New Date</label>
                        <input type="date" value={form.date} required
                            onChange={e => setForm(p => ({ ...p, date: e.target.value }))} style={S.input} />
                    </div>
                    <div style={S.field}>
                        <label style={S.label}>New Time</label>
                        <input type="time" value={form.start_time} required
                            onChange={e => setForm(p => ({ ...p, start_time: e.target.value }))} style={S.input} />
                    </div>
                    <div style={S.field}>
                        <label style={S.label}>Reason for Reschedule</label>
                        <textarea value={form.reschedule_reason} required rows={3}
                            onChange={e => setForm(p => ({ ...p, reschedule_reason: e.target.value }))}
                            style={{ ...S.input, minHeight: '70px' }}
                            placeholder="e.g. Student requested, coach unavailable..." />
                    </div>
                    <div style={S.actions}>
                        <button type="submit" style={S.saveBtn} disabled={saving}>
                            {saving ? 'Saving...' : 'Reschedule'}
                        </button>
                        <button type="button" onClick={onClose} style={S.cancelBtn}>Cancel</button>
                    </div>
                </form>
            </div>
        </div>
    );
}

const S = {
    overlay: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1rem' },
    modal: { background: '#1a1a2e', borderRadius: '12px', padding: '28px', maxWidth: '480px', width: '100%', position: 'relative' },
    closeBtn: { position: 'absolute', top: '12px', right: '16px', background: 'none', border: 'none', color: '#fff', fontSize: '24px', cursor: 'pointer' },
    title: { fontSize: '18px', fontWeight: 600, marginBottom: '16px' },
    info: { display: 'flex', flexDirection: 'column', gap: '4px', marginBottom: '20px', padding: '12px', background: 'rgba(255,255,255,0.05)', borderRadius: '8px', fontSize: '13px', color: 'rgba(255,255,255,0.7)' },
    form: { display: 'flex', flexDirection: 'column', gap: '12px' },
    field: { display: 'flex', flexDirection: 'column', gap: '4px' },
    label: { fontSize: '12px', color: 'rgba(255,255,255,0.6)' },
    input: { padding: '8px 12px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.15)', background: 'rgba(255,255,255,0.05)', color: '#fff', fontSize: '13px', outline: 'none' },
    actions: { display: 'flex', gap: '12px', marginTop: '8px' },
    saveBtn: { padding: '10px 24px', borderRadius: '8px', border: 'none', background: '#8b5cf6', color: '#fff', cursor: 'pointer', fontWeight: 600 },
    cancelBtn: { padding: '10px 24px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.2)', background: 'transparent', color: '#fff', cursor: 'pointer' },
};
