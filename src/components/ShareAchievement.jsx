import { useState } from 'react';

export default function ShareAchievement({ type = 'puzzles', value = 0, studentName = '' }) {
    const [copied, setCopied] = useState(false);

    const messages = {
        puzzles: `I solved ${value} chess puzzles on ChessHub Academy! Can you beat my score?`,
        streak: `I'm on a ${value}-day puzzle streak on ChessHub Academy! 🔥`,
        rating: `I reached a ${value} puzzle rating on ChessHub Academy! ♟️`,
        tournament: `I participated in a tournament on ChessHub Academy! 🏆`,
    };

    const text = messages[type] || messages.puzzles;
    const url = 'https://chesshubacademy.com';
    const encoded = encodeURIComponent(text + '\n' + url);

    const shareLinks = {
        whatsapp: `https://wa.me/?text=${encoded}`,
        twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`,
        facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}&quote=${encodeURIComponent(text)}`,
    };

    const handleCopy = () => {
        navigator.clipboard.writeText(text + '\n' + url);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div style={S.card}>
            <div style={S.badge}>🏅</div>
            <h4 style={S.title}>{text}</h4>
            <p style={S.sub}>Share your achievement!</p>
            <div style={S.buttons}>
                <a href={shareLinks.whatsapp} target="_blank" rel="noopener noreferrer" style={{ ...S.btn, background: '#25D366' }}>
                    WhatsApp
                </a>
                <a href={shareLinks.twitter} target="_blank" rel="noopener noreferrer" style={{ ...S.btn, background: '#1DA1F2' }}>
                    Twitter
                </a>
                <a href={shareLinks.facebook} target="_blank" rel="noopener noreferrer" style={{ ...S.btn, background: '#1877F2' }}>
                    Facebook
                </a>
                <button onClick={handleCopy} style={{ ...S.btn, background: '#6b7280', border: 'none', cursor: 'pointer' }}>
                    {copied ? '✓ Copied' : '📋 Copy'}
                </button>
            </div>
        </div>
    );
}

const S = {
    card: {
        background: 'linear-gradient(135deg, rgba(139,92,246,0.15), rgba(59,130,246,0.15))',
        border: '1px solid rgba(139,92,246,0.3)',
        borderRadius: '16px',
        padding: '24px',
        textAlign: 'center',
    },
    badge: { fontSize: '40px', marginBottom: '8px' },
    title: { margin: '0 0 4px', fontSize: '1rem', color: '#fff' },
    sub: { margin: '0 0 16px', fontSize: '0.85rem', color: '#aaa' },
    buttons: { display: 'flex', gap: '8px', justifyContent: 'center', flexWrap: 'wrap' },
    btn: {
        padding: '8px 16px',
        borderRadius: '8px',
        color: '#fff',
        textDecoration: 'none',
        fontSize: '0.8rem',
        fontWeight: 600,
    },
};
