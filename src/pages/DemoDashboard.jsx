import { useState, lazy, Suspense } from 'react';
import { Link, Navigate } from 'react-router-dom';

const ChessBoard = lazy(() => import('../components/ChessBoard/ChessBoard'));
const DailyPuzzle = lazy(() => import('../components/Puzzles/DailyPuzzle'));

export default function DemoDashboard() {
    const [activeTab, setActiveTab] = useState('play');

    // Get demo user from sessionStorage
    const demoUser = JSON.parse(sessionStorage.getItem('demoUser') || 'null');

    if (!demoUser) {
        return <Navigate to="/login" replace />;
    }

    const handleLogout = () => {
        sessionStorage.removeItem('demoUser');
        // Navigate by mutating location — avoids useNavigate in render path
        window.location.replace('/login');
    };

    const tabs = [
        { id: 'play', label: 'Play Chess', icon: '♟️' },
        { id: 'puzzles', label: 'Puzzles', icon: '🧩' },
    ];

    return (
        <div style={styles.page}>
            <header style={styles.header}>
                <div style={styles.headerLeft}>
                    <Link to="/" style={styles.logo}>ChessHub</Link>
                    <span style={styles.demoBadge}>DEMO</span>
                </div>
                <div style={styles.headerRight}>
                    <span style={styles.welcome}>Welcome, {demoUser.name}</span>
                    <button onClick={handleLogout} style={styles.logoutBtn}>Logout</button>
                </div>
            </header>

            <div style={styles.banner}>
                <p style={styles.bannerText}>
                    🎓 You&apos;re using a demo account with limited features. Contact admin to upgrade to a full student account.
                </p>
            </div>

            <div style={styles.tabs}>
                {tabs.map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        style={activeTab === tab.id ? { ...styles.tab, ...styles.activeTab } : styles.tab}
                    >
                        <span>{tab.icon}</span> {tab.label}
                    </button>
                ))}
            </div>

            <main style={styles.content}>
                <Suspense fallback={<div style={styles.loading}>Loading...</div>}>
                    {activeTab === 'play' && (
                        <div style={styles.section}>
                            <h2 style={styles.sectionTitle}>Practice Chess</h2>
                            <p style={styles.sectionSub}>Play against the computer and sharpen your skills</p>
                            <div style={styles.boardWrapper}>
                                <ChessBoard />
                            </div>
                        </div>
                    )}

                    {activeTab === 'puzzles' && (
                        <div style={styles.section}>
                            <h2 style={styles.sectionTitle}>Daily Puzzle</h2>
                            <p style={styles.sectionSub}>Solve puzzles to improve your tactical vision</p>
                            <DailyPuzzle />
                        </div>
                    )}
                </Suspense>
            </main>
        </div>
    );
}

const styles = {
    page: {
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #0f0c29 0%, #1a1a3e 50%, #24243e 100%)',
        color: '#fff',
    },
    header: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '16px 32px',
        borderBottom: '1px solid rgba(255,255,255,0.1)',
    },
    headerLeft: { display: 'flex', alignItems: 'center', gap: '12px' },
    logo: {
        fontSize: '20px',
        fontWeight: 700,
        color: '#fff',
        textDecoration: 'none',
        background: 'linear-gradient(135deg, #8b5cf6, #3b82f6)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
    },
    demoBadge: {
        padding: '2px 10px',
        borderRadius: '12px',
        background: 'rgba(251,191,36,0.2)',
        color: '#fbbf24',
        fontSize: '11px',
        fontWeight: 700,
        letterSpacing: '1px',
    },
    headerRight: { display: 'flex', alignItems: 'center', gap: '16px' },
    welcome: { fontSize: '14px', color: 'rgba(255,255,255,0.7)' },
    logoutBtn: {
        padding: '6px 16px',
        borderRadius: '8px',
        border: '1px solid rgba(255,255,255,0.2)',
        background: 'transparent',
        color: '#fff',
        cursor: 'pointer',
        fontSize: '13px',
    },
    banner: {
        background: 'rgba(251,191,36,0.1)',
        border: '1px solid rgba(251,191,36,0.2)',
        margin: '16px 32px',
        borderRadius: '10px',
        padding: '12px 20px',
    },
    bannerText: { margin: 0, fontSize: '14px', color: '#fbbf24' },
    tabs: {
        display: 'flex',
        gap: '8px',
        padding: '0 32px',
        marginTop: '16px',
    },
    tab: {
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
        padding: '10px 20px',
        borderRadius: '8px',
        border: '1px solid rgba(255,255,255,0.1)',
        background: 'rgba(255,255,255,0.03)',
        color: 'rgba(255,255,255,0.6)',
        cursor: 'pointer',
        fontSize: '14px',
        fontWeight: 500,
    },
    activeTab: {
        background: 'rgba(139,92,246,0.2)',
        borderColor: '#8b5cf6',
        color: '#fff',
    },
    content: { padding: '24px 32px' },
    section: { maxWidth: '800px', margin: '0 auto' },
    sectionTitle: { fontSize: '22px', fontWeight: 600, marginBottom: '8px' },
    sectionSub: { color: 'rgba(255,255,255,0.5)', fontSize: '14px', marginBottom: '24px' },
    boardWrapper: { maxWidth: '600px', margin: '0 auto' },
    loading: { textAlign: 'center', padding: '40px', color: 'rgba(255,255,255,0.5)' },
};
