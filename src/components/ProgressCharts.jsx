import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/useAuth';
import { getStudentProgress } from '../api/studentApi';
import { getPuzzleHistory } from '../api/trainingApi';
import { getStudentCourses } from '../api/studentApi';
import {
    LineChart, Line, AreaChart, Area, BarChart, Bar,
    XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';

export default function ProgressCharts() {
    const { profile } = useAuth();
    const [ratingData, setRatingData] = useState([]);
    const [puzzleData, setPuzzleData] = useState([]);
    const [streakData, setStreakData] = useState([]);
    const [courseCompletion, setCourseCompletion] = useState([]);
    const [loading, setLoading] = useState(true);

    const loadData = async () => {
        try {
            const [ratings, puzzles, streaks, courses] = await Promise.allSettled([
                getStudentProgress(profile.id, 'rating'),
                getPuzzleHistory(profile.id),
                getStudentProgress(profile.id, 'streak'),
                getStudentCourses(profile.id),
            ]);

            if (ratings.status === 'fulfilled') {
                setRatingData(ratings.value.map(r => ({
                    date: new Date(r.recorded_at).toLocaleDateString('en', { month: 'short', day: 'numeric' }),
                    rating: Number(r.metric_value),
                })));
            }

            if (puzzles.status === 'fulfilled') {
                const grouped = {};
                puzzles.value.forEach(p => {
                    const day = new Date(p.attempted_at).toLocaleDateString('en', { month: 'short', day: 'numeric' });
                    if (!grouped[day]) grouped[day] = { total: 0, solved: 0 };
                    grouped[day].total++;
                    if (p.solved) grouped[day].solved++;
                });
                setPuzzleData(Object.entries(grouped).map(([date, v]) => ({
                    date, total: v.total, solved: v.solved,
                })));
            }

            if (streaks.status === 'fulfilled') {
                setStreakData(streaks.value.map(s => ({
                    date: new Date(s.recorded_at).toLocaleDateString('en', { month: 'short', day: 'numeric' }),
                    streak: Number(s.metric_value),
                })));
            }

            if (courses.status === 'fulfilled') {
                setCourseCompletion(courses.value.map(c => ({
                    course: c.course_id?.substring(0, 8) || 'Course',
                    progress: Number(c.progress_pct),
                })));
            }
        } catch { /* empty */ }
        setLoading(false);
    };

    useEffect(() => {
        if (profile?.id) loadData();
    }, [profile]); // eslint-disable-line react-hooks/exhaustive-deps

    const tooltipStyle = {
        contentStyle: {
            background: 'rgba(15,12,41,0.95)',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: '8px',
            color: '#fff',
            fontSize: '12px',
        },
    };

    if (loading) return <div style={S.loading}>Loading charts...</div>;

    return (
        <div style={S.container}>
            <h2 style={S.title}>Progress Analytics</h2>

            <div style={S.chartsGrid}>
                <div style={S.chartCard}>
                    <h3 style={S.chartTitle}>Rating Progress</h3>
                    {ratingData.length === 0 ? (
                        <p style={S.empty}>No rating data yet. Play more games!</p>
                    ) : (
                        <ResponsiveContainer width="100%" height={220}>
                            <LineChart data={ratingData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                                <XAxis dataKey="date" tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 10 }} />
                                <YAxis tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 10 }} />
                                <Tooltip {...tooltipStyle} />
                                <Line type="monotone" dataKey="rating" stroke="#8b5cf6" strokeWidth={2} dot={{ r: 3 }} />
                            </LineChart>
                        </ResponsiveContainer>
                    )}
                </div>

                <div style={S.chartCard}>
                    <h3 style={S.chartTitle}>Puzzles Solved</h3>
                    {puzzleData.length === 0 ? (
                        <p style={S.empty}>No puzzle data yet. Start solving!</p>
                    ) : (
                        <ResponsiveContainer width="100%" height={220}>
                            <BarChart data={puzzleData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                                <XAxis dataKey="date" tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 10 }} />
                                <YAxis tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 10 }} />
                                <Tooltip {...tooltipStyle} />
                                <Bar dataKey="solved" fill="#10b981" radius={[4, 4, 0, 0]} />
                                <Bar dataKey="total" fill="rgba(59,130,246,0.3)" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    )}
                </div>

                <div style={S.chartCard}>
                    <h3 style={S.chartTitle}>Learning Streak</h3>
                    {streakData.length === 0 ? (
                        <p style={S.empty}>Start a streak by practicing daily!</p>
                    ) : (
                        <ResponsiveContainer width="100%" height={220}>
                            <AreaChart data={streakData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                                <XAxis dataKey="date" tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 10 }} />
                                <YAxis tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 10 }} />
                                <Tooltip {...tooltipStyle} />
                                <Area type="monotone" dataKey="streak" stroke="#f59e0b" fill="rgba(245,158,11,0.2)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    )}
                </div>

                <div style={S.chartCard}>
                    <h3 style={S.chartTitle}>Course Completion</h3>
                    {courseCompletion.length === 0 ? (
                        <p style={S.empty}>Enroll in a course to track progress.</p>
                    ) : (
                        <ResponsiveContainer width="100%" height={220}>
                            <BarChart data={courseCompletion} layout="vertical">
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                                <XAxis type="number" domain={[0, 100]} tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 10 }} />
                                <YAxis type="category" dataKey="course" tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 10 }} width={80} />
                                <Tooltip {...tooltipStyle} />
                                <Bar dataKey="progress" fill="#3b82f6" radius={[0, 4, 4, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    )}
                </div>
            </div>
        </div>
    );
}

const S = {
    container: { padding: '0' },
    loading: { textAlign: 'center', padding: '40px', color: 'rgba(255,255,255,0.5)' },
    title: { fontSize: '22px', fontWeight: 600, marginBottom: '24px' },
    chartsGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' },
    chartCard: {
        background: 'rgba(255,255,255,0.03)',
        borderRadius: '12px',
        padding: '20px',
    },
    chartTitle: { fontSize: '14px', fontWeight: 600, marginBottom: '16px', color: 'rgba(255,255,255,0.8)' },
    empty: { color: 'rgba(255,255,255,0.35)', fontSize: '13px', textAlign: 'center', padding: '40px 0' },
};
