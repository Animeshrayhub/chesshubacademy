import { useState, useEffect } from 'react';
import Joyride from 'react-joyride';
import './TutorialWalkthrough.css';

export default function TutorialWalkthrough({ run, onFinish }) {
    const [runTour, setRunTour] = useState(run);

    useEffect(() => {
        setRunTour(run);
    }, [run]);

    const steps = [
        {
            target: '.level-progress-container',
            content: '🎮 Track your progress here! Earn XP by solving puzzles and completing challenges to level up.',
            disableBeacon: true,
        },
        {
            target: '.features-tabs',
            content: '🎯 Explore different chess features using these tabs. Each tab offers unique ways to improve your game!',
        },
        {
            target: '.tab-btn:first-child',
            content: '♟️ Practice on our interactive chess board with drag-and-drop pieces and legal move highlighting.',
        },
        {
            target: '.tab-btn:nth-child(2)',
            content: '🧩 Solve daily puzzles from Lichess to sharpen your tactical skills and earn XP!',
        },
        {
            target: '.tab-btn:nth-child(3)',
            content: '🔥 Build streaks by solving puzzles consistently. Unlock milestone badges at 3, 7, and 30 days!',
        },
        {
            target: '.tab-btn:nth-child(4)',
            content: '🎯 Complete 3 daily challenges to earn bonus XP and build your daily streak!',
        },
        {
            target: '.tab-btn:nth-child(5)',
            content: '🏆 Compete with other players on the leaderboard and climb the rankings!',
        },
        {
            target: '.font-size-control',
            content: '🔤 Adjust text size for better readability using these accessibility controls.',
        },
        {
            target: 'body',
            content: '✨ You\'re all set! Start solving puzzles, complete challenges, and watch your level grow. Good luck! 🚀',
            placement: 'center',
        },
    ];

    const handleJoyrideCallback = (data) => {
        const { status } = data;
        const finishedStatuses = ['finished', 'skipped'];

        if (finishedStatuses.includes(status)) {
            setRunTour(false);
            localStorage.setItem('tutorialCompleted', 'true');
            if (onFinish) onFinish();
        }
    };

    return (
        <Joyride
            steps={steps}
            run={runTour}
            continuous
            showProgress
            showSkipButton
            callback={handleJoyrideCallback}
            styles={{
                options: {
                    primaryColor: '#8b5cf6',
                    textColor: '#fff',
                    backgroundColor: '#1a1a2e',
                    overlayColor: 'rgba(0, 0, 0, 0.7)',
                    arrowColor: '#1a1a2e',
                    zIndex: 10000,
                },
                buttonNext: {
                    backgroundColor: '#8b5cf6',
                    borderRadius: '8px',
                    padding: '10px 20px',
                },
                buttonBack: {
                    color: '#8b5cf6',
                },
                buttonSkip: {
                    color: '#ef4444',
                },
                tooltip: {
                    borderRadius: '12px',
                    padding: '20px',
                },
            }}
            locale={{
                back: '← Back',
                close: 'Close',
                last: 'Finish',
                next: 'Next →',
                skip: 'Skip Tour',
            }}
        />
    );
}

// Hook to manage tutorial state
