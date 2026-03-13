import { useState, useEffect } from 'react';
import { getUserStats, getLevelProgress } from '../../utils/XPSystem';
import './LevelProgressBar.css';

export default function LevelProgressBar() {
    const [stats, setStats] = useState(getUserStats());
    const [showLevelUp, setShowLevelUp] = useState(false);

    useEffect(() => {
        // Listen for level up events
        const handleLevelUp = (event) => {
            setShowLevelUp(true);
            setTimeout(() => setShowLevelUp(false), 3000);
            playLevelUpSound();
        };

        window.addEventListener('levelup', handleLevelUp);

        // Update stats periodically
        const interval = setInterval(() => {
            setStats(getUserStats());
        }, 1000);

        return () => {
            window.removeEventListener('levelup', handleLevelUp);
            clearInterval(interval);
        };
    }, []);

    function playLevelUpSound() {
        // Optional: Play sound effect
        try {
            const audio = new Audio('/level-up.mp3');
            audio.volume = 0.3;
            audio.play().catch(() => { });
        } catch { /* ignore audio play errors */ }
    }

    const progress = getLevelProgress();

    return (
        <div className="level-progress-container">
            <div className="level-header">
                <div className="level-badge">
                    <div className="level-icon">
                        {stats.level < 10 ? '🥉' : stats.level < 20 ? '🥈' : stats.level < 50 ? '🥇' : '👑'}
                    </div>
                    <div className="level-info">
                        <div className="level-label">Level</div>
                        <div className="level-number">{stats.level}</div>
                    </div>
                </div>

                <div className="xp-info">
                    <div className="xp-current">{stats.xp.toLocaleString()} XP</div>
                    <div className="xp-next">
                        {(stats.nextLevelXP - stats.xp).toLocaleString()} to next level
                    </div>
                </div>
            </div>

            <div className="progress-bar-container">
                <div className="progress-bar">
                    <div
                        className="progress-fill"
                        style={{ width: `${progress}%` }}
                    >
                        <div className="progress-shine"></div>
                    </div>
                </div>
                <div className="progress-percentage">{Math.floor(progress)}%</div>
            </div>

            {showLevelUp && (
                <div className="level-up-animation">
                    <div className="level-up-content">
                        <div className="level-up-icon">🎉</div>
                        <div className="level-up-text">LEVEL UP!</div>
                        <div className="level-up-level">Level {stats.level}</div>
                    </div>
                </div>
            )}
        </div>
    );
}
