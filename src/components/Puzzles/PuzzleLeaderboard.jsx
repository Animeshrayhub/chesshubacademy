import { useState, useEffect } from 'react';
import { getLeaderboard } from '../../api/leaderboardApi';
import './PuzzleLeaderboard.css';

export default function PuzzleLeaderboard() {
    const [period, setPeriod] = useState('all-time');
    const [leaderboard, setLeaderboard] = useState([]);
    const [userRank, setUserRank] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadLeaderboard();
    }, [period]);

    async function loadLeaderboard() {
        setLoading(true);
        const data = await getLeaderboard(period);
        setLeaderboard(data);
        setLoading(false);

        // Calculate user's rank based on their XP
        const userScore = parseInt(localStorage.getItem('userXP') || '0');
        const userStreakVal = parseInt(localStorage.getItem('puzzleStreak') || '0');

        if (userScore > 0) {
            const rank = data.filter(u => u.score > userScore).length + 1;
            setUserRank({
                rank,
                name: 'You',
                score: userScore,
                streak: userStreakVal,
                avatar: '🎮'
            });
        }
    }

    return (
        <div className="puzzle-leaderboard">
            <div className="leaderboard-header">
                <h2>🏆 Puzzle Leaderboard</h2>
                <div className="period-selector">
                    <button
                        className={`period-btn ${period === 'daily' ? 'active' : ''}`}
                        onClick={() => setPeriod('daily')}
                    >
                        Daily
                    </button>
                    <button
                        className={`period-btn ${period === 'weekly' ? 'active' : ''}`}
                        onClick={() => setPeriod('weekly')}
                    >
                        Weekly
                    </button>
                    <button
                        className={`period-btn ${period === 'monthly' ? 'active' : ''}`}
                        onClick={() => setPeriod('monthly')}
                    >
                        Monthly
                    </button>
                    <button
                        className={`period-btn ${period === 'all-time' ? 'active' : ''}`}
                        onClick={() => setPeriod('all-time')}
                    >
                        All Time
                    </button>
                </div>
            </div>

            <div className="leaderboard-table">
                <div className="table-header">
                    <div className="col-rank">Rank</div>
                    <div className="col-player">Player</div>
                    <div className="col-score">Score</div>
                    <div className="col-streak">Streak</div>
                </div>

                {loading ? (
                    <div className="table-body" style={{ textAlign: 'center', padding: '2rem' }}>
                        Loading leaderboard...
                    </div>
                ) : leaderboard.length === 0 ? (
                    <div className="table-body" style={{ textAlign: 'center', padding: '2rem' }}>
                        No leaderboard data yet. Be the first to play!
                    </div>
                ) : (

                <div className="table-body">
                    {leaderboard.map((entry) => (
                        <div
                            key={entry.rank}
                            className={`table-row ${entry.rank <= 3 ? `top-${entry.rank}` : ''}`}
                        >
                            <div className="col-rank">
                                {entry.rank <= 3 ? (
                                    <span className="rank-medal">
                                        {entry.rank === 1 ? '🥇' : entry.rank === 2 ? '🥈' : '🥉'}
                                    </span>
                                ) : (
                                    <span className="rank-number">#{entry.rank}</span>
                                )}
                            </div>
                            <div className="col-player">
                                <span className="player-avatar">{entry.avatar}</span>
                                <span className="player-name">{entry.name}</span>
                            </div>
                            <div className="col-score">{entry.score.toLocaleString()}</div>
                            <div className="col-streak">
                                <span className="streak-badge">{entry.streak} 🔥</span>
                            </div>
                        </div>
                    ))}
                </div>
                )}
            </div>

            {userRank && userRank.rank > 10 && (
                <div className="user-rank-card">
                    <div className="rank-label">Your Rank</div>
                    <div className="table-row user-row">
                        <div className="col-rank">
                            <span className="rank-number">#{userRank.rank}</span>
                        </div>
                        <div className="col-player">
                            <span className="player-avatar">{userRank.avatar}</span>
                            <span className="player-name">{userRank.name}</span>
                        </div>
                        <div className="col-score">{userRank.score.toLocaleString()}</div>
                        <div className="col-streak">
                            <span className="streak-badge">{userRank.streak} 🔥</span>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
