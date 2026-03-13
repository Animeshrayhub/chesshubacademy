import { useState, useEffect } from 'react';
import { getAnalyticsSummary } from '../../api/analyticsApi';
import { getLeadStats } from '../../api/leadApi';
import { getAllReferralCodes } from '../../api/referralCodeApi';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, PieChart, Pie, Cell } from 'recharts';

export default function AdminAnalytics() {
    const [data, setData] = useState([]);
    const [leadStats, setLeadStats] = useState(null);
    const [referralStats, setReferralStats] = useState({ total: 0, totalReferrals: 0 });
    const [loading, setLoading] = useState(true);
    const [range, setRange] = useState('30');

    const loadData = async () => {
        setLoading(true);
        try {
            const end = new Date();
            const start = new Date();
            start.setDate(end.getDate() - parseInt(range));
            const [result, leads, referrals] = await Promise.allSettled([
                getAnalyticsSummary(start.toISOString().split('T')[0], end.toISOString().split('T')[0]),
                getLeadStats(),
                getAllReferralCodes(),
            ]);
            setData(result.status === 'fulfilled' ? result.value || [] : []);
            setLeadStats(leads.status === 'fulfilled' ? leads.value : null);
            if (referrals.status === 'fulfilled') {
                const codes = referrals.value || [];
                setReferralStats({
                    total: codes.length,
                    totalReferrals: codes.reduce((sum, c) => sum + (c.referrals_count || 0), 0),
                });
            }
        } catch { /* empty */ }
        setLoading(false);
    };

    useEffect(() => { loadData(); }, [range]);

    const totals = data.reduce((acc, d) => ({
        visitors: acc.visitors + (d.visitors || 0),
        pageViews: acc.pageViews + (d.page_views || 0),
        bookings: acc.bookings + (d.demo_bookings || 0),
        sales: acc.sales + (d.ebook_sales || 0),
        registrations: acc.registrations + (d.tournament_registrations || 0),
        signups: acc.signups + (d.new_signups || 0),
    }), { visitors: 0, pageViews: 0, bookings: 0, sales: 0, registrations: 0, signups: 0 });

    const conversionRate = totals.visitors > 0
        ? ((totals.bookings + totals.signups) / totals.visitors * 100).toFixed(1)
        : '0.0';

    const chartData = data.map(d => ({
        date: new Date(d.date).toLocaleDateString('en', { month: 'short', day: 'numeric' }),
        visitors: d.visitors || 0,
        bookings: d.demo_bookings || 0,
        sales: d.ebook_sales || 0,
        signups: d.new_signups || 0,
    }));

    const tooltipStyle = {
        contentStyle: {
            background: 'rgba(15,12,41,0.95)',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: '8px',
            color: '#fff',
            fontSize: '12px',
        },
    };

    return (
        <div>
            <div style={S.topBar}>
                <h2 style={S.title}>Analytics Dashboard</h2>
                <div style={S.rangeSelector}>
                    {[['7', '7 days'], ['30', '30 days'], ['90', '90 days']].map(([v, l]) => (
                        <button key={v} onClick={() => setRange(v)}
                            style={{ ...S.rangeBtn, ...(range === v ? S.rangeActive : {}) }}>{l}</button>
                    ))}
                </div>
            </div>

            {loading ? (
                <div style={S.loading}>Loading analytics...</div>
            ) : (
                <>
                    <div style={S.statsGrid}>
                        {[
                            { label: 'Total Visitors', value: totals.visitors, icon: '👥', color: '#8b5cf6' },
                            { label: 'Demo Bookings', value: totals.bookings, icon: '📅', color: '#3b82f6' },
                            { label: 'Ebook Sales', value: totals.sales, icon: '📖', color: '#10b981' },
                            { label: 'New Signups', value: totals.signups, icon: '🎓', color: '#f59e0b' },
                            { label: 'Tournament Regs', value: totals.registrations, icon: '🏆', color: '#ec4899' },
                            { label: 'Conversion Rate', value: `${conversionRate}%`, icon: '📈', color: '#14b8a6' },
                        ].map(s => (
                            <div key={s.label} style={{ ...S.statCard, borderTopColor: s.color }}>
                                <div style={S.statIcon}>{s.icon}</div>
                                <div style={S.statValue}>{s.value}</div>
                                <div style={S.statLabel}>{s.label}</div>
                            </div>
                        ))}
                    </div>

                    <div style={S.chartsGrid}>
                        <div style={S.chartCard}>
                            <h3 style={S.chartTitle}>Visitors Over Time</h3>
                            <ResponsiveContainer width="100%" height={250}>
                                <AreaChart data={chartData}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                                    <XAxis dataKey="date" tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 11 }} />
                                    <YAxis tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 11 }} />
                                    <Tooltip {...tooltipStyle} />
                                    <Area type="monotone" dataKey="visitors" stroke="#8b5cf6" fill="rgba(139,92,246,0.2)" />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>

                        <div style={S.chartCard}>
                            <h3 style={S.chartTitle}>Conversions</h3>
                            <ResponsiveContainer width="100%" height={250}>
                                <BarChart data={chartData}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                                    <XAxis dataKey="date" tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 11 }} />
                                    <YAxis tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 11 }} />
                                    <Tooltip {...tooltipStyle} />
                                    <Bar dataKey="bookings" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                                    <Bar dataKey="signups" fill="#10b981" radius={[4, 4, 0, 0]} />
                                    <Bar dataKey="sales" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    <div style={S.chartCard}>
                        <h3 style={S.chartTitle}>Growth Trends</h3>
                        <ResponsiveContainer width="100%" height={300}>
                            <LineChart data={chartData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                                <XAxis dataKey="date" tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 11 }} />
                                <YAxis tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 11 }} />
                                <Tooltip {...tooltipStyle} />
                                <Line type="monotone" dataKey="visitors" stroke="#8b5cf6" strokeWidth={2} dot={false} />
                                <Line type="monotone" dataKey="bookings" stroke="#3b82f6" strokeWidth={2} dot={false} />
                                <Line type="monotone" dataKey="signups" stroke="#10b981" strokeWidth={2} dot={false} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>

                    {/* Lead Funnel Section */}
                    {leadStats && (
                        <div style={S.chartsGrid}>
                            <div style={S.chartCard}>
                                <h3 style={S.chartTitle}>Lead Funnel</h3>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                    {[
                                        { label: 'Total Leads', value: leadStats.total, color: '#8b5cf6', width: '100%' },
                                        { label: 'Contacted', value: leadStats.byStatus?.contacted || 0, color: '#3b82f6', width: `${leadStats.total > 0 ? ((leadStats.byStatus?.contacted || 0) / leadStats.total * 100) : 0}%` },
                                        { label: 'Demo Booked', value: leadStats.byStatus?.demo_booked || 0, color: '#f59e0b', width: `${leadStats.total > 0 ? ((leadStats.byStatus?.demo_booked || 0) / leadStats.total * 100) : 0}%` },
                                        { label: 'Enrolled', value: leadStats.byStatus?.enrolled || 0, color: '#10b981', width: `${leadStats.total > 0 ? ((leadStats.byStatus?.enrolled || 0) / leadStats.total * 100) : 0}%` },
                                    ].map(item => (
                                        <div key={item.label}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '4px' }}>
                                                <span style={{ color: 'rgba(255,255,255,0.7)' }}>{item.label}</span>
                                                <span style={{ fontWeight: 600 }}>{item.value}</span>
                                            </div>
                                            <div style={{ height: '8px', background: 'rgba(255,255,255,0.05)', borderRadius: '4px', overflow: 'hidden' }}>
                                                <div style={{ height: '100%', width: item.width, minWidth: item.value > 0 ? '4px' : '0', background: item.color, borderRadius: '4px', transition: 'width 0.3s' }} />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div style={S.chartCard}>
                                <h3 style={S.chartTitle}>Leads by Source</h3>
                                {leadStats.bySource && Object.keys(leadStats.bySource).length > 0 ? (
                                    <ResponsiveContainer width="100%" height={220}>
                                        <PieChart>
                                            <Pie
                                                data={Object.entries(leadStats.bySource).map(([name, value]) => ({ name, value }))}
                                                cx="50%" cy="50%" outerRadius={80} dataKey="value"
                                                label={({ name, value }) => `${name}: ${value}`}
                                            >
                                                {Object.keys(leadStats.bySource).map((_, i) => (
                                                    <Cell key={i} fill={['#8b5cf6', '#3b82f6', '#10b981', '#f59e0b', '#ec4899', '#14b8a6'][i % 6]} />
                                                ))}
                                            </Pie>
                                            <Tooltip {...tooltipStyle} />
                                        </PieChart>
                                    </ResponsiveContainer>
                                ) : (
                                    <p style={{ textAlign: 'center', color: 'rgba(255,255,255,0.4)', padding: '40px' }}>No lead data yet</p>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Referral Stats */}
                    <div style={S.chartsGrid}>
                        <div style={S.chartCard}>
                            <h3 style={S.chartTitle}>Referral Program</h3>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', textAlign: 'center' }}>
                                <div>
                                    <div style={{ fontSize: '32px', fontWeight: 700, color: '#8b5cf6' }}>{referralStats.total}</div>
                                    <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)' }}>Active Referral Codes</div>
                                </div>
                                <div>
                                    <div style={{ fontSize: '32px', fontWeight: 700, color: '#10b981' }}>{referralStats.totalReferrals}</div>
                                    <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)' }}>Total Referrals</div>
                                </div>
                            </div>
                        </div>
                        <div style={S.chartCard}>
                            <h3 style={S.chartTitle}>Conversion Summary</h3>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', textAlign: 'center' }}>
                                <div>
                                    <div style={{ fontSize: '32px', fontWeight: 700, color: '#3b82f6' }}>{totals.bookings}</div>
                                    <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)' }}>Demo Bookings ({range}d)</div>
                                </div>
                                <div>
                                    <div style={{ fontSize: '32px', fontWeight: 700, color: '#f59e0b' }}>{totals.signups}</div>
                                    <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)' }}>New Students ({range}d)</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}

const S = {
    topBar: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' },
    title: { fontSize: '22px', fontWeight: 600 },
    rangeSelector: { display: 'flex', gap: '8px' },
    rangeBtn: { padding: '6px 14px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.15)', background: 'transparent', color: 'rgba(255,255,255,0.6)', cursor: 'pointer', fontSize: '12px' },
    rangeActive: { background: '#8b5cf6', color: '#fff', borderColor: '#8b5cf6' },
    loading: { textAlign: 'center', padding: '60px', color: 'rgba(255,255,255,0.5)' },
    statsGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '16px', marginBottom: '24px' },
    statCard: { background: 'rgba(255,255,255,0.05)', borderRadius: '12px', padding: '20px', borderTop: '3px solid', textAlign: 'center' },
    statIcon: { fontSize: '24px', marginBottom: '8px' },
    statValue: { fontSize: '28px', fontWeight: 700 },
    statLabel: { fontSize: '12px', color: 'rgba(255,255,255,0.5)', marginTop: '4px' },
    chartsGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' },
    chartCard: { background: 'rgba(255,255,255,0.03)', borderRadius: '12px', padding: '24px', marginBottom: '16px' },
    chartTitle: { fontSize: '15px', fontWeight: 600, marginBottom: '16px' },
};
