import { useState, useEffect } from 'react';
import { getAllStudents, createStudentProfile, deleteStudent, updateStudentProfile } from '../../api/studentApi';
import { createStudentAuth } from '../../api/adminApi';
import { getFeePlans } from '../../api/settingsApi';
import { getCoaches } from '../../api/coachApi';
import { setUserStatus, resetUserPassword } from '../../api/userApi';

export default function AdminStudents() {
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [showForm, setShowForm] = useState(false);
    const [showCredentials, setShowCredentials] = useState(false);
    const [credentialsData, setCredentialsData] = useState(null);
    const [feePlans, setFeePlans] = useState([]);
    const [coaches, setCoaches] = useState([]);
    const [showBonusModal, setShowBonusModal] = useState(false);
    const [bonusStudentId, setBonusStudentId] = useState(null);
    const [bonusText, setBonusText] = useState('');
    const [form, setForm] = useState({
        name: '', email: '', password: '', phone: '', level: 'beginner',
        parent_name: '', parent_email: '', age: '', plan_type: '', assigned_coach_id: '',
    });

    const loadData = async () => {
        try {
            const [studentData, planData, coachData] = await Promise.all([
                getAllStudents(),
                getFeePlans(),
                getCoaches(),
            ]);
            setStudents(studentData || []);
            setFeePlans(planData || []);
            setCoaches(coachData || []);
        } catch (err) {
            console.error('Error loading data:', err);
        }
        setLoading(false);
    };

    useEffect(() => { loadData(); }, []);

    const handleCreate = async (e) => {
        e.preventDefault();
        try {
            // Step 1: Create auth user
            const authResult = await createStudentAuth(form.email, form.password, form.name);
            if (!authResult.success) {
                alert('Error creating auth user: ' + (authResult.error?.message || 'Unknown error'));
                return;
            }

            const plan = feePlans.find(p => p.sessions === parseInt(form.plan_type, 10));
            const sessionCount = form.plan_type ? parseInt(form.plan_type, 10) : 0;
            const planPrice = plan ? plan.price : null;

            // Step 2: Create student profile with user_id from auth
            const profileResult = await createStudentProfile({
                user_id: authResult.user_id,
                name: form.name,
                email: form.email,
                phone: form.phone,
                level: form.level || 'beginner',
                parent_name: form.parent_name,
                parent_email: form.parent_email,
                age: form.age ? parseInt(form.age, 10) : null,
                plan_type: form.plan_type || null,
                plan_price: planPrice,
                sessions_remaining: sessionCount,
                assigned_coach_id: form.assigned_coach_id ? parseInt(form.assigned_coach_id, 10) : null,
            });

            if (!profileResult.success) {
                alert('Error creating student profile: ' + profileResult.error);
                return;
            }

            // Show credentials confirmation
            setCredentialsData({
                email: form.email,
                password: form.password,
                name: form.name,
                account_id: authResult.account_id || null,
            });
            setShowCredentials(true);
            setShowForm(false);
            setForm({ name: '', email: '', password: '', phone: '', level: 'beginner', parent_name: '', parent_email: '', age: '', plan_type: '', assigned_coach_id: '' });
            
            // Reload after a delay
            setTimeout(() => loadData(), 500);
        } catch (err) {
            alert('Unexpected error: ' + err.message);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Delete this student?')) return;
        await deleteStudent(id);
        loadData();
    };

    const handleGiveBonus = async () => {
        if (!bonusText.trim()) {
            alert('Please enter a bonus description');
            return;
        }
        const student = students.find(s => s.id === bonusStudentId);
        if (!student) return;
        
        await updateStudentProfile(bonusStudentId, {
            bonus_notes: bonusText.trim(),
        });
        setShowBonusModal(false);
        setBonusStudentId(null);
        setBonusText('');
        loadData();
    };

    const handleToggleStatus = async (studentId, currentStatus) => {
        const student = students.find((s) => s.id === studentId);
        const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
        await updateStudentProfile(studentId, { status: newStatus });
        if (student?.user_id) {
            await setUserStatus(student.user_id, newStatus);
        }
        loadData();
    };

    const handleResetPassword = async (student) => {
        if (!student?.user_id) {
            alert('No login account linked for this student.');
            return;
        }
        const newPassword = window.prompt(`Set new password for ${student.full_name} (min 6 chars):`);
        if (!newPassword) return;
        const result = await resetUserPassword(student.user_id, newPassword);
        if (!result.success) {
            alert('Password reset failed: ' + result.error);
            return;
        }
        alert('Password reset successfully.');
    };

    const handleCompleteClass = async (studentId) => {
        const student = students.find(s => s.id === studentId);
        if (!student) return;
        const newCompleted = (student.sessions_completed || 0) + 1;
        const newRemaining = Math.max(0, (student.sessions_remaining || 0) - 1);
        const newStatus = newRemaining === 0 ? 'completed' : student.status;
        
        await updateStudentProfile(studentId, {
            sessions_completed: newCompleted,
            sessions_remaining: newRemaining,
            status: newStatus,
        });
        loadData();
    };

    const filtered = students.filter(s =>
        s.full_name?.toLowerCase().includes(search.toLowerCase()) ||
        s.email?.toLowerCase().includes(search.toLowerCase())
    );

    if (loading) return <div style={S.loading}>Loading students...</div>;

    return (
        <div>
            <div style={S.topBar}>
                <h2 style={S.title}>Students ({students.length})</h2>
                <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                    <input value={search} onChange={e => setSearch(e.target.value)}
                        style={S.search} placeholder="Search by name or email..." />
                    <button onClick={() => setShowForm(true)} style={S.addBtn}>+ Create Student</button>
                </div>
            </div>

            {/* CREATE STUDENT MODAL */}
            {showForm && (
                <div style={S.formOverlay}>
                    <form onSubmit={handleCreate} style={S.formCard}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
                            <h3 style={{ margin: 0 }}>Create Student</h3>
                            <button type="button" onClick={() => setShowForm(false)} style={S.closeBtn}>×</button>
                        </div>
                        <div style={S.formGrid}>
                            <div style={S.field}>
                                <label style={S.formLabel}>Full Name *</label>
                                <input required value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                                    style={S.formInput} placeholder="Student name" />
                            </div>
                            <div style={S.field}>
                                <label style={S.formLabel}>Email *</label>
                                <input required type="email" value={form.email}
                                    onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
                                    style={S.formInput} placeholder="student@email.com" />
                            </div>
                            <div style={S.field}>
                                <label style={S.formLabel}>Password * (min 6 chars)</label>
                                <input required type="password" value={form.password} minLength="6"
                                    onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
                                    style={S.formInput} placeholder="Secure password" />
                            </div>
                            <div style={S.field}>
                                <label style={S.formLabel}>Phone</label>
                                <input value={form.phone} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))}
                                    style={S.formInput} placeholder="+91 XXXXX XXXXX" />
                            </div>
                            <div style={S.field}>
                                <label style={S.formLabel}>Level</label>
                                <select value={form.level} onChange={e => setForm(p => ({ ...p, level: e.target.value }))}
                                    style={S.formInput}>
                                    <option value="beginner">Beginner</option>
                                    <option value="intermediate">Intermediate</option>
                                    <option value="advanced">Advanced</option>
                                    <option value="master">Master</option>
                                </select>
                            </div>
                            <div style={S.field}>
                                <label style={S.formLabel}>Plan</label>
                                <select value={form.plan_type} onChange={e => setForm(p => ({ ...p, plan_type: e.target.value }))}
                                    style={S.formInput}>
                                    <option value="">No Plan</option>
                                    {feePlans.length > 0 && feePlans.map(plan => (
                                        <option key={plan.sessions} value={plan.sessions}>
                                            {plan.sessions} Sessions - ₹{plan.price}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div style={S.field}>
                                <label style={S.formLabel}>Age</label>
                                <input type="number" value={form.age}
                                    onChange={e => setForm(p => ({ ...p, age: e.target.value }))}
                                    style={S.formInput} placeholder="Age" min="4" max="99" />
                            </div>
                            <div style={S.field}>
                                <label style={S.formLabel}>Parent Name</label>
                                <input value={form.parent_name}
                                    onChange={e => setForm(p => ({ ...p, parent_name: e.target.value }))}
                                    style={S.formInput} placeholder="Parent's name" />
                            </div>
                            <div style={S.field}>
                                <label style={S.formLabel}>Parent Email</label>
                                <input type="email" value={form.parent_email}
                                    onChange={e => setForm(p => ({ ...p, parent_email: e.target.value }))}
                                    style={S.formInput} placeholder="parent@email.com" />
                            </div>
                            <div style={S.field}>
                                <label style={S.formLabel}>Assign Coach</label>
                                <select value={form.assigned_coach_id}
                                    onChange={e => setForm(p => ({ ...p, assigned_coach_id: e.target.value }))}
                                    style={S.formInput}>
                                    <option value="">No Coach Assigned</option>
                                    {coaches.map(c => (
                                        <option key={c.id} value={c.id}>{c.name} ({c.title})</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                        <button type="submit" style={S.submitBtn}>Create Student</button>
                    </form>
                </div>
            )}

            {/* CREDENTIALS CONFIRMATION MODAL */}
            {showCredentials && credentialsData && (
                <div style={S.formOverlay}>
                    <div style={S.formCard}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
                            <h3 style={{ margin: 0 }}>✅ Student Created Successfully</h3>
                            <button type="button" onClick={() => { setShowCredentials(false); setCredentialsData(null); }} style={S.closeBtn}>×</button>
                        </div>
                        <p style={{ color: 'rgba(255,255,255,0.8)', marginBottom: '16px' }}>Save these credentials and share with the student:</p>
                        <div style={{ background: 'rgba(0,0,0,0.3)', borderRadius: '8px', padding: '16px', marginBottom: '16px' }}>
                            <p style={{ margin: '0 0 8px 0', fontSize: '12px', color: 'rgba(255,255,255,0.6)' }}>Email:</p>
                            <p style={{ margin: '0 0 16px 0', fontSize: '14px', fontFamily: 'monospace', fontWeight: 600, wordBreak: 'break-all' }}>{credentialsData.email}</p>
                            <p style={{ margin: '0 0 8px 0', fontSize: '12px', color: 'rgba(255,255,255,0.6)' }}>Password:</p>
                            <p style={{ margin: '0 0 16px 0', fontSize: '14px', fontFamily: 'monospace', fontWeight: 600 }}>{credentialsData.password}</p>
                            <p style={{ margin: '0 0 8px 0', fontSize: '12px', color: 'rgba(255,255,255,0.6)' }}>Student Name:</p>
                            <p style={{ margin: '0', fontSize: '14px', fontWeight: 600 }}>{credentialsData.name}</p>
                            {credentialsData.account_id && (
                                <>
                                    <p style={{ margin: '16px 0 8px 0', fontSize: '12px', color: 'rgba(255,255,255,0.6)' }}>Account ID:</p>
                                    <p style={{ margin: '0', fontSize: '14px', fontFamily: 'monospace', fontWeight: 600 }}>{credentialsData.account_id}</p>
                                </>
                            )}
                        </div>
                        <button onClick={() => { setShowCredentials(false); setCredentialsData(null); }} style={S.submitBtn}>Done</button>
                    </div>
                </div>
            )}

            {/* GIVE BONUS MODAL */}
            {showBonusModal && (
                <div style={S.formOverlay}>
                    <div style={S.formCard}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
                            <h3 style={{ margin: 0 }}>Give Bonus</h3>
                            <button type="button" onClick={() => { setShowBonusModal(false); setBonusText(''); setBonusStudentId(null); }} style={S.closeBtn}>×</button>
                        </div>
                        <div style={S.field}>
                            <label style={S.formLabel}>Bonus Description</label>
                            <textarea value={bonusText} onChange={e => setBonusText(e.target.value)}
                                style={{ ...S.formInput, minHeight: '100px', fontFamily: 'inherit' }}
                                placeholder="e.g., Free coaching class, 20% discount on next plan, Free tournament entry..." />
                        </div>
                        <button onClick={handleGiveBonus} style={S.submitBtn}>Save Bonus</button>
                    </div>
                </div>
            )}

            <div style={S.stats}>
                <div style={S.statCard}>
                    <span style={S.statValue}>{students.length}</span>
                    <span style={S.statLabel}>Total Students</span>
                </div>
                <div style={S.statCard}>
                    <span style={S.statValue}>{students.filter(s => s.status === 'active').length}</span>
                    <span style={S.statLabel}>Active</span>
                </div>
                <div style={S.statCard}>
                    <span style={S.statValue}>{students.filter(s => s.plan_type).length}</span>
                    <span style={S.statLabel}>With Plans</span>
                </div>
                <div style={S.statCard}>
                    <span style={S.statValue}>{students.filter(s => s.status === 'completed').length}</span>
                    <span style={S.statLabel}>Completed</span>
                </div>
            </div>

            <div style={S.table}>
                <div style={S.tableHeader}>
                    <span style={{ flex: 1.5 }}>Name</span>
                    <span style={{ flex: 1.5 }}>Email</span>
                    <span style={{ flex: 1 }}>Level</span>
                    <span style={{ flex: 1 }}>Plan</span>
                    <span style={{ flex: 0.8 }}>Done</span>
                    <span style={{ flex: 0.8 }}>Left</span>
                    <span style={{ flex: 1 }}>Status</span>
                    <span style={{ flex: 1 }}>Bonus</span>
                    <span style={{ flex: 2 }}>Actions</span>
                </div>
                {filtered.length === 0 ? (
                    <p style={S.empty}>No students found.</p>
                ) : filtered.map(s => (
                    <div key={s.id} style={S.tableRow}>
                        <span style={{ flex: 1.5, fontWeight: 600 }}>{s.full_name}</span>
                        <span style={{ flex: 1.5, fontSize: '12px' }}>{s.email}</span>
                        <span style={{ flex: 1 }}>
                            <span style={{ ...S.levelBadge, background: levelColor(s.level) }}>{s.level}</span>
                        </span>
                        <span style={{ flex: 1, fontSize: '12px' }}>{s.plan_type ? `${s.plan_type} Sessions` : '—'}</span>
                        <span style={{ flex: 0.8, textAlign: 'center' }}>{s.sessions_completed || 0}</span>
                        <span style={{ flex: 0.8, textAlign: 'center' }}>{s.sessions_remaining || 0}</span>
                        <span style={{ flex: 1 }}>
                            <span style={{ ...S.statusBadge, background: s.status === 'active' ? '#10b981' : s.status === 'completed' ? '#8b5cf6' : '#6b7280' }}>
                                {s.status}
                            </span>
                        </span>
                        <span style={{ flex: 1, fontSize: '11px', color: s.bonus_notes ? '#fbbf24' : 'rgba(255,255,255,0.4)' }}>
                            {s.bonus_notes ? '✓ ' + s.bonus_notes.substring(0, 15) + '...' : '—'}
                        </span>
                        <span style={{ flex: 2, display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                            {s.sessions_remaining > 0 && (
                                <button onClick={() => handleCompleteClass(s.id)} style={S.actionBtn} title="Mark class completed">✓</button>
                            )}
                            <button onClick={() => {
                                setBonusStudentId(s.id);
                                setBonusText(s.bonus_notes || '');
                                setShowBonusModal(true);
                            }} style={S.actionBtn} title="Give bonus">🎁</button>
                            <button onClick={() => handleToggleStatus(s.id, s.status)} style={{ ...S.actionBtn, background: s.status === 'active' ? '#ef4444' : '#10b981' }} title={`Toggle ${s.status}`}>
                                {s.status === 'active' ? '⊗' : '⊕'}
                            </button>
                            <button onClick={() => handleResetPassword(s)} style={{ ...S.actionBtn, background: '#8b5cf6' }} title="Reset password">🔐</button>
                            <button onClick={() => handleDelete(s.id)} style={S.actionBtn} title="Delete">🗑️</button>
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
}

function levelColor(l) {
    return { beginner: '#10b981', intermediate: '#3b82f6', advanced: '#f59e0b', master: '#8b5cf6' }[l] || '#6b7280';
}

const S = {
    loading: { textAlign: 'center', padding: '40px', color: 'rgba(255,255,255,0.5)' },
    topBar: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' },
    title: { fontSize: '22px', fontWeight: 600 },
    search: { padding: '8px 16px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.15)', background: 'rgba(255,255,255,0.05)', color: '#fff', fontSize: '13px', outline: 'none', width: '280px' },
    addBtn: { padding: '8px 20px', borderRadius: '8px', border: 'none', background: 'linear-gradient(135deg, #8b5cf6, #3b82f6)', color: '#fff', cursor: 'pointer', fontWeight: 600, fontSize: '13px' },
    stats: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '24px' },
    statCard: { background: 'rgba(255,255,255,0.05)', borderRadius: '12px', padding: '20px', textAlign: 'center' },
    statValue: { display: 'block', fontSize: '28px', fontWeight: 700 },
    statLabel: { fontSize: '12px', color: 'rgba(255,255,255,0.5)' },
    table: { background: 'rgba(255,255,255,0.03)', borderRadius: '12px', overflow: 'hidden' },
    tableHeader: { display: 'flex', padding: '12px 16px', background: 'rgba(255,255,255,0.05)', fontSize: '11px', color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', fontWeight: 600 },
    tableRow: { display: 'flex', padding: '14px 16px', borderBottom: '1px solid rgba(255,255,255,0.05)', alignItems: 'center', fontSize: '13px', gap: '8px' },
    levelBadge: { padding: '3px 10px', borderRadius: '12px', color: '#fff', fontSize: '11px', fontWeight: 600, textTransform: 'capitalize' },
    statusBadge: { padding: '3px 10px', borderRadius: '12px', color: '#fff', fontSize: '11px', fontWeight: 600, textTransform: 'capitalize' },
    empty: { textAlign: 'center', padding: '24px', color: 'rgba(255,255,255,0.4)' },
    actionBtn: { padding: '6px 10px', borderRadius: '6px', border: 'none', background: '#3b82f6', color: '#fff', cursor: 'pointer', fontSize: '12px', fontWeight: 600 },
    deleteBtn: { background: 'none', border: 'none', cursor: 'pointer', fontSize: '16px', padding: '4px' },
    formOverlay: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 },
    formCard: { background: '#1a1a3e', borderRadius: '16px', padding: '32px', width: '90%', maxWidth: '600px', maxHeight: '90vh', overflowY: 'auto', border: '1px solid rgba(255,255,255,0.1)' },
    formGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' },
    field: { display: 'flex', flexDirection: 'column', gap: '4px' },
    formLabel: { fontSize: '12px', color: 'rgba(255,255,255,0.6)', fontWeight: 600 },
    formInput: { padding: '10px 14px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.15)', background: 'rgba(255,255,255,0.05)', color: '#fff', fontSize: '13px', outline: 'none' },
    closeBtn: { background: 'none', border: 'none', color: '#fff', fontSize: '24px', cursor: 'pointer' },
    submitBtn: { width: '100%', marginTop: '20px', padding: '12px', borderRadius: '8px', border: 'none', background: 'linear-gradient(135deg, #8b5cf6, #3b82f6)', color: '#fff', cursor: 'pointer', fontWeight: 600, fontSize: '14px' },
};
