import { useState, useEffect, useMemo } from 'react';
import { LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { getBookings } from '../../api/bookingApi';
import { getAdminOverviewCounts } from '../../api/userApi';
import './AdminDashboard.css';

export default function AdminDashboard() {
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [overviewCounts, setOverviewCounts] = useState({
        students: 0,
        coaches: 0,
        sessionsToday: 0,
        upcomingClasses: 0,
        demoBookings: 0,
    });
    const [stats, setStats] = useState({
        total: 0,
        today: 0,
        thisWeek: 0,
        thisMonth: 0,
        pending: 0,
        confirmed: 0,
    });

    const loadData = async () => {
        setLoading(true);
        const [data, counts] = await Promise.all([getBookings(), getAdminOverviewCounts()]);
        setBookings(data);
        setOverviewCounts(counts);

        const now = new Date();
        const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const weekAgo = new Date(todayStart.getTime() - 7 * 24 * 60 * 60 * 1000);
        const monthAgo = new Date(todayStart.getTime() - 30 * 24 * 60 * 60 * 1000);
        const toDate = (b) => new Date(b.created_at || b.timestamp || 0);

        setStats({
            total: data.length,
            today: data.filter(b => toDate(b) >= todayStart).length,
            thisWeek: data.filter(b => toDate(b) >= weekAgo).length,
            thisMonth: data.filter(b => toDate(b) >= monthAgo).length,
            pending: data.filter(b => !b.status || b.status === 'pending').length,
            confirmed: data.filter(b => b.status === 'confirmed').length,
        });
        setLoading(false);
    };

    useEffect(() => {
        loadData();
    }, []);

    // Generate last-7-days chart data from real bookings
    const bookingsOverTime = useMemo(() => {
        const today = new Date();
        return Array.from({ length: 7 }, (_, i) => {
            const d = new Date(today);
            d.setDate(today.getDate() - (6 - i));
            const dateStr = d.toISOString().split('T')[0];
            const count = bookings.filter(b => {
                const bDate = (b.created_at || b.timestamp || '').split('T')[0];
                return bDate === dateStr;
            }).length;
            return { name: d.toLocaleDateString('en-US', { weekday: 'short' }), bookings: count };
        });
    }, [bookings]);

    const statusData = [
        { name: 'Pending', value: stats.pending },
        { name: 'Confirmed', value: stats.confirmed },
    ];

    const COLORS = ['#8b5cf6', '#3b82f6', '#ec4899', '#06b6d4'];
    const recentBookings = bookings.slice(0, 5);

    if (loading) {
        return (
            <div className="admin-dashboard">
                <h2>Dashboard Overview</h2>
                <p style={{ color: 'var(--text-secondary, #aaa)', padding: '2rem 0' }}>Loading live dataâ€¦</p>
            </div>
        );
    }

    return (
        <div className="admin-dashboard">
            <h2>Dashboard Overview</h2>

            {/* Stats Cards */}
            <div className="stats-grid">
                <div className="glass-card stat-card">
                    <div className="stat-icon">👨‍🎓</div>
                    <div className="stat-info">
                        <div className="stat-value">{overviewCounts.students}</div>
                        <div className="stat-label">Total Students</div>
                    </div>
                </div>

                <div className="glass-card stat-card">
                    <div className="stat-icon">👨‍🏫</div>
                    <div className="stat-info">
                        <div className="stat-value">{overviewCounts.coaches}</div>
                        <div className="stat-label">Total Coaches</div>
                    </div>
                </div>

                <div className="glass-card stat-card">
                    <div className="stat-icon">📅</div>
                    <div className="stat-info">
                        <div className="stat-value">{overviewCounts.sessionsToday}</div>
                        <div className="stat-label">Sessions Today</div>
                    </div>
                </div>

                <div className="glass-card stat-card">
                    <div className="stat-icon">⏭️</div>
                    <div className="stat-info">
                        <div className="stat-value">{overviewCounts.upcomingClasses}</div>
                        <div className="stat-label">Upcoming Classes</div>
                    </div>
                </div>

                <div className="glass-card stat-card">
                    <div className="stat-icon">📋</div>
                    <div className="stat-info">
                        <div className="stat-value">{overviewCounts.demoBookings || stats.total}</div>
                        <div className="stat-label">Demo Bookings</div>
                    </div>
                </div>
            </div>

            {/* Charts */}
            <div className="charts-grid">
                <div className="glass-card chart-card">
                    <h3>Bookings â€” Last 7 Days</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={bookingsOverTime}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                            <XAxis dataKey="name" stroke="#a1a1aa" />
                            <YAxis stroke="#a1a1aa" allowDecimals={false} />
                            <Tooltip
                                contentStyle={{ background: '#1a1a24', border: '1px solid #333', borderRadius: '8px' }}
                            />
                            <Legend />
                            <Line type="monotone" dataKey="bookings" stroke="#8b5cf6" strokeWidth={2} dot={{ r: 3 }} />
                        </LineChart>
                    </ResponsiveContainer>
                </div>

                <div className="glass-card chart-card">
                    <h3>Booking Status</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                            <Pie
                                data={statusData}
                                cx="50%"
                                cy="50%"
                                labelLine={false}
                                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                outerRadius={80}
                                fill="#8884d8"
                                dataKey="value"
                            >
                                {statusData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip
                                contentStyle={{ background: '#1a1a24', border: '1px solid #333', borderRadius: '8px' }}
                            />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Recent Activity */}
            <div className="glass-card recent-activity">
                <h3>Recent Bookings</h3>
                {recentBookings.length === 0 ? (
                    <p className="empty-state">No bookings yet</p>
                ) : (
                    <div className="activity-list">
                        {recentBookings.map((booking) => (
                            <div key={booking.id} className="activity-item">
                                <div className="activity-icon">ðŸ‘¤</div>
                                <div className="activity-info">
                                    <div className="activity-title">{booking.name}</div>
                                    <div className="activity-details">
                                        {booking.email} â€¢ {new Date(booking.created_at || booking.timestamp).toLocaleDateString()}
                                    </div>
                                </div>
                                <div className="activity-status">
                                    <span className={`status-badge ${booking.status || 'pending'}`}>
                                        {booking.status || 'pending'}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
