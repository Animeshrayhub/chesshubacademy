/**
 * XP System - Gamification logic
 * Handles XP earning, level calculation, and reward distribution.
 * XP is written to localStorage immediately for instant UI updates,
 * and persisted to Supabase user_stats asynchronously.
 */

import { supabase } from '../services/supabase';
import { updateUserStats } from '../api/statsApi';

// XP earning rules
export const XP_REWARDS = {
    PUZZLE_SOLVED: 10,
    GAME_WON: 50,
    GAME_DRAWN: 25,
    LESSON_COMPLETED: 30,
    DAILY_CHALLENGE: 100,
    STREAK_BONUS_3: 50,
    STREAK_BONUS_7: 150,
    STREAK_BONUS_30: 500,
    FIRST_PUZZLE: 20,
    FIRST_WIN: 100
};

// Level thresholds (exponential growth)
export const LEVEL_THRESHOLDS = [
    0,      // Level 1
    100,    // Level 2
    250,    // Level 3
    450,    // Level 4
    700,    // Level 5
    1000,   // Level 6
    1350,   // Level 7
    1750,   // Level 8
    2200,   // Level 9
    2700,   // Level 10
    3250,   // Level 11
    3850,   // Level 12
    4500,   // Level 13
    5200,   // Level 14
    5950,   // Level 15
    6750,   // Level 16
    7600,   // Level 17
    8500,   // Level 18
    9450,   // Level 19
    10450   // Level 20
];

/**
 * Get user's current XP
 */
export function getUserXP() {
    return parseInt(localStorage.getItem('userXP') || '0');
}

/**
 * Get user's current level
 */
export function getUserLevel() {
    return parseInt(localStorage.getItem('userLevel') || '1');
}

/**
 * Calculate level from XP
 */
export function calculateLevel(xp) {
    for (let i = LEVEL_THRESHOLDS.length - 1; i >= 0; i--) {
        if (xp >= LEVEL_THRESHOLDS[i]) {
            return i + 1;
        }
    }
    return 1;
}

/**
 * Get XP needed for next level
 */
export function getXPForNextLevel(currentLevel) {
    if (currentLevel >= LEVEL_THRESHOLDS.length) {
        const lastThreshold = LEVEL_THRESHOLDS[LEVEL_THRESHOLDS.length - 1];
        const increment = 1000;
        return lastThreshold + ((currentLevel - LEVEL_THRESHOLDS.length) * increment);
    }
    return LEVEL_THRESHOLDS[currentLevel];
}

/**
 * Get XP needed for current level
 */
export function getXPForCurrentLevel(currentLevel) {
    if (currentLevel <= 1) return 0;
    return LEVEL_THRESHOLDS[currentLevel - 2];
}

/**
 * Award XP to user
 * @param {number} amount - Amount of XP to award
 * @param {string} reason - Reason for XP gain
 * @returns {Object} - { newXP, newLevel, leveledUp, xpGained }
 */
export function awardXP(amount, reason = '') {
    const currentXP = getUserXP();
    const currentLevel = getUserLevel();
    const newXP = currentXP + amount;
    const newLevel = calculateLevel(newXP);
    const leveledUp = newLevel > currentLevel;

    // Immediate localStorage update for instant UI feedback
    localStorage.setItem('userXP', newXP.toString());
    localStorage.setItem('userLevel', newLevel.toString());

    if (leveledUp) {
        const event = new CustomEvent('levelup', {
            detail: { oldLevel: currentLevel, newLevel, xpGained: amount }
        });
        window.dispatchEvent(event);
    }

    // Persist to Supabase asynchronously — fire-and-forget, never blocks UI
    if (supabase) {
        supabase.auth.getUser().then(({ data: { user } }) => {
            if (user) {
                updateUserStats(user.id, {
                    xp: newXP,
                    level: newLevel,
                }).catch(() => {});
            }
        }).catch(() => {});
    }

    return {
        newXP,
        newLevel,
        leveledUp,
        xpGained: amount,
        reason
    };
}

/**
 * Get progress to next level (0-100)
 */
export function getLevelProgress() {
    const xp = getUserXP();
    const level = getUserLevel();
    const currentLevelXP = getXPForCurrentLevel(level);
    const nextLevelXP = getXPForNextLevel(level);
    const progressXP = xp - currentLevelXP;
    const requiredXP = nextLevelXP - currentLevelXP;

    return Math.min(100, Math.max(0, (progressXP / requiredXP) * 100));
}

/**
 * Get all user stats
 */
export function getUserStats() {
    return {
        xp: getUserXP(),
        level: getUserLevel(),
        progress: getLevelProgress(),
        nextLevelXP: getXPForNextLevel(getUserLevel()),
        currentLevelXP: getXPForCurrentLevel(getUserLevel()),
        puzzleStreak: parseInt(localStorage.getItem('puzzleStreak') || '0'),
        totalPuzzlesSolved: parseInt(localStorage.getItem('totalPuzzlesSolved') || '0'),
        gamesWon: parseInt(localStorage.getItem('gamesWon') || '0'),
        gamesPlayed: parseInt(localStorage.getItem('gamesPlayed') || '0')
    };
}

/**
 * Reset user stats (for testing)
 */
export function resetUserStats() {
    localStorage.setItem('userXP', '0');
    localStorage.setItem('userLevel', '1');
    localStorage.setItem('puzzleStreak', '0');
    localStorage.setItem('totalPuzzlesSolved', '0');
    localStorage.setItem('gamesWon', '0');
    localStorage.setItem('gamesPlayed', '0');
}

export default {
    XP_REWARDS,
    LEVEL_THRESHOLDS,
    getUserXP,
    getUserLevel,
    calculateLevel,
    getXPForNextLevel,
    getXPForCurrentLevel,
    awardXP,
    getLevelProgress,
    getUserStats,
    resetUserStats
};
