import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/useAuth';
import { loginDemoStudent } from '../api/demoStudentApi';

export default function LoginPage() {
    const [loginMode, setLoginMode] = useState('student'); // 'student' | 'demo'
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [demoUsername, setDemoUsername] = useState('');
    const [demoPassword, setDemoPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { login, user, isAdmin, isCoach, loading: authLoading } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        if (authLoading) return;
        if (user) {
            if (isAdmin()) navigate('/admin-dashboard', { replace: true });
            else if (isCoach()) navigate('/coach-dashboard', { replace: true });
            else navigate('/student-dashboard', { replace: true });
            return;
        }
        const demoUser = JSON.parse(sessionStorage.getItem('demoUser') || 'null');
        if (demoUser) {
            navigate('/demo-dashboard', { replace: true });
        }
    }, [user, authLoading, navigate, isAdmin, isCoach]);

    if (authLoading || user) return null;

    const handleStudentLogin = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        const { error: authError } = await login(email, password);
        if (authError) {
            setError(authError.message || 'Login failed');
            setLoading(false);
        }
    };

    const handleDemoLogin = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        const result = await loginDemoStudent(demoUsername, demoPassword);
        if (result.success) {
            sessionStorage.setItem('demoUser', JSON.stringify(result.data));
            navigate('/demo-dashboard', { replace: true });
        } else {
            setError(result.error || 'Invalid demo credentials');
        }
        setLoading(false);
    };

    return (
        <div style={styles.container}>
            <div style={styles.card}>
                <Link to="/" style={styles.backLink}>&larr; Back to Home</Link>
                <h1 style={styles.title}>Welcome Back</h1>
                <p style={styles.subtitle}>Log in to your ChessHub account</p>

                <div style={styles.modeToggle}>
                    <button
                        onClick={() => { setLoginMode('student'); setError(''); }}
                        style={loginMode === 'student' ? { ...styles.modeBtn, ...styles.modeBtnActive } : styles.modeBtn}
                    >
                        Student / Admin
                    </button>
                    <button
                        onClick={() => { setLoginMode('demo'); setError(''); }}
                        style={loginMode === 'demo' ? { ...styles.modeBtn, ...styles.modeBtnActive } : styles.modeBtn}
                    >
                        Demo Access
                    </button>
                </div>

                {loginMode === 'student' ? (
                    <form onSubmit={handleStudentLogin} style={styles.form}>
                        <div style={styles.field}>
                            <label style={styles.label}>Email</label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                style={styles.input}
                                placeholder="you@example.com"
                                required
                                autoFocus
                            />
                        </div>
                        <div style={styles.field}>
                            <label style={styles.label}>Password</label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                style={styles.input}
                                placeholder="Enter your password"
                                required
                            />
                        </div>
                        {error && <p style={styles.error}>{error}</p>}
                        <button type="submit" style={styles.button} disabled={loading}>
                            {loading ? 'Logging in...' : 'Log In'}
                        </button>
                    </form>
                ) : (
                    <form onSubmit={handleDemoLogin} style={styles.form}>
                        <div style={styles.field}>
                            <label style={styles.label}>Demo Username</label>
                            <input
                                type="text"
                                value={demoUsername}
                                onChange={(e) => setDemoUsername(e.target.value)}
                                style={styles.input}
                                placeholder="Enter demo username"
                                required
                                autoFocus
                            />
                        </div>
                        <div style={styles.field}>
                            <label style={styles.label}>Demo Password</label>
                            <input
                                type="password"
                                value={demoPassword}
                                onChange={(e) => setDemoPassword(e.target.value)}
                                style={styles.input}
                                placeholder="Enter demo password"
                                required
                            />
                        </div>
                        {error && <p style={styles.error}>{error}</p>}
                        <button type="submit" style={{ ...styles.button, background: 'linear-gradient(135deg, #f59e0b, #d97706)' }} disabled={loading}>
                            {loading ? 'Logging in...' : 'Demo Login'}
                        </button>
                    </form>
                )}

                <p style={styles.switchText}>
                    Contact admin for account access
                </p>
            </div>
        </div>
    );
}

const styles = {
    container: {
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #0f0c29 0%, #1a1a3e 50%, #24243e 100%)',
        padding: '20px',
    },
    card: {
        background: 'rgba(255,255,255,0.05)',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(255,255,255,0.1)',
        borderRadius: '20px',
        padding: '48px 40px',
        maxWidth: '440px',
        width: '100%',
        color: '#fff',
    },
    backLink: {
        color: 'rgba(255,255,255,0.6)',
        textDecoration: 'none',
        fontSize: '14px',
        display: 'inline-block',
        marginBottom: '24px',
    },
    title: {
        fontSize: '28px',
        fontWeight: 700,
        marginBottom: '8px',
        background: 'linear-gradient(135deg, #8b5cf6, #3b82f6)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
    },
    subtitle: {
        color: 'rgba(255,255,255,0.6)',
        fontSize: '14px',
        marginBottom: '32px',
    },
    form: { display: 'flex', flexDirection: 'column', gap: '20px' },
    field: { display: 'flex', flexDirection: 'column', gap: '6px' },
    label: { fontSize: '13px', fontWeight: 500, color: 'rgba(255,255,255,0.8)' },
    input: {
        padding: '12px 16px',
        borderRadius: '10px',
        border: '1px solid rgba(255,255,255,0.15)',
        background: 'rgba(255,255,255,0.05)',
        color: '#fff',
        fontSize: '15px',
        outline: 'none',
    },
    error: {
        color: '#f87171',
        fontSize: '13px',
        margin: 0,
        padding: '8px 12px',
        background: 'rgba(248,113,113,0.1)',
        borderRadius: '8px',
    },
    button: {
        padding: '14px',
        borderRadius: '10px',
        border: 'none',
        background: 'linear-gradient(135deg, #8b5cf6, #3b82f6)',
        color: '#fff',
        fontSize: '16px',
        fontWeight: 600,
        cursor: 'pointer',
        marginTop: '8px',
    },
    switchText: {
        textAlign: 'center',
        color: 'rgba(255,255,255,0.6)',
        fontSize: '14px',
        marginTop: '24px',
    },
    switchLink: {
        color: '#8b5cf6',
        textDecoration: 'none',
        fontWeight: 600,
    },
    modeToggle: {
        display: 'flex',
        gap: '8px',
        marginBottom: '24px',
        background: 'rgba(255,255,255,0.03)',
        borderRadius: '10px',
        padding: '4px',
    },
    modeBtn: {
        flex: 1,
        padding: '10px',
        borderRadius: '8px',
        border: 'none',
        background: 'transparent',
        color: 'rgba(255,255,255,0.5)',
        cursor: 'pointer',
        fontSize: '13px',
        fontWeight: 600,
        transition: 'all 0.2s',
    },
    modeBtnActive: {
        background: 'rgba(139,92,246,0.2)',
        color: '#fff',
    },
};
