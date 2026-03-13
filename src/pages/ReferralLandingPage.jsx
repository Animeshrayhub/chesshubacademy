import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { incrementReferralCount } from '../api/referralCodeApi';
import { createLead } from '../api/leadApi';

export default function ReferralLandingPage() {
    const { code } = useParams();
    const [submitted, setSubmitted] = useState(false);
    const [form, setForm] = useState({ name: '', email: '', phone: '' });
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        document.title = 'Join ChessHub Academy — Referral Invite';
        return () => { document.title = 'ChessHub Academy'; };
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            await createLead({
                name: form.name,
                email: form.email,
                phone: form.phone,
                source: 'referral',
                status: 'new',
                notes: `Referral code: ${code}`,
            });
            await incrementReferralCount(code);
            setSubmitted(true);
        } catch {
            // Lead may already exist
            setSubmitted(true);
        }
        setSubmitting(false);
    };

    return (
        <div style={S.page}>
            <nav style={S.nav}>
                <Link to="/" style={S.logo}>♟ ChessHub Academy</Link>
            </nav>

            <div style={S.container}>
                {submitted ? (
                    <div style={S.card}>
                        <div style={S.successIcon}>✅</div>
                        <h2 style={S.heading}>Welcome to ChessHub!</h2>
                        <p style={S.text}>
                            Your friend referred you because they believe in our coaching. 
                            We'll contact you soon to schedule your free demo class.
                        </p>
                        <a href="/#booking" style={S.btn}>Book Demo Now</a>
                        <Link to="/" style={S.link}>← Visit Homepage</Link>
                    </div>
                ) : (
                    <div style={S.card}>
                        <div style={S.badge}>🎁 Referral Invite</div>
                        <h1 style={S.heading}>Your friend invited you to learn chess!</h1>
                        <p style={S.text}>
                            Join ChessHub Academy and get a <strong>free demo class</strong> with an expert chess coach. 
                            Improve your game with personalized 1-on-1 training.
                        </p>
                        <p style={S.refCode}>Referral Code: <strong>{code}</strong></p>

                        <form onSubmit={handleSubmit} style={S.form}>
                            <input
                                type="text" placeholder="Your Name" required
                                value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}
                                style={S.input}
                            />
                            <input
                                type="email" placeholder="Your Email" required
                                value={form.email} onChange={e => setForm({ ...form, email: e.target.value })}
                                style={S.input}
                            />
                            <input
                                type="tel" placeholder="Your Phone (WhatsApp)"
                                value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })}
                                style={S.input}
                            />
                            <button type="submit" style={S.btn} disabled={submitting}>
                                {submitting ? 'Submitting...' : 'Claim Free Demo Class'}
                            </button>
                        </form>

                        <div style={S.features}>
                            <div style={S.feature}>🎓 Expert Coaches</div>
                            <div style={S.feature}>♟️ 1-on-1 Classes</div>
                            <div style={S.feature}>🏆 Tournament Prep</div>
                            <div style={S.feature}>🧩 Daily Puzzles</div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

const S = {
    page: { minHeight: '100vh', background: 'linear-gradient(135deg, #0f0c29, #1a1a3e, #24243e)', color: '#fff' },
    nav: { padding: '16px 32px', borderBottom: '1px solid rgba(255,255,255,0.08)' },
    logo: { color: '#8b5cf6', textDecoration: 'none', fontSize: '18px', fontWeight: 700 },
    container: { maxWidth: '520px', margin: '0 auto', padding: '3rem 1.5rem' },
    card: { background: 'rgba(255,255,255,0.05)', borderRadius: '20px', padding: '2.5rem', border: '1px solid rgba(139,92,246,0.2)', textAlign: 'center' },
    badge: { display: 'inline-block', padding: '6px 16px', borderRadius: '20px', background: 'rgba(139,92,246,0.15)', color: '#a78bfa', fontSize: '13px', fontWeight: 600, marginBottom: '16px' },
    heading: { fontSize: '1.6rem', fontWeight: 700, marginBottom: '12px', lineHeight: 1.3 },
    text: { color: 'rgba(255,255,255,0.7)', lineHeight: 1.6, marginBottom: '16px', fontSize: '0.95rem' },
    refCode: { fontSize: '0.85rem', color: 'rgba(255,255,255,0.5)', marginBottom: '20px' },
    form: { display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '24px' },
    input: { padding: '12px 16px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.15)', background: 'rgba(255,255,255,0.05)', color: '#fff', fontSize: '14px', outline: 'none' },
    btn: { display: 'inline-block', padding: '14px 28px', borderRadius: '10px', background: 'linear-gradient(135deg, #8b5cf6, #3b82f6)', color: '#fff', textDecoration: 'none', fontWeight: 600, fontSize: '15px', border: 'none', cursor: 'pointer' },
    link: { display: 'block', marginTop: '16px', color: '#8b5cf6', textDecoration: 'none', fontSize: '14px' },
    successIcon: { fontSize: '48px', marginBottom: '16px' },
    features: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' },
    feature: { padding: '10px', borderRadius: '10px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', fontSize: '13px', color: 'rgba(255,255,255,0.7)' },
};
