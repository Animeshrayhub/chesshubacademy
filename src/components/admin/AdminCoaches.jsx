import { useState, useEffect } from 'react';
import * as coachApi from '../../api/coachApi';
import { createCoachAuth } from '../../api/adminApi';
import { getFeePlans } from '../../api/settingsApi';
import { setUserStatus, resetUserPassword } from '../../api/userApi';
import './AdminCoaches.css';

export default function AdminCoaches() {
    const [coaches, setCoaches] = useState([]);
    const [selectedCoach, setSelectedCoach] = useState(null);
    const [showAddModal, setShowAddModal] = useState(false);
    const [showCredentials, setShowCredentials] = useState(false);
    const [credentialsData, setCredentialsData] = useState(null);
    const [feePlans, setFeePlans] = useState([]);
    const [formData, setFormData] = useState({
        name: '',
        title: 'FM',
        rating: '',
        email: '',
        login_password: '',
        phone: '',
        specialization: '',
        experience: '',
        hourly_rate: '',
        availability: 'available',
        bio: '',
        achievements: '',
        languages: '',
        photo: ''
    });

    useEffect(() => {
        loadCoaches();
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

    const loadCoaches = async () => {
        const data = await coachApi.getCoaches();
        setCoaches(data);
    };

    const handleInputChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleAddCoach = async () => {
        try {
            let userId = null;
            let accountId = null;

            // If login password provided, create auth account
            if (formData.login_password && formData.email) {
                const authResult = await createCoachAuth(formData.email, formData.login_password, formData.name);
                if (!authResult.success) {
                    alert('Error creating coach auth account: ' + (authResult.error || 'Unknown error'));
                    return;
                }
                userId = authResult.user_id;
                accountId = authResult.account_id || null;
            }

            const newCoach = {
                name: formData.name,
                title: formData.title,
                rating: formData.rating ? parseInt(formData.rating) : 0,
                email: formData.email,
                phone: formData.phone,
                specialization: formData.specialization,
                experience: formData.experience,
                hourly_rate: formData.hourly_rate,
                availability: formData.availability,
                bio: formData.bio,
                achievements: formData.achievements,
                languages: formData.languages,
                photo_url: formData.photo || '\ud83d\udc64',
                students: 0,
                total_hours: 0,
                rating_avg: 5.0,
                user_id: userId,
            };

            const result = await coachApi.addCoach(newCoach);
            if (result.success) {
                setCoaches(prev => [...prev, result.data]);
                if (userId) {
                    setCredentialsData({
                        email: formData.email,
                        password: formData.login_password,
                        name: formData.name,
                        account_id: accountId,
                    });
                    setShowCredentials(true);
                }
            }
            setShowAddModal(false);
            resetForm();
        } catch (err) {
            alert('Error adding coach: ' + err.message);
        }
    };

    const handleUpdateCoach = async (id, updates) => {
        await coachApi.updateCoach(id, updates);
        setCoaches(prev => prev.map(c => c.id === id ? { ...c, ...updates } : c));
    };

    const handleDeleteCoach = async (id) => {
        if (confirm('Are you sure you want to delete this coach?')) {
            await coachApi.deleteCoach(id);
            setCoaches(prev => prev.filter(c => c.id !== id));
            setSelectedCoach(null);
        }
    };

    const handleToggleCoachAccount = async (coach) => {
        if (!coach?.user_id) {
            alert('No login account linked for this coach.');
            return;
        }

        const deactivate = coach.availability !== 'on-leave';
        const status = deactivate ? 'inactive' : 'active';
        const result = await setUserStatus(coach.user_id, status);
        if (!result.success) {
            alert('Failed to update account status: ' + result.error);
            return;
        }

        await handleUpdateCoach(coach.id, { availability: deactivate ? 'on-leave' : 'available' });
        alert(`Coach account ${deactivate ? 'deactivated' : 'activated'} successfully.`);
    };

    const handleResetCoachPassword = async (coach) => {
        if (!coach?.user_id) {
            alert('No login account linked for this coach.');
            return;
        }
        const newPassword = window.prompt(`Set new password for ${coach.name} (min 6 chars):`);
        if (!newPassword) return;
        const result = await resetUserPassword(coach.user_id, newPassword);
        if (!result.success) {
            alert('Password reset failed: ' + result.error);
            return;
        }
        alert('Password reset successfully.');
    };

    const resetForm = () => {
        setFormData({
            name: '',
            title: 'FM',
            rating: '',
            email: '',
            login_password: '',
            phone: '',
            specialization: '',
            experience: '',
            hourly_rate: '',
            availability: 'available',
            bio: '',
            achievements: '',
            languages: '',
            photo: ''
        });
    };

    return (
        <div className="admin-coaches-page">
            <div className="coaches-header">
                <h2>Coach Management</h2>
                <button onClick={() => setShowAddModal(true)} className="btn btn-primary">
                    + Add Coach
                </button>
            </div>

            <div className="coaches-grid">
                {coaches.map((coach) => (
                    <div key={coach.id} className="glass-card coach-card" onClick={() => setSelectedCoach(coach)}>
                        <div className="coach-photo">{coach.photo_url || coach.photo}</div>

                        <div className="coach-info">
                            <div className="coach-name-title">
                                <h3>{coach.name}</h3>
                                <span className={`title-badge ${coach.title.toLowerCase()}`}>{coach.title}</span>
                            </div>

                            <div className="coach-rating-elo">
                                <span className="elo">ELO: {coach.rating}</span>
                                <span className="rating">⭐ {coach.rating_avg}/5</span>
                            </div>

                            <div className="coach-meta">
                                <div className="meta-item">
                                    <span className="icon">👥</span>
                                    <span>{coach.students} students</span>
                                </div>
                                <div className="meta-item">
                                    <span className="icon">⏱️</span>
                                    <span>{coach.total_hours || coach.totalHours}h taught</span>
                                </div>
                            </div>

                            <div className="coach-specialization">
                                {coach.specialization}
                            </div>

                            <div className={`availability-badge ${coach.availability}`}>
                                {coach.availability === 'available' ? '🟢 Available' : '🔴 Busy'}
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Coach Detail Modal */}
            {selectedCoach && (
                <div className="modal-overlay" onClick={() => setSelectedCoach(null)}>
                    <div className="modal-content glass-card coach-detail-modal" onClick={(e) => e.stopPropagation()}>
                        <button className="modal-close" onClick={() => setSelectedCoach(null)}>×</button>

                        <div className="coach-detail-header">
                            <div className="coach-photo-large">{selectedCoach.photo_url || selectedCoach.photo}</div>
                            <div className="coach-header-info">
                                <h2>{selectedCoach.name}</h2>
                                <span className={`title-badge ${selectedCoach.title.toLowerCase()}`}>{selectedCoach.title}</span>
                                <div className="coach-contact">
                                    <p>📧 {selectedCoach.email}</p>
                                    <p>📱 {selectedCoach.phone}</p>
                                </div>
                            </div>
                        </div>

                        <div className="coach-detail-stats">
                            <div className="stat">
                                <div className="stat-value">{selectedCoach.rating}</div>
                                <div className="stat-label">FIDE Rating</div>
                            </div>
                            <div className="stat">
                                <div className="stat-value">{selectedCoach.students}</div>
                                <div className="stat-label">Students</div>
                            </div>
                            <div className="stat">
                                <div className="stat-value">{selectedCoach.total_hours || selectedCoach.totalHours}h</div>
                                <div className="stat-label">Hours Taught</div>
                            </div>
                            <div className="stat">
                                <div className="stat-value">{selectedCoach.rating_avg}/5</div>
                                <div className="stat-label">Rating</div>
                            </div>
                        </div>

                        <div className="coach-detail-section">
                            <h3>About</h3>
                            <p>{selectedCoach.bio}</p>
                        </div>

                        <div className="coach-detail-section">
                            <h3>Specialization</h3>
                            <p>{selectedCoach.specialization}</p>
                        </div>

                        <div className="coach-detail-section">
                            <h3>Achievements</h3>
                            <p>{selectedCoach.achievements}</p>
                        </div>

                        <div className="coach-detail-grid">
                            <div>
                                <h4>Experience</h4>
                                <p>{selectedCoach.experience}</p>
                            </div>
                            <div>
                                <h4>Hourly Rate</h4>
                                <p>{selectedCoach.hourly_rate || selectedCoach.hourlyRate}</p>
                            </div>
                            <div>
                                <h4>Languages</h4>
                                <p>{selectedCoach.languages}</p>
                            </div>
                            <div>
                                <h4>Availability</h4>
                                <select
                                    value={selectedCoach.availability}
                                    onChange={(e) => handleUpdateCoach(selectedCoach.id, { availability: e.target.value })}
                                    className="availability-select"
                                >
                                    <option value="available">Available</option>
                                    <option value="busy">Busy</option>
                                    <option value="on-leave">On Leave</option>
                                </select>
                            </div>
                        </div>

                        {/* Current Training Packages */}
                        {feePlans.length > 0 && (
                            <div className="coach-detail-section">
                                <h3>Training Packages</h3>
                                <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.6)', marginBottom: '10px' }}>Weekly 2 Classes</p>
                                <div style={{ backgroundColor: 'rgba(139, 92, 246, 0.1)', padding: '16px', borderRadius: '8px', border: '1px solid rgba(139, 92, 246, 0.3)' }}>
                                    <table style={{ width: '100%', fontSize: '13px', color: 'rgba(255,255,255,0.8)' }}>
                                        <tbody>
                                            {feePlans.map((plan, idx) => (
                                                <tr key={idx} style={{ borderBottom: idx < feePlans.length - 1 ? '1px solid rgba(139, 92, 246, 0.2)' : 'none' }}>
                                                    <td style={{ padding: '8px 0', textAlign: 'left' }}>
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                            <span>{plan.sessions} Sessions</span>
                                                            {Number(plan.sessions) === 24 && (
                                                                <span style={{
                                                                    background: 'linear-gradient(90deg, #ffd700, #fbbf24)',
                                                                    color: '#0b0b0f',
                                                                    borderRadius: '999px',
                                                                    padding: '2px 8px',
                                                                    fontSize: '10px',
                                                                    fontWeight: 700,
                                                                    textTransform: 'uppercase',
                                                                    letterSpacing: '0.4px',
                                                                    whiteSpace: 'nowrap',
                                                                }}>
                                                                    Most Popular
                                                                </span>
                                                            )}
                                                        </div>
                                                    </td>
                                                    <td style={{ padding: '8px 0', textAlign: 'right', fontWeight: 600 }}>₹{plan.price?.toLocaleString('en-IN')}</td>
                                                    <td style={{ padding: '8px 0 8px 16px', color: 'rgba(255,255,255,0.6)', fontSize: '12px' }}>₹{Math.round((Number(plan.price) || 0) / (Number(plan.sessions) || 1))}/session</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}

                        <div className="coach-detail-actions">
                            <button className="btn btn-secondary" onClick={() => alert('Edit functionality coming soon!')}>
                                Edit Profile
                            </button>
                            <button className="btn btn-secondary" onClick={() => alert('Schedule functionality coming soon!')}>
                                View Schedule
                            </button>
                            <button className="btn btn-secondary" onClick={() => handleResetCoachPassword(selectedCoach)}>
                                Reset Password
                            </button>
                            <button className="btn btn-secondary" onClick={() => handleToggleCoachAccount(selectedCoach)}>
                                {selectedCoach.availability === 'on-leave' ? 'Activate Account' : 'Deactivate Account'}
                            </button>
                            <button className="btn btn-danger" onClick={() => handleDeleteCoach(selectedCoach.id)}>
                                Delete Coach
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Add Coach Modal */}
            {showAddModal && (
                <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
                    <div className="modal-content glass-card" onClick={(e) => e.stopPropagation()}>
                        <button className="modal-close" onClick={() => setShowAddModal(false)}>×</button>

                        <h2>Add New Coach</h2>

                        <div style={{ background: 'rgba(139,92,246,0.1)', border: '1px solid rgba(139,92,246,0.3)', borderRadius: '8px', padding: '16px', marginBottom: '20px' }}>
                            <h4 style={{ margin: '0 0 12px', color: '#a78bfa', fontSize: '14px' }}>\ud83d\udd10 Login Credentials (Optional)</h4>
                            <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)', margin: '0 0 12px' }}>Create a login account so this coach can access their dashboard</p>
                            <div className="form-grid">
                                <div className="form-group">
                                    <label>Login Email</label>
                                    <input type="email" value={formData.email} onChange={(e) => handleInputChange('email', e.target.value)} className="form-input" placeholder="coach@chesshub.com" />
                                </div>
                                <div className="form-group">
                                    <label>Login Password (min 6 chars)</label>
                                    <input type="password" value={formData.login_password} onChange={(e) => handleInputChange('login_password', e.target.value)} className="form-input" placeholder="Secure password" minLength="6" />
                                </div>
                            </div>
                        </div>

                        <div className="form-grid">
                            <div className="form-group">
                                <label>Name</label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => handleInputChange('name', e.target.value)}
                                    className="form-input"
                                    placeholder="Full name"
                                />
                            </div>

                            <div className="form-group">
                                <label>Title</label>
                                <select
                                    value={formData.title}
                                    onChange={(e) => handleInputChange('title', e.target.value)}
                                    className="form-input"
                                >
                                    <option value="GM">GM - Grandmaster</option>
                                    <option value="IM">IM - International Master</option>
                                    <option value="FM">FM - FIDE Master</option>
                                    <option value="CM">CM - Candidate Master</option>
                                    <option value="NM">NM - National Master</option>
                                </select>
                            </div>

                            <div className="form-group">
                                <label>FIDE Rating</label>
                                <input
                                    type="number"
                                    value={formData.rating}
                                    onChange={(e) => handleInputChange('rating', e.target.value)}
                                    className="form-input"
                                    placeholder="2400"
                                />
                            </div>

                            <div className="form-group">
                                <label>Email</label>
                                <input
                                    type="email"
                                    value={formData.email}
                                    onChange={(e) => handleInputChange('email', e.target.value)}
                                    className="form-input"
                                    placeholder="coach@chesshub.com"
                                />
                            </div>

                            <div className="form-group">
                                <label>Phone</label>
                                <input
                                    type="tel"
                                    value={formData.phone}
                                    onChange={(e) => handleInputChange('phone', e.target.value)}
                                    className="form-input"
                                    placeholder="+91 9876543210"
                                />
                            </div>

                            <div className="form-group">
                                <label>Hourly Rate</label>
                                <input
                                    type="text"
                                    value={formData.hourly_rate}
                                    onChange={(e) => handleInputChange('hourly_rate', e.target.value)}
                                    className="form-input"
                                    placeholder="₹1500"
                                />
                            </div>

                            <div className="form-group full-width">
                                <label>Specialization</label>
                                <input
                                    type="text"
                                    value={formData.specialization}
                                    onChange={(e) => handleInputChange('specialization', e.target.value)}
                                    className="form-input"
                                    placeholder="Opening Theory, Tactics, Endgames"
                                />
                            </div>

                            <div className="form-group">
                                <label>Experience</label>
                                <input
                                    type="text"
                                    value={formData.experience}
                                    onChange={(e) => handleInputChange('experience', e.target.value)}
                                    className="form-input"
                                    placeholder="10 years"
                                />
                            </div>

                            <div className="form-group">
                                <label>Languages</label>
                                <input
                                    type="text"
                                    value={formData.languages}
                                    onChange={(e) => handleInputChange('languages', e.target.value)}
                                    className="form-input"
                                    placeholder="English, Hindi"
                                />
                            </div>

                            <div className="form-group full-width">
                                <label>Bio</label>
                                <textarea
                                    value={formData.bio}
                                    onChange={(e) => handleInputChange('bio', e.target.value)}
                                    className="form-input"
                                    rows="3"
                                    placeholder="Brief description about the coach..."
                                />
                            </div>

                            <div className="form-group full-width">
                                <label>Achievements</label>
                                <textarea
                                    value={formData.achievements}
                                    onChange={(e) => handleInputChange('achievements', e.target.value)}
                                    className="form-input"
                                    rows="2"
                                    placeholder="Notable achievements and titles..."
                                />
                            </div>
                        </div>

                        <div className="modal-footer">
                            <button className="btn btn-secondary" onClick={() => setShowAddModal(false)}>
                                Cancel
                            </button>
                            <button className="btn btn-primary" onClick={handleAddCoach}>
                                Add Coach
                            </button>
                        </div>
                    </div>
                </div>
            )}
            {/* Credentials Confirmation Modal */}
            {showCredentials && credentialsData && (
                <div className="modal-overlay" onClick={() => setShowCredentials(false)}>
                    <div className="modal-content glass-card" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '480px', textAlign: 'center' }}>
                        <div style={{ fontSize: '48px', marginBottom: '16px' }}>\u2705</div>
                        <h2 style={{ marginBottom: '8px' }}>Coach Account Created!</h2>
                        <p style={{ color: 'rgba(255,255,255,0.5)', marginBottom: '24px' }}>Share these credentials with the coach</p>
                        <div style={{ background: 'rgba(139,92,246,0.1)', border: '1px solid rgba(139,92,246,0.3)', borderRadius: '12px', padding: '20px', textAlign: 'left', marginBottom: '20px' }}>
                            <p style={{ margin: '0 0 8px' }}><strong>Name:</strong> {credentialsData.name}</p>
                            <p style={{ margin: '0 0 8px' }}><strong>Email:</strong> {credentialsData.email}</p>
                            <p style={{ margin: '0 0 8px' }}><strong>Password:</strong> {credentialsData.password}</p>
                            {credentialsData.account_id && <p style={{ margin: 0 }}><strong>Account ID:</strong> {credentialsData.account_id}</p>}
                        </div>
                        <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)', marginBottom: '16px' }}>The coach can log in at /login and will be auto-redirected to their dashboard</p>
                        <button className="btn btn-primary" onClick={() => { setShowCredentials(false); setCredentialsData(null); }}>Done</button>
                    </div>
                </div>
            )}
        </div>
    );
}
