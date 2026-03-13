import { useState, useEffect, lazy, Suspense } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/useAuth';
import { getStudentCourses, getStudentProgress, getHomework } from '../api/studentApi';
import { getSessions } from '../api/sessionApi';
import { getPuzzleHistory } from '../api/trainingApi';
import { getStudentActivity } from '../api/studentActivityApi';
import { getOrCreateReferralCode } from '../api/referralCodeApi';
import { supabase } from '../services/supabase';
import ShareAchievement from '../components/ShareAchievement';
import './StudentDashboard.css';

const ChessBoard = lazy(() => import('../components/ChessBoard/ChessBoard'));
const DailyPuzzle = lazy(() => import('../components/Puzzles/DailyPuzzle'));
const PuzzleLeaderboard = lazy(() => import('../components/Puzzles/PuzzleLeaderboard'));
const PuzzleStreakTracker = lazy(() => import('../components/Puzzles/PuzzleStreakTracker'));
const GameAnalysis = lazy(() => import('../components/Analysis/GameAnalysis'));
const OpeningDisplay = lazy(() => import('../components/Opening/OpeningDisplay'));

export default function StudentDashboard() {
    const { profile, logout, isAdmin, isCoach } = useAuth();
    const navigate = useNavigate();
    const [courses, setCourses] = useState([]);
    const [sessions, setSessions] = useState([]);
    const [homework, setHomework] = useState([]);
    const [puzzleStats, setPuzzleStats] = useState({ total: 0, solved: 0 });
    const [ratingHistory, setRatingHistory] = useState([]);
    const [streak, setStreak] = useState(0);
    const [activity, setActivity] = useState(null);
    const [referralCode, setReferralCode] = useState('');
    const [assignedCoach, setAssignedCoach] = useState(null);
    const [activeTab, setActiveTab] = useState('overview');
    const [loading, setLoading] = useState(true);

    const loadData = async () => {
        try {
            const [c, s, h, p, r, act, ref] = await Promise.allSettled([
                getStudentCourses(profile.id),
                getSessions(profile.id),
                getHomework(profile.id),
                getPuzzleHistory(profile.id),
                getStudentProgress(profile.id, 'rating'),
                getStudentActivity(profile.id),
                getOrCreateReferralCode(profile.id),
            ]);
            setCourses(c.status === 'fulfilled' ? c.value : []);
            setSessions(s.status === 'fulfilled' ? s.value : []);
            setHomework(h.status === 'fulfilled' ? h.value : []);

            const puzzles = p.status === 'fulfilled' ? p.value : [];
            setPuzzleStats({ total: puzzles.length, solved: puzzles.filter(x => x.solved).length });

            const ratings = r.status === 'fulfilled' ? r.value : [];
            setRatingHistory(ratings);

            if (act.status === 'fulfilled' && act.value) setActivity(act.value);
            if (ref.status === 'fulfilled' && ref.value) setReferralCode(ref.value.code || '');

            // Calculate streak
            const today = new Date();
            let s2 = 0;
            for (let i = puzzles.length - 1; i >= 0; i--) {
                const d = new Date(puzzles[i].attempted_at);
                const diff = Math.floor((today - d) / 86400000);
                if (diff <= s2 + 1) s2++;
                else break;
            }
            setStreak(s2);

            // Fetch assigned coach info
            if (profile.assigned_coach_id && supabase) {
                const { data: coach } = await supabase
                    .from('coaches')
                    .select('name, title, specialization')
                    .eq('id', profile.assigned_coach_id)
                    .single();
                if (coach) setAssignedCoach(coach);
            }
        } catch {
            // Data will remain as defaults
        }
        setLoading(false);
    };

    useEffect(() => {
        if (isAdmin()) { navigate('/admin-dashboard', { replace: true }); return; }
        if (isCoach()) { navigate('/coach-dashboard', { replace: true }); return; }
        if (profile?.id) loadData();
    }, [profile]); // eslint-disable-line react-hooks/exhaustive-deps

    useEffect(() => {
        if (!profile?.id || !supabase) return;

        const channel = supabase
            .channel('student-dashboard-realtime')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'sessions' }, () => loadData())
            .on('postgres_changes', { event: '*', schema: 'public', table: 'homework_assignments' }, () => loadData())
            .on('postgres_changes', { event: '*', schema: 'public', table: 'progress_reports' }, () => loadData())
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [profile?.id]); // eslint-disable-line react-hooks/exhaustive-deps

    const pendingHomework = homework.filter(h => h.status === 'pending');
    const today = new Date().toISOString().split('T')[0];
    const upcomingSessions = sessions.filter((s) => s.date >= today && s.status === 'scheduled');
    const pastSessions = sessions.filter((s) => s.status === 'completed' || s.date < today);
    const latestRating = ratingHistory.length > 0
        ? ratingHistory[ratingHistory.length - 1].metric_value
        : profile?.chess_rating || 0;

    const tabs = [
        { id: 'overview', label: 'Overview', icon: '📊' },
        { id: 'courses', label: 'My Courses', icon: '📚' },
        { id: 'sessions', label: 'Sessions', icon: '📅', badge: sessions.length || null },
        { id: 'homework', label: 'Homework', icon: '📝', badge: pendingHomework.length || null },
        { id: 'training', label: 'Training', icon: '♟️' },
        { id: 'referral', label: 'Refer & Earn', icon: '🎁' },
    ];

    return (
        <div className="student-dashboard">
            <header className="student-header">
                <div className="student-header-left">
                    <Link to="/" className="student-header-logo">ChessHub</Link>
                    <h1 className="student-greeting">Welcome, {profile?.full_name || 'Student'}!</h1>
                </div>
                <div className="student-header-right">
                    {assignedCoach && (
                        <span className="student-coach-badge">🎓 Coach: {assignedCoach.name}</span>
                    )}
                    <span className="student-rating-badge">⭐ Rating: {latestRating}</span>
                    <button onClick={logout} className="student-logout-btn">Logout</button>
                </div>
            </header>

            <div className="student-layout">
                <nav className="student-sidebar">
                    {tabs.map(tab => (
                        <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                            className={`student-sidebar-item ${activeTab === tab.id ? 'active' : ''}`}>
                            <span>{tab.icon}</span>
                            <span>{tab.label}</span>
                            {tab.badge > 0 && <span className="student-sidebar-badge">{tab.badge}</span>}
                        </button>
                    ))}
                </nav>

                <main className="student-main">
                    {loading ? (
                        <div className="student-loading">Loading dashboard...</div>
                    ) : activeTab === 'overview' ? (
                        <OverviewTab
                            courses={courses} sessions={upcomingSessions} pendingHomework={pendingHomework}
                            puzzleStats={puzzleStats} streak={streak} latestRating={latestRating}
                            activity={activity} assignedCoach={assignedCoach}
                        />
                    ) : activeTab === 'courses' ? (
                        <CoursesTab courses={courses} />
                    ) : activeTab === 'sessions' ? (
                        <SessionsTab upcomingSessions={upcomingSessions} pastSessions={pastSessions} />
                    ) : activeTab === 'homework' ? (
                        <HomeworkTab homework={homework} />
                    ) : activeTab === 'training' ? (
                        <TrainingTab puzzleStats={puzzleStats} streak={streak} />
                    ) : activeTab === 'referral' ? (
                        <ReferralTab code={referralCode} puzzleStats={puzzleStats} />
                    ) : null}
                </main>
            </div>
        </div>
    );
}

