import { Link } from 'react-router-dom';

export default function SmartCTA({ variant = 'default' }) {
    const configs = {
        default: {
            heading: 'Want to improve faster?',
            text: 'Book a free chess coaching demo with our expert coaches.',
            btn: 'Book Demo',
            href: '/#booking',
        },
        blog: {
            heading: 'Enjoyed this article?',
            text: 'Get personalized coaching to accelerate your chess improvement.',
            btn: 'Start Free Demo',
            href: '/#booking',
        },
        puzzle: {
            heading: 'Love solving puzzles?',
            text: 'Our coaches will help you spot tactical patterns faster.',
            btn: 'Try Free Demo',
            href: '/#booking',
        },
        tournament: {
            heading: 'Ready to win your next tournament?',
            text: 'Professional coaching designed to improve your competitive results.',
            btn: 'Book Free Demo',
            href: '/#booking',
        },
    };

    const cfg = configs[variant] || configs.default;

    return (
        <div style={S.wrap}>
            <h3 style={S.heading}>{cfg.heading}</h3>
            <p style={S.text}>{cfg.text}</p>
            <a href={cfg.href} style={S.btn}>{cfg.btn}</a>
        </div>
    );
}

const S = {
    wrap: {
        maxWidth: '600px',
        margin: '2rem auto',
        textAlign: 'center',
        padding: '2rem',
        background: 'linear-gradient(135deg, rgba(139,92,246,0.1), rgba(59,130,246,0.1))',
        border: '1px solid rgba(139,92,246,0.25)',
        borderRadius: '16px',
    },
    heading: { margin: '0 0 8px', fontSize: '1.3rem', color: '#fff' },
    text: { color: '#bbb', margin: '0 0 1.2rem', fontSize: '0.95rem' },
    btn: {
        display: 'inline-block',
        padding: '12px 28px',
        borderRadius: '8px',
        background: 'linear-gradient(135deg, #8b5cf6, #3b82f6)',
        color: '#fff',
        textDecoration: 'none',
        fontWeight: 600,
        fontSize: '0.95rem',
    },
};
