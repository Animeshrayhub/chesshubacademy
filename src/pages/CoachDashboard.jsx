import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/useAuth';
import {
    getAssignedStudents, getCoachSessions, getCoachUpcomingSessions,
    getCoachHomework, getCoachStats, updateSessionLink,
    markSessionComplete, markSessionNoShow,
    createCoachHomework, reviewHomeworkByCoach,
} from '../api/coachDashboardApi';
import { supabase } from '../services/supabase';
import './CoachDashboard.css';

export default function CoachDashboard() {
    const { coachProfile, logout, isAdmin, isStudent } = useAuth();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('overview');
    const [students, setStudents] = useState([]);
    const [sessions, setSessions] = useState([]);
    const [upcomingSessions, setUpcomingSessions] = useState([]);
    const [homework, setHomework] = useState([]);
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    const loadData = async () => {
        if (!coachProfile?.id) return;
        try {
            const [st, sess, upSess, hw, statsData] = await Promise.allSettled([
                getAssignedStudents(coachProfile.id),
                getCoachSessions(coachProfile.id),
                getCoachUpcomingSessions(coachProfile.id),
                getCoachHomework(coachProfile.id),
                getCoachStats(coachProfile.id),
            ]);
            setStudents(st.status === 'fulfilled' ? st.value : []);
            setSessions(sess.status === 'fulfilled' ? sess.value : []);
            setUpcomingSessions(upSess.status === 'fulfilled' ? upSess.value : []);
            setHomework(hw.status === 'fulfilled' ? hw.value : []);
            setStats(statsData.status === 'fulfilled' ? statsData.value : null);
        } catch { /* defaults remain */ }
        setLoading(false);
    };

    useEffect(() => {
        if (isAdmin()) { navigate('/admin-dashboard', { replace: true }); return; }
        if (isStudent()) { navigate('/student-dashboard', { replace: true }); return; }
        if (coachProfile?.id) { void loadData(); }
    }, [coachProfile]); // eslint-disable-line react-hooks/exhaustive-deps

    // Realtime subscriptions
    useEffect(() => {
        if (!coachProfile?.id || !supabase) return;
        const channel = supabase
            .channel('coach-dashboard-realtime')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'sessions' }, () => loadData())
            .on('postgres_changes', { event: '*', schema: 'public', table: 'homework_assignments' }, () => loadData())
            .on('postgres_changes', { event: '*', schema: 'public', table: 'student_profiles' }, () => loadData())
            .subscribe();
        return () => { supabase.removeChannel(channel); };
    }, [coachProfile?.id]); // eslint-disable-line react-hooks/exhaustive-deps

    const pendingReviews = homework.filter(h => h.status === 'submitted');

    const tabs = [
        { id: 'overview', label: 'Overview', icon: '📊' },
        { id: 'students', label: 'My Students', icon: '👥' },
        { id: 'sessions', label: 'Sessions', icon: '📅', badge: upcomingSessions.length || null },
        { id: 'homework', label: 'Homework', icon: '📝', badge: pendingReviews.length || null },
        { id: 'schedule', label: 'Schedule', icon: '📆' },
    ];

    if (!coachProfile && !loading) {
        return (
            <div className="coach-dashboard">
                <div className="coach-loading">
                    <p>Coach profile not found. Please contact admin.</p>
                    <button className="coach-btn coach-btn-secondary" onClick={logout}>Logout</button>
                </div>
            </div>
        );
    }

    return (
        <div className="coach-dashboard">
            <header className="coach-header">
                <div className="coach-header-left">
                    <Link to="/" className="coach-header-logo">ChessHub</Link>
                    <div className="coach-header-info">
                        <h1>{coachProfile?.name || 'Coach'}</h1>
                        <p>{coachProfile?.specialization || 'Chess Coach'}</p>
                    </div>
                </div>
                <div className="coach-header-right">
                    <span className="coach-title-badge">{coachProfile?.title || 'Coach'}</span>
                    <button onClick={logout} className="coach-logout-btn">Logout</button>
                </div>
            </header>

            <div className="coach-layout">
                <nav className="coach-sidebar">
                    {tabs.map(tab => (
                        <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                            className={`coach-sidebar-item ${activeTab === tab.id ? 'active' : ''}`}>
                            <span className="sidebar-icon">{tab.icon}</span>
                            <span>{tab.label}</span>
                            {tab.badge > 0 && <span className="sidebar-badge">{tab.badge}</span>}
                        </button>
                    ))}
                </nav>

                <main className="coach-main">
                    {loading ? (
                        <div className="coach-loading">Loading dashboard...</div>
                    ) : activeTab === 'overview' ? (
                        <OverviewTab stats={stats} upcomingSessions={upcomingSessions} pendingReviews={pendingReviews} students={students} />
                    ) : activeTab === 'students' ? (
                        <StudentsTab students={students} />
                    ) : activeTab === 'sessions' ? (
                        <SessionsTab sessions={sessions} onRefresh={loadData} coachId={coachProfile?.id} />
                    ) : activeTab === 'homework' ? (
                        <HomeworkTab homework={homework} students={students} onRefresh={loadData} coachId={coachProfile?.id} />
                    ) : activeTab === 'schedule' ? (
                        <ScheduleTab sessions={sessions} coachProfile={coachProfile} />
                    ) : null}
                </main>
            </div>
        </div>
    );
}