function OverviewTab({ courses, sessions, pendingHomework, puzzleStats, streak, latestRating, activity, assignedCoach }) {
    const stats = [
        { label: 'Rating', value: latestRating, icon: '⭐', color: '#8b5cf6' },
        { label: 'Courses', value: courses.length, icon: '📚', color: '#3b82f6' },
        { label: 'Puzzles Solved', value: puzzleStats.solved, icon: '🧩', color: '#10b981' },
        { label: 'Day Streak', value: activity?.streak || streak, icon: '🔥', color: '#f59e0b' },
    ];

    return (
        <div>
            <h2 className="student-tab-title">Dashboard Overview</h2>

            {assignedCoach && (
                <div className="student-coach-info">
                    <div className="student-coach-avatar">
                        {assignedCoach.name?.charAt(0) || '🎓'}
                    </div>
                    <div className="student-coach-details">
                        <h4>Your Coach: {assignedCoach.name}</h4>
                        <p>{assignedCoach.title || assignedCoach.specialization || 'Chess Coach'}</p>
                    </div>
                </div>
            )}

            <div className="student-stats-grid">
                {stats.map(s => (
                    <div key={s.label} className="student-stat-card" style={{ borderTopColor: s.color }}>
                        <span className="student-stat-icon">{s.icon}</span>
                        <span className="student-stat-value">{s.value}</span>
                        <span className="student-stat-label">{s.label}</span>
                    </div>
                ))}
            </div>

            {activity && (
                <div className="student-section" style={{ marginBottom: '24px' }}>
                    <h3 className="student-section-title">Activity Tracker</h3>
                    <div className="student-activity-grid">
                        <div className="student-activity-item">
                            <span style={{ fontSize: '20px' }}>🎓</span>
                            <strong>{activity.sessions_attended || 0}</strong>
                            <span className="student-activity-label">Sessions</span>
                        </div>
                        <div className="student-activity-item">
                            <span style={{ fontSize: '20px' }}>🧩</span>
                            <strong>{activity.puzzles_solved || 0}</strong>
                            <span className="student-activity-label">Puzzles</span>
                        </div>
                        <div className="student-activity-item">
                            <span style={{ fontSize: '20px' }}>♟️</span>
                            <strong>{activity.games_played || 0}</strong>
                            <span className="student-activity-label">Games</span>
                        </div>
                        <div className="student-activity-item">
                            <span style={{ fontSize: '20px' }}>🔥</span>
                            <strong>{activity.streak || 0}</strong>
                            <span className="student-activity-label">Streak</span>
                        </div>
                    </div>
                </div>
            )}

            <div className="student-section-grid">
                <div className="student-section">
                    <h3 className="student-section-title">📅 Upcoming Sessions</h3>
                    {sessions.length === 0 ? (
                        <p className="student-empty-text">No upcoming sessions</p>
                    ) : sessions.slice(0, 3).map(s => (
                        <div key={s.id} className="student-list-item">
                            <div>
                                <strong>{s.title || 'Chess Session'}</strong>
                                <div className="student-list-meta">
                                    {new Date(s.date).toLocaleDateString()} at {s.start_time} &middot; {s.duration}min
                                </div>
                                <SessionCountdown date={s.date} time={s.start_time} />
                            </div>
                            {s.meeting_link && (
                                <Link to={`/classroom/${s.id}`} className="student-join-btn">
                                    🎥 Join Class
                                </Link>
                            )}
                        </div>
                    ))}
                </div>

                <div className="student-section">
                    <h3 className="student-section-title">📝 Pending Homework ({pendingHomework.length})</h3>
                    {pendingHomework.length === 0 ? (
                        <p className="student-empty-text">All caught up! 🎉</p>
                    ) : pendingHomework.slice(0, 3).map(h => (
                        <div key={h.id} className="student-list-item">
                            <div>
                                <strong>{h.title}</strong>
                                <div className="student-list-meta">
                                    Due: {h.due_date ? new Date(h.due_date).toLocaleDateString() : 'No deadline'}
                                </div>
                            </div>
                            <span className="student-badge">Pending</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

/* ──────── SESSION COUNTDOWN ──────── */
function SessionCountdown({ date, time }) {
    const [countdown, setCountdown] = useState('');

    useEffect(() => {
        const calcCountdown = () => {
            const sessionDate = new Date(`${date}T${time || '00:00'}`);
            const now = new Date();
            const diff = sessionDate - now;
            if (diff <= 0) { setCountdown(''); return; }
            const hours = Math.floor(diff / 3600000);
            const mins = Math.floor((diff % 3600000) / 60000);
            if (hours > 24) {
                const days = Math.floor(hours / 24);
                setCountdown(`⏰ In ${days} day${days > 1 ? 's' : ''}`);
            } else if (hours > 0) {
                setCountdown(`⏰ In ${hours}h ${mins}m`);
            } else {
                setCountdown(`⏰ Starting in ${mins}m!`);
            }
        };
        calcCountdown();
        const interval = setInterval(calcCountdown, 60000);
        return () => clearInterval(interval);
    }, [date, time]);

    if (!countdown) return null;
    return <div className="student-session-countdown">{countdown}</div>;
}

function CoursesTab({ courses }) {
    return (
        <div>
            <h2 className="student-tab-title">My Courses</h2>
            {courses.length === 0 ? (
                <div className="student-empty-state">
                    <p>You haven&apos;t enrolled in any courses yet.</p>
                    <Link to="/#courses" className="student-cta-btn">Browse Courses</Link>
                </div>
            ) : (
                <div className="student-course-grid">
                    {courses.map(c => (
                        <div key={c.id} className="student-course-card">
                            <div className="student-course-header">
                                <span className="student-course-status">{c.status}</span>
                            </div>
                            <div className="student-progress-bar">
                                <div className="student-progress-fill" style={{ width: `${c.progress_pct}%` }} />
                            </div>
                            <span className="student-progress-text">{Math.round(c.progress_pct)}% complete</span>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

function SessionsTab({ upcomingSessions, pastSessions }) {
    return (
        <div>
            <h2 className="student-tab-title">Sessions</h2>

            <h3 className="student-section-title">Upcoming Sessions</h3>
            {upcomingSessions.length === 0 ? (
                <p className="student-empty-text" style={{ marginBottom: '20px' }}>No upcoming sessions scheduled.</p>
            ) : (
                <div className="student-session-list" style={{ marginBottom: '28px' }}>
                    {upcomingSessions.map(s => (
                        <div key={s.id} className="student-session-card">
                            <div className="student-session-date">
                                <span className="student-session-day">{new Date(s.date).getDate()}</span>
                                <span className="student-session-month">
                                    {new Date(s.date).toLocaleString('default', { month: 'short' })}
                                </span>
                            </div>
                            <div className="student-session-info">
                                <strong>{s.title || 'Chess Session'}</strong>
                                <div className="student-list-meta">
                                    {s.start_time} &middot; {s.duration} minutes
                                </div>
                                {s.coach?.name && (
                                    <div className="student-list-meta">Coach: {s.coach.name}</div>
                                )}
                                {s.notes && <div className="student-list-meta">{s.notes}</div>}
                                <SessionCountdown date={s.date} time={s.start_time} />
                            </div>
                            {s.meeting_link && (
                                <Link to={`/classroom/${s.id}`} className="student-join-btn">
                                    🎥 Join Class
                                </Link>
                            )}
                        </div>
                    ))}
                </div>
            )}

            <h3 className="student-section-title">Past Classes</h3>
            {pastSessions.length === 0 ? (
                <p className="student-empty-text">No completed sessions yet.</p>
            ) : (
                <div className="student-session-list">
                    {pastSessions.slice().sort((a, b) => (`${b.date} ${b.start_time}`).localeCompare(`${a.date} ${a.start_time}`)).map(s => (
                        <div key={s.id} className="student-session-card" style={{ opacity: 0.9 }}>
                            <div className="student-session-date">
                                <span className="student-session-day">{new Date(s.date).getDate()}</span>
                                <span className="student-session-month">
                                    {new Date(s.date).toLocaleString('default', { month: 'short' })}
                                </span>
                            </div>
                            <div className="student-session-info">
                                <strong>{s.title || 'Chess Session'}</strong>
                                <div className="student-list-meta">
                                    {s.start_time} &middot; {s.duration} minutes &middot; {s.status}
                                </div>
                                {s.coach?.name && (
                                    <div className="student-list-meta">Coach: {s.coach.name}</div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

function HomeworkTab({ homework }) {
    const getStatusColor = (status) => {
        const colors = { pending: '#f59e0b', submitted: '#3b82f6', reviewed: '#10b981', late: '#ef4444' };
        return colors[status] || '#6b7280';
    };

    return (
        <div>
            <h2 className="student-tab-title">Homework</h2>
            {homework.length === 0 ? (
                <p className="student-empty-text">No homework assigned yet.</p>
            ) : homework.map(h => (
                <div key={h.id} className="student-hw-card">
                    <div className="student-hw-header">
                        <strong>{h.title}</strong>
                        <span className="student-hw-status" style={{ background: getStatusColor(h.status) }}>
                            {h.status}
                        </span>
                    </div>
                    {h.description && <p className="student-list-meta">{h.description}</p>}
                    <div className="student-hw-meta">
                        {h.due_date && <span>Due: {new Date(h.due_date).toLocaleDateString()}</span>}
                        {h.grade && <span>Grade: {h.grade}</span>}
                    </div>
                    {h.coach_feedback && (
                        <div className="student-hw-feedback">
                            <strong>Coach Feedback:</strong> {h.coach_feedback}
                        </div>
                    )}
                </div>
            ))}
        </div>
    );
}

function TrainingTab({ puzzleStats, streak }) {
    const [trainingView, setTrainingView] = useState('board');

    const trainingViews = [
        { id: 'board', label: '♟️ Chess Board' },
        { id: 'puzzle', label: '🧩 Daily Puzzle' },
        { id: 'leaderboard', label: '🏆 Leaderboard' },
        { id: 'streak', label: '🔥 Streak' },
        { id: 'analysis', label: '🤖 Analysis' },
        { id: 'openings', label: '📖 Openings' },
    ];

    return (
        <div>
            <h2 className="student-tab-title">Training Center</h2>
            <div className="student-stats-grid">
                <div className="student-stat-card" style={{ borderTopColor: '#10b981' }}>
                    <span className="student-stat-icon">🧩</span>
                    <span className="student-stat-value">{puzzleStats.total}</span>
                    <span className="student-stat-label">Total Puzzles</span>
                </div>
                <div className="student-stat-card" style={{ borderTopColor: '#3b82f6' }}>
                    <span className="student-stat-icon">✅</span>
                    <span className="student-stat-value">{puzzleStats.solved}</span>
                    <span className="student-stat-label">Solved</span>
                </div>
                <div className="student-stat-card" style={{ borderTopColor: '#f59e0b' }}>
                    <span className="student-stat-icon">🔥</span>
                    <span className="student-stat-value">{streak}</span>
                    <span className="student-stat-label">Day Streak</span>
                </div>
                <div className="student-stat-card" style={{ borderTopColor: '#8b5cf6' }}>
                    <span className="student-stat-icon">📈</span>
                    <span className="student-stat-value">
                        {puzzleStats.total > 0 ? Math.round((puzzleStats.solved / puzzleStats.total) * 100) : 0}%
                    </span>
                    <span className="student-stat-label">Accuracy</span>
                </div>
            </div>

            <div className="student-training-tabs">
                {trainingViews.map(v => (
                    <button key={v.id} onClick={() => setTrainingView(v.id)}
                        className={`student-training-tab-btn ${trainingView === v.id ? 'active' : ''}`}>
                        {v.label}
                    </button>
                ))}
            </div>

            <div className="student-training-content">
                <Suspense fallback={<div className="student-loading">Loading training module...</div>}>
                    {trainingView === 'board' && <ChessBoard showNotation={true} interactive={true} />}
                    {trainingView === 'puzzle' && <DailyPuzzle />}
                    {trainingView === 'leaderboard' && <PuzzleLeaderboard />}
                    {trainingView === 'streak' && <PuzzleStreakTracker />}
                    {trainingView === 'analysis' && <GameAnalysis />}
                    {trainingView === 'openings' && <OpeningDisplay />}
                </Suspense>
            </div>
        </div>
    );
}

function ReferralTab({ code, puzzleStats }) {
    const referralLink = code ? `https://chesshubacademy.com/ref/${code}` : '';
    const [copied, setCopied] = useState(false);

    const copyLink = () => {
        if (referralLink) {
            navigator.clipboard.writeText(referralLink);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    return (
        <div>
            <h2 className="student-tab-title">Refer & Earn</h2>

            <div className="student-referral-box">
                <h3 style={{ marginBottom: '8px' }}>Share your referral link</h3>
                <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '14px', marginBottom: '16px' }}>
                    Invite friends to ChessHub Academy. Earn rewards for every friend who joins!
                </p>
                {code ? (
                    <>
                        <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', alignItems: 'center', marginBottom: '12px' }}>
                            <code className="student-referral-code">{code}</code>
                        </div>
                        <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', flexWrap: 'wrap' }}>
                            <button onClick={copyLink} className="student-cta-btn" style={{ fontSize: '13px', padding: '8px 16px', marginTop: 0 }}>
                                {copied ? '✅ Copied!' : '📋 Copy Link'}
                            </button>
                            <a href={`https://wa.me/?text=${encodeURIComponent(`Join me on ChessHub Academy! Get a free demo chess class: ${referralLink}`)}`}
                                target="_blank" rel="noopener noreferrer"
                                className="student-cta-btn whatsapp" style={{ fontSize: '13px', padding: '8px 16px', marginTop: 0 }}>
                                WhatsApp
                            </a>
                        </div>
                    </>
                ) : (
                    <p style={{ color: 'rgba(255,255,255,0.4)' }}>Referral code generating...</p>
                )}
            </div>

            <ShareAchievement type="puzzles" count={puzzleStats.solved} />
        </div>
    );
}
