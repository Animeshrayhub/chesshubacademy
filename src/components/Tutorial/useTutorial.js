import { useState, useEffect } from 'react';

export function useTutorial() {
    const [showTutorial, setShowTutorial] = useState(false);

    useEffect(() => {
        const completed = localStorage.getItem('tutorialCompleted');
        if (!completed) {
            // Show tutorial after a short delay
            setTimeout(() => setShowTutorial(true), 1000);
        }
    }, []);

    const startTutorial = () => setShowTutorial(true);
    const resetTutorial = () => {
        localStorage.removeItem('tutorialCompleted');
        setShowTutorial(true);
    };

    return {
        showTutorial,
        startTutorial,
        resetTutorial,
        finishTutorial: () => setShowTutorial(false),
    };
}