/* ──────── OVERVIEW TAB ──────── */
function OverviewTab({ stats, upcomingSessions, pendingReviews, students: _students }) {
    const statCards = [
        { label: 'My Students', value: stats?.totalStudents || 0, icon: '👥', color: '#10b981' },
        { label: 'Upcoming Sessions', value: stats?.upcomingSessions || 0, icon: '📅', color: '#3b82f6' },
        { label: 'Pending Reviews', value: stats?.pendingReviews || 0, icon: '📝', color: '#f59e0b' },
        { label: 'Hours This Month', value: stats?.hoursThisMonth || 0, icon: '⏱️', color: '#8b5cf6' },
        { label: 'Completed (Month)', value: stats?.completedThisMonth || 0, icon: '✅', color: '#06b6d4' },
    ];

    return (
        <div>
            <h2 className="coach-tab-title">Dashboard Overview</h2>

            <div className="coach-stats-grid">
                {statCards.map(s => (
                    <div key={s.label} className="coach-stat-card" style={{ borderTopColor: s.color }}>
                        <span className="coach-stat-icon">{s.icon}</span>
                        <span className="coach-stat-value">{s.value}</span>
                        <span className="coach-stat-label">{s.label}</span>
                    </div>
                ))}
            </div>

            <div className="coach-section-grid">
                <div className="coach-section">
                    <h3 className="coach-section-title">📅 Upcoming Sessions</h3>
                    {upcomingSessions.length === 0 ? (
                        <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '14px' }}>No upcoming sessions</p>
                    ) : upcomingSessions.slice(0, 4).map(s => (
                        <div key={s.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                            <div>
                                <strong>{s.title || 'Chess Session'}</strong>
                                <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.45)', marginTop: '3px' }}>
                                    {s.student?.full_name || '—'} &middot; {new Date(s.date).toLocaleDateString()} at {s.start_time}
                                </div>
                            </div>
                            {s.meeting_link && (
                                <Link to={`/classroom/${s.id}`} className="coach-btn-join">Join</Link>
                            )}
                        </div>
                    ))}
                </div>

                <div className="coach-section">
                    <h3 className="coach-section-title">📝 Pending Reviews ({pendingReviews.length})</h3>
                    {pendingReviews.length === 0 ? (
                        <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '14px' }}>All homework reviewed!</p>
                    ) : pendingReviews.slice(0, 4).map(h => (
                        <div key={h.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                            <div>
                                <strong>{h.title}</strong>
                                <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.45)', marginTop: '3px' }}>
                                    {h.student?.full_name || '—'} &middot; Submitted {h.submitted_at ? new Date(h.submitted_at).toLocaleDateString() : ''}
                                </div>
                            </div>
                            <span style={{ padding: '4px 12px', borderRadius: '12px', background: 'rgba(59,130,246,0.15)', color: '#60a5fa', fontSize: '11px', fontWeight: 600 }}>
                                Needs Review
                            </span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

/* ──────── STUDENTS TAB ──────── */
function StudentsTab({ students }) {
    const [search, setSearch] = useState('');
    const filtered = students.filter(s =>
        s.full_name?.toLowerCase().includes(search.toLowerCase()) ||
        s.email?.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <h2 className="coach-tab-title" style={{ marginBottom: 0 }}>My Students ({students.length})</h2>
                <input value={search} onChange={e => setSearch(e.target.value)}
                    className="coach-form-input" style={{ maxWidth: '280px' }}
                    placeholder="Search students..." />
            </div>

            {filtered.length === 0 ? (
                <div className="coach-empty">
                    <div className="coach-empty-icon">👥</div>
                    <p className="coach-empty-text">No students assigned yet</p>
                </div>
            ) : (
                <div className="coach-student-list">
                    {filtered.map(s => (
                        <div key={s.id} className="coach-student-card">
                            <div className="coach-student-name">{s.full_name}</div>
                            <div className="coach-student-meta">
                                <span className="coach-student-tag level">{s.level || 'beginner'}</span>
                                {s.plan_type && <span className="coach-student-tag plan">{s.plan_type} sessions</span>}
                                <span className={`coach-student-tag status-${s.status || 'active'}`}>{s.status || 'active'}</span>
                            </div>
                            <div className="coach-student-sessions">
                                <span>Completed: <strong>{s.sessions_completed || 0}</strong></span>
                                <span>Remaining: <strong>{s.sessions_remaining || 0}</strong></span>
                                {s.email && <span>📧 {s.email}</span>}
                            </div>
                            {s.phone && (
                                <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)', marginTop: '8px' }}>
                                    📱 {s.phone}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

/* ──────── SESSIONS TAB ──────── */
function SessionsTab({ sessions, onRefresh, coachId: _coachId }) {
    const [filter, setFilter] = useState('upcoming');
    const [editingLink, setEditingLink] = useState(null);
    const [linkValue, setLinkValue] = useState('');
    const [completeNotes, setCompleteNotes] = useState('');
    const [completingId, setCompletingId] = useState(null);

    const today = new Date().toISOString().split('T')[0];
    const filtered = filter === 'upcoming'
        ? sessions.filter(s => s.date >= today && s.status === 'scheduled')
        : filter === 'completed'
        ? sessions.filter(s => s.status === 'completed')
        : filter === 'all' ? sessions
        : sessions.filter(s => s.status === filter);

    const handleSaveLink = async (sessionId) => {
        await updateSessionLink(sessionId, linkValue);
        setEditingLink(null);
        setLinkValue('');
        onRefresh();
    };

    const handleComplete = async (sessionId) => {
        await markSessionComplete(sessionId, completeNotes);
        setCompletingId(null);
        setCompleteNotes('');
        onRefresh();
    };

    const handleNoShow = async (sessionId) => {
        if (!window.confirm('Mark this session as No Show?')) return;
        await markSessionNoShow(sessionId);
        onRefresh();
    };

    return (
        <div>
            <h2 className="coach-tab-title">Sessions</h2>

            <div style={{ display: 'flex', gap: '8px', marginBottom: '24px', flexWrap: 'wrap' }}>
                {['upcoming', 'completed', 'no_show', 'all'].map(f => (
                    <button key={f} onClick={() => setFilter(f)}
                        className={`coach-btn ${filter === f ? 'coach-btn-primary' : 'coach-btn-secondary'}`}>
                        {f === 'upcoming' ? '📅 Upcoming' : f === 'completed' ? '✅ Completed' : f === 'no_show' ? '❌ No Show' : '📋 All'}
                    </button>
                ))}
            </div>

            {filtered.length === 0 ? (
                <div className="coach-empty">
                    <div className="coach-empty-icon">📅</div>
                    <p className="coach-empty-text">No sessions found</p>
                </div>
            ) : (
                <div className="coach-session-list">
                    {filtered.map(s => (
                        <div key={s.id} className="coach-session-card">
                            <div className="coach-session-date">
                                <span className="coach-session-day">{new Date(s.date).getDate()}</span>
                                <span className="coach-session-month">{new Date(s.date).toLocaleString('default', { month: 'short' })}</span>
                            </div>

                            <div className="coach-session-info">
                                <strong>{s.title || 'Chess Session'}</strong>
                                <div className="meta">
                                    {s.student?.full_name || '—'} &middot; {s.start_time} &middot; {s.duration}min
                                </div>
                                {s.notes && <div className="meta" style={{ marginTop: '4px' }}>💬 {s.notes}</div>}

                                {/* Meeting Link Editor */}
                                {editingLink === s.id ? (
                                    <div className="coach-link-input" style={{ marginTop: '8px' }}>
                                        <input value={linkValue} onChange={e => setLinkValue(e.target.value)}
                                            placeholder="https://meet.google.com/..." autoFocus />
                                        <button className="coach-btn coach-btn-primary" onClick={() => handleSaveLink(s.id)}>Save</button>
                                        <button className="coach-btn coach-btn-secondary" onClick={() => setEditingLink(null)}>Cancel</button>
                                    </div>
                                ) : s.meeting_link ? (
                                    <div style={{ marginTop: '6px', display: 'flex', gap: '8px', alignItems: 'center' }}>
                                        <Link to={`/classroom/${s.id}`} className="coach-btn-join">
                                            🔗 Open Classroom
                                        </Link>
                                        <a href={s.meeting_link} target="_blank" rel="noopener noreferrer" className="coach-btn coach-btn-secondary">
                                            ↗ Meeting
                                        </a>
                                        {s.status === 'scheduled' && (
                                            <button className="coach-btn coach-btn-secondary" onClick={() => { setEditingLink(s.id); setLinkValue(s.meeting_link); }}>Edit Link</button>
                                        )}
                                    </div>
                                ) : s.status === 'scheduled' ? (
                                    <button className="coach-btn coach-btn-info" style={{ marginTop: '6px' }}
                                        onClick={() => { setEditingLink(s.id); setLinkValue(''); }}>
                                        + Add Meeting Link
                                    </button>
                                ) : null}

                                {/* Complete Session Form */}
                                {completingId === s.id && (
                                    <div className="coach-review-form">
                                        <textarea value={completeNotes} onChange={e => setCompleteNotes(e.target.value)}
                                            placeholder="Session notes (optional)..." />
                                        <div style={{ display: 'flex', gap: '8px' }}>
                                            <button className="coach-btn coach-btn-primary" onClick={() => handleComplete(s.id)}>Confirm Complete</button>
                                            <button className="coach-btn coach-btn-secondary" onClick={() => setCompletingId(null)}>Cancel</button>
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="coach-session-actions">
                                {s.status === 'scheduled' && completingId !== s.id && (
                                    <>
                                        <button className="coach-btn coach-btn-primary" onClick={() => setCompletingId(s.id)}>✅ Complete</button>
                                        <button className="coach-btn coach-btn-warning" onClick={() => handleNoShow(s.id)}>No Show</button>
                                    </>
                                )}
                                <span style={{
                                    padding: '4px 12px', borderRadius: '12px', fontSize: '11px', fontWeight: 600, textTransform: 'capitalize',
                                    background: s.status === 'completed' ? 'rgba(16,185,129,0.15)' : s.status === 'scheduled' ? 'rgba(59,130,246,0.15)' : 'rgba(239,68,68,0.15)',
                                    color: s.status === 'completed' ? '#34d399' : s.status === 'scheduled' ? '#60a5fa' : '#f87171',
                                }}>
                                    {s.status}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

/* ──────── HOMEWORK TAB ──────── */
function HomeworkTab({ homework, students, onRefresh, coachId }) {
    const [showForm, setShowForm] = useState(false);
    const [reviewingId, setReviewingId] = useState(null);
    const [reviewFeedback, setReviewFeedback] = useState('');
    const [reviewGrade, setReviewGrade] = useState('');
    const [form, setForm] = useState({ student_id: '', title: '', description: '', due_date: '' });

    const handleCreate = async (e) => {
        e.preventDefault();
        await createCoachHomework({
            coach_id: coachId,
            student_id: form.student_id,
            title: form.title,
            description: form.description || null,
            due_date: form.due_date || null,
            status: 'pending',
            assigned_at: new Date().toISOString(),
        });
        setShowForm(false);
        setForm({ student_id: '', title: '', description: '', due_date: '' });
        onRefresh();
    };

    const handleReview = async (hwId) => {
        await reviewHomeworkByCoach(hwId, reviewFeedback, reviewGrade);
        setReviewingId(null);
        setReviewFeedback('');
        setReviewGrade('');
        onRefresh();
    };

    const getStatusColor = (status) => {
        const colors = { pending: '#f59e0b', submitted: '#3b82f6', reviewed: '#10b981', late: '#ef4444' };
        return colors[status] || '#6b7280';
    };

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <h2 className="coach-tab-title" style={{ marginBottom: 0 }}>Homework</h2>
                <button className="coach-btn coach-btn-primary" onClick={() => setShowForm(true)}>+ Assign Homework</button>
            </div>

            {/* Create Homework Form */}
            {showForm && (
                <div className="coach-form-overlay" onClick={() => setShowForm(false)}>
                    <form onSubmit={handleCreate} className="coach-form-card" onClick={e => e.stopPropagation()}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
                            <h3 style={{ margin: 0 }}>Assign Homework</h3>
                            <button type="button" onClick={() => setShowForm(false)} className="coach-btn coach-btn-secondary">×</button>
                        </div>
                        <div className="coach-form-grid">
                            <div className="coach-form-field">
                                <label className="coach-form-label">Student *</label>
                                <select required value={form.student_id} onChange={e => setForm(p => ({ ...p, student_id: e.target.value }))} className="coach-form-input">
                                    <option value="">Select student</option>
                                    {students.map(s => (
                                        <option key={s.id} value={s.id}>{s.full_name}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="coach-form-field">
                                <label className="coach-form-label">Due Date</label>
                                <input type="date" value={form.due_date} onChange={e => setForm(p => ({ ...p, due_date: e.target.value }))} className="coach-form-input" />
                            </div>
                            <div className="coach-form-field full-width">
                                <label className="coach-form-label">Title *</label>
                                <input required value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} className="coach-form-input" placeholder="Homework title" />
                            </div>
                            <div className="coach-form-field full-width">
                                <label className="coach-form-label">Description</label>
                                <textarea value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
                                    className="coach-form-input" style={{ minHeight: '80px', resize: 'vertical' }} placeholder="Instructions for the student..." />
                            </div>
                        </div>
                        <button type="submit" className="coach-btn coach-btn-primary" style={{ width: '100%', padding: '12px' }}>Assign Homework</button>
                    </form>
                </div>
            )}

            {homework.length === 0 ? (
                <div className="coach-empty">
                    <div className="coach-empty-icon">📝</div>
                    <p className="coach-empty-text">No homework assigned yet</p>
                </div>
            ) : homework.map(h => (
                <div key={h.id} className="coach-hw-card">
                    <div className="coach-hw-header">
                        <div>
                            <strong style={{ fontSize: '15px' }}>{h.title}</strong>
                            <div style={{ fontSize: '13px', color: 'rgba(255,255,255,0.5)', marginTop: '2px' }}>{h.student?.full_name || '—'}</div>
                        </div>
                        <span className="coach-hw-status" style={{ background: getStatusColor(h.status) }}>
                            {h.status}
                        </span>
                    </div>

                    {h.description && <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.6)', margin: '8px 0 0' }}>{h.description}</p>}

                    <div className="coach-hw-meta">
                        {h.due_date && <span>Due: {new Date(h.due_date).toLocaleDateString()}</span>}
                        {h.assigned_at && <span>Assigned: {new Date(h.assigned_at).toLocaleDateString()}</span>}
                        {h.grade && <span>Grade: {h.grade}</span>}
                    </div>

                    {/* Student submission */}
                    {h.submission_text && (
                        <div className="coach-hw-submission">
                            <strong>Student Submission:</strong> {h.submission_text}
                        </div>
                    )}

                    {h.submission_url && (
                        <div style={{ marginTop: '8px' }}>
                            <a href={h.submission_url} target="_blank" rel="noopener noreferrer" className="coach-btn coach-btn-info">📎 View Attachment</a>
                        </div>
                    )}

                    {/* Coach feedback display */}
                    {h.coach_feedback && (
                        <div style={{ marginTop: '12px', padding: '12px', borderRadius: '8px', background: 'rgba(16,185,129,0.08)', fontSize: '13px', color: 'rgba(255,255,255,0.7)' }}>
                            <strong>Your Feedback:</strong> {h.coach_feedback}
                        </div>
                    )}

                    {/* Review button for submitted homework */}
                    {h.status === 'submitted' && reviewingId !== h.id && (
                        <button className="coach-btn coach-btn-primary" style={{ marginTop: '12px' }}
                            onClick={() => setReviewingId(h.id)}>
                            📋 Review & Grade
                        </button>
                    )}

                    {/* Review form */}
                    {reviewingId === h.id && (
                        <div className="coach-review-form">
                            <label className="coach-form-label" style={{ marginBottom: '8px', display: 'block' }}>Your Feedback</label>
                            <textarea value={reviewFeedback} onChange={e => setReviewFeedback(e.target.value)} placeholder="Write feedback for the student..." />
                            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                <select value={reviewGrade} onChange={e => setReviewGrade(e.target.value)}>
                                    <option value="">Select Grade</option>
                                    <option value="A+">A+</option>
                                    <option value="A">A</option>
                                    <option value="B+">B+</option>
                                    <option value="B">B</option>
                                    <option value="C">C</option>
                                    <option value="D">D</option>
                                </select>
                                <button className="coach-btn coach-btn-primary" onClick={() => handleReview(h.id)}>Submit Review</button>
                                <button className="coach-btn coach-btn-secondary" onClick={() => setReviewingId(null)}>Cancel</button>
                            </div>
                        </div>
                    )}
                </div>
            ))}
        </div>
    );
}

/* ──────── SCHEDULE TAB ──────── */
function ScheduleTab({ sessions, coachProfile }) {
    const completedSessions = sessions.filter(s => s.status === 'completed');
    const scheduledSessions = sessions.filter(s => s.status === 'scheduled');

    // Group sessions by month
    const groupByMonth = (arr) => {
        const groups = {};
        arr.forEach(s => {
            const key = new Date(s.date).toLocaleString('default', { month: 'long', year: 'numeric' });
            if (!groups[key]) groups[key] = [];
            groups[key].push(s);
        });
        return groups;
    };

    const scheduledByMonth = groupByMonth(scheduledSessions);
    const completedByMonth = groupByMonth(completedSessions);

    // Calculate earnings (completed sessions × hourly rate)
    const hourlyRate = parseFloat(String(coachProfile?.hourly_rate || '0').replace(/[^\d.]/g, '')) || 0;
    const totalHoursCompleted = completedSessions.reduce((sum, s) => sum + (s.duration || 60) / 60, 0);
    const totalEarnings = Math.round(totalHoursCompleted * hourlyRate);

    // This month's stats
    const monthStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
    const thisMonthCompleted = completedSessions.filter(s => new Date(s.date) >= monthStart);
    const thisMonthHours = thisMonthCompleted.reduce((sum, s) => sum + (s.duration || 60) / 60, 0);
    const thisMonthEarnings = Math.round(thisMonthHours * hourlyRate);

    return (
        <div>
            <h2 className="coach-tab-title">Schedule & Earnings</h2>

            {/* Earnings Summary */}
            <div className="coach-stats-grid" style={{ marginBottom: '32px' }}>
                <div className="coach-stat-card" style={{ borderTopColor: '#10b981' }}>
                    <span className="coach-stat-icon">💰</span>
                    <span className="coach-stat-value">₹{thisMonthEarnings.toLocaleString('en-IN')}</span>
                    <span className="coach-stat-label">This Month</span>
                </div>
                <div className="coach-stat-card" style={{ borderTopColor: '#3b82f6' }}>
                    <span className="coach-stat-icon">⏱️</span>
                    <span className="coach-stat-value">{Math.round(thisMonthHours * 10) / 10}h</span>
                    <span className="coach-stat-label">Hours This Month</span>
                </div>
                <div className="coach-stat-card" style={{ borderTopColor: '#8b5cf6' }}>
                    <span className="coach-stat-icon">📊</span>
                    <span className="coach-stat-value">₹{totalEarnings.toLocaleString('en-IN')}</span>
                    <span className="coach-stat-label">Total Earnings</span>
                </div>
                <div className="coach-stat-card" style={{ borderTopColor: '#f59e0b' }}>
                    <span className="coach-stat-icon">📅</span>
                    <span className="coach-stat-value">{scheduledSessions.length}</span>
                    <span className="coach-stat-label">Upcoming</span>
                </div>
            </div>

            {/* Upcoming Schedule */}
            <div className="coach-section">
                <h3 className="coach-section-title">📅 Upcoming Schedule</h3>
                {Object.keys(scheduledByMonth).length === 0 ? (
                    <p style={{ color: 'rgba(255,255,255,0.4)' }}>No upcoming sessions</p>
                ) : Object.entries(scheduledByMonth).map(([month, items]) => (
                    <div key={month} style={{ marginBottom: '20px' }}>
                        <h4 style={{ fontSize: '14px', color: '#10b981', marginBottom: '12px', fontWeight: 600 }}>{month}</h4>
                        {items.map(s => (
                            <div key={s.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid rgba(255,255,255,0.05)', fontSize: '14px' }}>
                                <div>
                                    <span style={{ color: 'rgba(255,255,255,0.9)' }}>{new Date(s.date).toLocaleDateString()} at {s.start_time}</span>
                                    <span style={{ color: 'rgba(255,255,255,0.4)', marginLeft: '12px' }}>{s.student?.full_name || '—'}</span>
                                </div>
                                <span style={{ color: 'rgba(255,255,255,0.5)' }}>{s.duration}min</span>
                            </div>
                        ))}
                    </div>
                ))}
            </div>

            {/* Completed History */}
            <div className="coach-section">
                <h3 className="coach-section-title">✅ Completed Sessions ({completedSessions.length})</h3>
                {Object.keys(completedByMonth).length === 0 ? (
                    <p style={{ color: 'rgba(255,255,255,0.4)' }}>No completed sessions yet</p>
                ) : Object.entries(completedByMonth).map(([month, items]) => (
                    <div key={month} style={{ marginBottom: '20px' }}>
                        <h4 style={{ fontSize: '14px', color: '#10b981', marginBottom: '12px', fontWeight: 600 }}>
                            {month} — {items.length} sessions ({Math.round(items.reduce((s, i) => s + (i.duration || 60) / 60, 0) * 10) / 10}h)
                        </h4>
                        {items.slice(0, 10).map(s => (
                            <div key={s.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid rgba(255,255,255,0.04)', fontSize: '13px', color: 'rgba(255,255,255,0.6)' }}>
                                <span>{new Date(s.date).toLocaleDateString()} — {s.student?.full_name || '—'}</span>
                                <span>{s.duration}min</span>
                            </div>
                        ))}
                    </div>
                ))}
            </div>
        </div>
    );
}
