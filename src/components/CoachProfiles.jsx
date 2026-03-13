import { useRealtimeData } from '../hooks/useRealtimeData';
import { getCoaches } from '../api/coachApi';
import { getFeePlans } from '../api/settingsApi';
import { useState, useEffect } from 'react';
import './CoachProfiles.css';

function getInitials(name) {
    return name
        .split(' ')
        .map(word => word[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);
}

function getTitleColor(title) {
    switch (title) {
        case 'GM': return '#ffd700';
        case 'IM': return '#c0c0c0';
        case 'FM': return '#cd7f32';
        case 'CM': return '#8b5cf6';
        case 'NM': return '#3b82f6';
        default: return '#a1a1aa';
    }
}

export default function CoachProfiles() {
    const { data: coaches, loading } = useRealtimeData('coaches', getCoaches);
    const [feePlans, setFeePlans] = useState([]);

    useEffect(() => {
        loadFeePlans();
    }, []);

    const loadFeePlans = async () => {
        try {
            const plans = await getFeePlans();
            setFeePlans(plans || []);
        } catch (err) {
            console.error('Error loading fee plans:', err);
        }
    };

    if (loading) return null;

    return (
        <section className="coach-profiles-section">
            <div className="container">
                <div className="section-header text-center">
                    <h2 className="fade-in">Meet Our Expert Coaches</h2>
                    <p className="section-subtitle fade-in">
                        Learn from FIDE-titled masters with proven track records
                    </p>
                </div>

                <div className="coaches-carousel">
                    {coaches.slice(0, 4).map((coach) => (
                        <div key={coach.id} className="coach-profile-card">
                            <div className="coach-avatar">
                                {(coach.photo_url && coach.photo_url.startsWith('http')) ? (
                                    <img src={coach.photo_url} alt={coach.name} loading="lazy" />
                                ) : (
                                    <div className="coach-initials">
                                        {getInitials(coach.name)}
                                    </div>
                                )}
                                {coach.title && (
                                    <span className="coach-title-badge"
                                        style={{ backgroundColor: getTitleColor(coach.title) }}>
                                        {coach.title}
                                    </span>
                                )}
                            </div>
                            <h3 className="coach-name">{coach.name}</h3>
                            <p className="coach-experience">{coach.experience} experience</p>
                            <p className="coach-specialization">{coach.specialization}</p>
                        </div>
                    ))}
                </div>

                <div className="coaches-cta">
                    <p>All our coaches are certified and have extensive teaching experience</p>
                </div>

                {/* Fee Plans Section */}
                {feePlans.length > 0 && (
                    <div style={{ marginTop: '60px', textAlign: 'center' }}>
                        <h3 style={{ fontSize: '28px', fontWeight: 700, marginBottom: '12px', color: '#fff' }}>Training Packages</h3>
                        <p style={{ color: 'rgba(255,255,255,0.6)', marginBottom: '40px' }}>Weekly 2 Classes</p>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px' }}>
                            {feePlans.map((plan, idx) => (
                                <div key={idx} style={{
                                    background: 'linear-gradient(180deg, rgba(8, 12, 28, 0.95), rgba(15, 23, 42, 0.95))',
                                    borderRadius: '16px',
                                    padding: '32px',
                                    border: Number(plan.sessions) === 24 ? '2px solid #ffd700' : '2px solid rgba(59, 130, 246, 0.35)',
                                    transition: 'all 0.3s ease',
                                    cursor: 'pointer',
                                    position: 'relative',
                                }}>
                                    {Number(plan.sessions) === 24 && (
                                        <div style={{
                                            position: 'absolute',
                                            top: '-12px',
                                            left: '50%',
                                            transform: 'translateX(-50%)',
                                            padding: '6px 14px',
                                            borderRadius: '999px',
                                            background: 'linear-gradient(90deg, #ffd700, #fbbf24)',
                                            color: '#0b0b0f',
                                            fontSize: '12px',
                                            fontWeight: 700,
                                            textTransform: 'uppercase',
                                        }}>
                                            Most Popular
                                        </div>
                                    )}
                                    <div style={{ fontSize: '36px', fontWeight: 700, color: '#8b5cf6', marginBottom: '8px' }}>
                                        {plan.sessions}
                                    </div>
                                    <div style={{ fontSize: '14px', color: 'rgba(255,255,255,0.7)', marginBottom: '16px' }}>Sessions</div>
                                    <div style={{ fontSize: '32px', fontWeight: 700, color: '#ffd700', marginBottom: '8px' }}>
                                        ₹{plan.price?.toLocaleString('en-IN')}
                                    </div>
                                    <div style={{ fontSize: '13px', color: '#93c5fd', marginBottom: '20px', fontWeight: 600 }}>
                                        ₹{Math.round((Number(plan.price) || 0) / (Number(plan.sessions) || 1)).toLocaleString('en-IN')} per session
                                    </div>
                                    {plan.label && (
                                        <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.6)', fontWeight: 600 }}>
                                            {plan.label}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </section>
    );
}
