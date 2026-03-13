import { useState, lazy, Suspense } from 'react';
import ChessBoard from './ChessBoard/ChessBoard';
import DailyPuzzle from './Puzzles/DailyPuzzle';
import PuzzleStreakTracker from './Puzzles/PuzzleStreakTracker';
import PuzzleLeaderboard from './Puzzles/PuzzleLeaderboard';
import LevelProgressBar from './Gamification/LevelProgressBar';
import DailyChallenges from './Gamification/DailyChallenges';
import FontSizeControl from './Accessibility/FontSizeControl';
import ChessVariants from './Variants/ChessVariants';
import TutorialWalkthrough from './Tutorial/TutorialWalkthrough';
import { useTutorial } from './Tutorial/useTutorial';
import './ChessFeatures.css';

const GameAnalysis = lazy(() => import('./Analysis/GameAnalysis'));
const DemoAssessment = lazy(() => import('./Assessment/DemoAssessment'));
const AntiComputerTraining = lazy(() => import('./Training/AntiComputerTraining'));

export default function ChessFeatures() {
    const [activeTab, setActiveTab] = useState('board');
    const { showTutorial, startTutorial, finishTutorial } = useTutorial();

    return (
        <section className="chess-features-section" id="chess-features">
            <TutorialWalkthrough run={showTutorial} onFinish={finishTutorial} />

            <div className="container">
                <div className="features-header">
                    <h1>🎮 Interactive Chess Features</h1>
                    <p>Practice, learn, and improve your game with our advanced chess tools</p>
                </div>

                {/* Level Progress Bar - Always Visible */}
                <LevelProgressBar />

                {/* Font Size Control - Accessibility */}
                <div style={{ marginTop: 'var(--spacing-xl)', marginBottom: 'var(--spacing-xl)' }}>
                    <FontSizeControl />
                </div>

                <div className="features-tabs">
                    <button
                        className={`tab-btn ${activeTab === 'board' ? 'active' : ''}`}
                        onClick={() => setActiveTab('board')}
                    >
                        ♟️ Chess Board
                    </button>
                    <button
                        className={`tab-btn ${activeTab === 'puzzle' ? 'active' : ''}`}
                        onClick={() => setActiveTab('puzzle')}
                    >
                        🧩 Daily Puzzle
                    </button>
                    <button
                        className={`tab-btn ${activeTab === 'streak' ? 'active' : ''}`}
                        onClick={() => setActiveTab('streak')}
                    >
                        🔥 Streak Tracker
                    </button>
                    <button
                        className={`tab-btn ${activeTab === 'challenges' ? 'active' : ''}`}
                        onClick={() => setActiveTab('challenges')}
                    >
                        🎯 Daily Challenges
                    </button>
                    <button
                        className={`tab-btn ${activeTab === 'leaderboard' ? 'active' : ''}`}
                        onClick={() => setActiveTab('leaderboard')}
                    >
                        🏆 Leaderboard
                    </button>
                    <button
                        className={`tab-btn ${activeTab === 'variants' ? 'active' : ''}`}
                        onClick={() => setActiveTab('variants')}
                    >
                        ♟️ Variants
                    </button>
                    <button
                        className={`tab-btn ${activeTab === 'analysis' ? 'active' : ''}`}
                        onClick={() => setActiveTab('analysis')}
                    >
                        🤖 AI Analysis
                    </button>
                    <button
                        className={`tab-btn ${activeTab === 'demo' ? 'active' : ''}`}
                        onClick={() => setActiveTab('demo')}
                    >
                        📋 Demo Assessment
                    </button>
                    <button
                        className={`tab-btn ${activeTab === 'training' ? 'active' : ''}`}
                        onClick={() => setActiveTab('training')}
                    >
                        🎯 Anti-Engine
                    </button>
                </div>

                <div className="features-content">
                    {activeTab === 'board' && (
                        <div className="feature-panel">
                            <div className="panel-header">
                                <h2>Interactive Chess Board</h2>
                                <p>Practice freely with full drag-and-drop functionality</p>
                            </div>
                            <ChessBoard
                                showNotation={true}
                                interactive={true}
                            />
                            <div className="feature-info">
                                <h4>✨ Features:</h4>
                                <ul>
                                    <li>✅ Drag and drop pieces</li>
                                    <li>✅ Legal move highlighting</li>
                                    <li>✅ Move history tracking</li>
                                    <li>✅ Undo/Reset functionality</li>
                                    <li>✅ Mobile touch support</li>
                                </ul>
                            </div>
                        </div>
                    )}

                    {activeTab === 'puzzle' && (
                        <div className="feature-panel">
                            <div className="panel-header">
                                <h2>Daily Chess Puzzle</h2>
                                <p>Sharpen your tactical skills with fresh challenges</p>
                            </div>
                            <DailyPuzzle />
                            <div className="feature-info">
                                <h4>✨ Features:</h4>
                                <ul>
                                    <li>✅ New puzzle daily from Lichess</li>
                                    <li>✅ Solution validation</li>
                                    <li>✅ XP rewards (+10 per solve)</li>
                                    <li>✅ Hint system</li>
                                    <li>✅ Attempt tracking</li>
                                </ul>
                            </div>
                        </div>
                    )}

                    {activeTab === 'streak' && (
                        <div className="feature-panel">
                            <div className="panel-header">
                                <h2>Puzzle Streak Tracker</h2>
                                <p>Track your consistency and unlock milestones</p>
                            </div>
                            <PuzzleStreakTracker />
                            <div className="feature-info">
                                <h4>✨ Features:</h4>
                                <ul>
                                    <li>✅ Current streak display</li>
                                    <li>✅ Best streak record</li>
                                    <li>✅ Total puzzles solved</li>
                                    <li>✅ Milestone badges (3, 7, 30 days)</li>
                                    <li>✅ Progress bar to next goal</li>
                                </ul>
                            </div>
                        </div>
                    )}

                    {activeTab === 'challenges' && (
                        <div className="feature-panel">
                            <div className="panel-header">
                                <h2>Daily Challenges</h2>
                                <p>Complete daily tasks to earn bonus XP and build streaks</p>
                            </div>
                            <DailyChallenges />
                            <div className="feature-info">
                                <h4>✨ Features:</h4>
                                <ul>
                                    <li>✅ 3 daily challenges</li>
                                    <li>✅ +100 XP bonus for completing all</li>
                                    <li>✅ Daily streak system</li>
                                    <li>✅ Streak bonuses (3, 7, 30 days)</li>
                                    <li>✅ Auto-reset at midnight</li>
                                </ul>
                            </div>
                        </div>
                    )}

                    {activeTab === 'leaderboard' && (
                        <div className="feature-panel">
                            <div className="panel-header">
                                <h2>Puzzle Leaderboard</h2>
                                <p>Compete with other players and climb the ranks</p>
                            </div>
                            <PuzzleLeaderboard />
                            <div className="feature-info">
                                <h4>✨ Features:</h4>
                                <ul>
                                    <li>✅ Top 10 rankings with medals</li>
                                    <li>✅ Daily/Weekly/Monthly/All-Time periods</li>
                                    <li>✅ Your rank tracking</li>
                                    <li>✅ Score and streak display</li>
                                    <li>✅ Real-time updates</li>
                                </ul>
                            </div>
                        </div>
                    )}

                    {activeTab === 'variants' && (
                        <div className="feature-panel">
                            <div className="panel-header">
                                <h2>Chess Variants</h2>
                                <p>Explore different ways to play chess and master new strategies</p>
                            </div>
                            <ChessVariants />
                            <div className="feature-info">
                                <h4>✨ Available Variants:</h4>
                                <ul>
                                    <li>✅ Chess960 (Fischer Random)</li>
                                    <li>✅ Three-Check Chess</li>
                                    <li>✅ King of the Hill</li>
                                    <li>✅ Crazyhouse</li>
                                    <li>✅ Atomic Chess</li>
                                    <li>✅ Horde</li>
                                </ul>
                            </div>
                        </div>
                    )}

                    {activeTab === 'analysis' && (
                        <div className="feature-panel">
                            <Suspense fallback={<div className="lazy-loading">Loading Analysis...</div>}>
                                <GameAnalysis />
                            </Suspense>
                        </div>
                    )}

                    {activeTab === 'demo' && (
                        <div className="feature-panel">
                            <Suspense fallback={<div className="lazy-loading">Loading Assessment...</div>}>
                                <DemoAssessment />
                            </Suspense>
                        </div>
                    )}

                    {activeTab === 'training' && (
                        <div className="feature-panel">
                            <Suspense fallback={<div className="lazy-loading">Loading Training...</div>}>
                                <AntiComputerTraining />
                            </Suspense>
                        </div>
                    )}
                </div>

                <div className="coming-soon">
                    <h3>🚀 Marketing & Admin Features</h3>
                    <p>Analytics dashboard, email campaigns, and lead management coming with backend integration</p>
                </div>
            </div>
        </section>
    );
}
