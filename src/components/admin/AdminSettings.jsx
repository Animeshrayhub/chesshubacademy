import { useState, useEffect } from 'react';
import * as bookingApi from '../../api/bookingApi';
import { getFeePlans, updateFeePlans } from '../../api/settingsApi';
import './AdminSettings.css';

export default function AdminSettings() {
    const [settings, setSettings] = useState({
        siteName: 'ChessHub Academy',
        email: 'clubchess259@gmail.com',
        phone: '+91 7008665245',
        address: 'India',
        timezone: 'Asia/Kolkata',
        currency: 'INR',
        emailNotifications: true,
        smsNotifications: false,
        autoConfirm: false,
    });

    const [saved, setSaved] = useState(false);
    const [feePlans, setFeePlans] = useState([]);
    const [feeSaved, setFeeSaved] = useState(false);

    useEffect(() => {
        const stored = localStorage.getItem('siteSettings');
        if (stored) {
            try { setSettings(JSON.parse(stored)); } catch { /* ignore */ }
        }
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

    const handleChange = (field, value) => {
        setSettings(prev => ({ ...prev, [field]: value }));
    };

    const handleSave = () => {
        localStorage.setItem('siteSettings', JSON.stringify(settings));
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
    };

    const handleBackup = async () => {
        let bookings = [];
        try {
            bookings = await bookingApi.getBookings();
        } catch {
            bookings = JSON.parse(localStorage.getItem('demoBookings') || '[]');
        }

        const data = {
            bookings,
            settings,
            timestamp: new Date().toISOString(),
        };

        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `chesshub-backup-${new Date().toISOString().split('T')[0]}.json`;
        a.click();
    };

    const handleRestore = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                try {
                    const data = JSON.parse(event.target.result);
                    if (!data || typeof data !== 'object' || !data.timestamp) {
                        alert('Invalid backup file format');
                        return;
                    }
                    if (data.settings && typeof data.settings === 'object') {
                        setSettings(data.settings);
                        localStorage.setItem('siteSettings', JSON.stringify(data.settings));
                    }
                    alert('Settings restored successfully!');
                } catch {
                    alert('Invalid backup file');
                }
            };
            reader.readAsText(file);
        }
    };

    const handleUpdateFeeplan = (index, field, value) => {
        const updated = [...feePlans];
        if (field === 'sessions' || field === 'price' || field === 'classes_per_week') {
            updated[index][field] = field === 'sessions' ? parseInt(value, 10) : (field === 'price' ? parseInt(value, 10) : parseInt(value, 10));
        } else {
            updated[index][field] = value;
        }
        setFeePlans(updated);
    };

    const handleSaveFeePlans = async () => {
        try {
            await updateFeePlans(feePlans);
            setFeeSaved(true);
            setTimeout(() => setFeeSaved(false), 3000);
        } catch (err) {
            alert('Error saving fee plans: ' + err.message);
        }
    };

    return (
        <div className="admin-settings">
            <h2>Settings & Configuration</h2>

            {/* General Settings */}
            <div className="glass-card settings-section">
                <h3>General Settings</h3>
                <div className="settings-grid">
                    <div className="form-group">
                        <label className="form-label">Site Name</label>
                        <input
                            type="text"
                            value={settings.siteName}
                            onChange={(e) => handleChange('siteName', e.target.value)}
                            className="form-input"
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label">Email</label>
                        <input
                            type="email"
                            value={settings.email}
                            onChange={(e) => handleChange('email', e.target.value)}
                            className="form-input"
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label">Phone</label>
                        <input
                            type="tel"
                            value={settings.phone}
                            onChange={(e) => handleChange('phone', e.target.value)}
                            className="form-input"
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label">Address</label>
                        <input
                            type="text"
                            value={settings.address}
                            onChange={(e) => handleChange('address', e.target.value)}
                            className="form-input"
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label">Timezone</label>
                        <select
                            value={settings.timezone}
                            onChange={(e) => handleChange('timezone', e.target.value)}
                            className="form-input"
                        >
                            <option value="Asia/Kolkata">Asia/Kolkata (IST)</option>
                            <option value="America/New_York">America/New_York (EST)</option>
                            <option value="Europe/London">Europe/London (GMT)</option>
                        </select>
                    </div>

                    <div className="form-group">
                        <label className="form-label">Currency</label>
                        <select
                            value={settings.currency}
                            onChange={(e) => handleChange('currency', e.target.value)}
                            className="form-input"
                        >
                            <option value="INR">INR (₹)</option>
                            <option value="USD">USD ($)</option>
                            <option value="EUR">EUR (€)</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Notification Settings */}
            <div className="glass-card settings-section">
                <h3>Notifications</h3>
                <div className="settings-list">
                    <div className="setting-item">
                        <div className="setting-info">
                            <div className="setting-title">Email Notifications</div>
                            <div className="setting-description">Receive email alerts for new bookings</div>
                        </div>
                        <label className="toggle">
                            <input
                                type="checkbox"
                                checked={settings.emailNotifications}
                                onChange={(e) => handleChange('emailNotifications', e.target.checked)}
                            />
                            <span className="toggle-slider"></span>
                        </label>
                    </div>

                    <div className="setting-item">
                        <div className="setting-info">
                            <div className="setting-title">SMS Notifications</div>
                            <div className="setting-description">Receive SMS alerts for new bookings</div>
                        </div>
                        <label className="toggle">
                            <input
                                type="checkbox"
                                checked={settings.smsNotifications}
                                onChange={(e) => handleChange('smsNotifications', e.target.checked)}
                            />
                            <span className="toggle-slider"></span>
                        </label>
                    </div>

                    <div className="setting-item">
                        <div className="setting-info">
                            <div className="setting-title">Auto-Confirm Bookings</div>
                            <div className="setting-description">Automatically confirm new demo bookings</div>
                        </div>
                        <label className="toggle">
                            <input
                                type="checkbox"
                                checked={settings.autoConfirm}
                                onChange={(e) => handleChange('autoConfirm', e.target.checked)}
                            />
                            <span className="toggle-slider"></span>
                        </label>
                    </div>
                </div>
            </div>

            {/* Training Packages */}
            <div className="glass-card settings-section">
                <h3>Training Packages</h3>
                <p style={{ color: 'rgba(255,255,255,0.6)', marginBottom: '14px', fontSize: '13px' }}>Weekly 2 Classes</p>
                <div style={{ overflowX: 'auto', marginBottom: '20px' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ borderBottom: '2px solid rgba(255,255,255,0.1)' }}>
                                <th style={{ padding: '12px', textAlign: 'left', fontSize: '13px', fontWeight: 600 }}>Sessions</th>
                                <th style={{ padding: '12px', textAlign: 'left', fontSize: '13px', fontWeight: 600 }}>Price (₹)</th>
                                <th style={{ padding: '12px', textAlign: 'left', fontSize: '13px', fontWeight: 600 }}>Classes/Week</th>
                                <th style={{ padding: '12px', textAlign: 'left', fontSize: '13px', fontWeight: 600 }}>Description</th>
                            </tr>
                        </thead>
                        <tbody>
                            {feePlans.map((plan, idx) => (
                                <tr key={idx} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                    <td style={{ padding: '12px' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            <input type="number" value={plan.sessions} min="1"
                                            onChange={e => handleUpdateFeeplan(idx, 'sessions', e.target.value)}
                                            className="form-input" style={{ width: '80px' }} />
                                            {Number(plan.sessions) === 24 && (
                                                <span style={{
                                                    background: 'linear-gradient(90deg, #ffd700, #fbbf24)',
                                                    color: '#0b0b0f',
                                                    borderRadius: '999px',
                                                    padding: '3px 8px',
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
                                    <td style={{ padding: '12px' }}>
                                        <input type="number" value={plan.price} min="0"
                                            onChange={e => handleUpdateFeeplan(idx, 'price', e.target.value)}
                                            className="form-input" style={{ width: '100px' }} />
                                    </td>
                                    <td style={{ padding: '12px' }}>
                                        <input type="number" value={plan.classes_per_week} min="1" max="7"
                                            onChange={e => handleUpdateFeeplan(idx, 'classes_per_week', e.target.value)}
                                            className="form-input" style={{ width: '80px' }} />
                                    </td>
                                    <td style={{ padding: '12px' }}>
                                        <input type="text" value={plan.label || ''}
                                            onChange={e => handleUpdateFeeplan(idx, 'label', e.target.value)}
                                            className="form-input" placeholder="e.g., Beginner Plan" />
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                <button onClick={handleSaveFeePlans} className="btn btn-primary">
                    {feeSaved ? '✓ Fee Plans Saved!' : 'Save Training Packages'}
                </button>
            </div>

            {/* Backup & Restore */}
            <div className="glass-card settings-section">
                <h3>Backup & Restore</h3>
                <div className="backup-actions">
                    <button onClick={handleBackup} className="btn btn-primary">
                        📥 Download Backup
                    </button>
                    <label className="btn btn-secondary">
                        📤 Restore Backup
                        <input
                            type="file"
                            accept=".json"
                            onChange={handleRestore}
                            style={{ display: 'none' }}
                        />
                    </label>
                </div>
                <p className="backup-note">
                    Backup includes all bookings and settings. Restore will overwrite current data.
                </p>
            </div>

            {/* Save Button */}
            <div className="settings-footer">
                <button onClick={handleSave} className="btn btn-primary btn-lg">
                    {saved ? '✓ Saved!' : 'Save Settings'}
                </button>
            </div>
        </div>
    );
}
