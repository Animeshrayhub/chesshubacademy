/**
 * Email Automation Service
 * Automated email sequences triggered by user actions.
 * Uses the existing emailService sendEmail infrastructure.
 */

import { supabase } from './supabase';

const EDGE_FUNCTION_URL = import.meta.env.VITE_SUPABASE_URL
    ? `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/send-email`
    : null;

async function sendAutomatedEmail(payload) {
    if (!EDGE_FUNCTION_URL || !supabase) {
        console.log('[EmailAutomation] Would send:', payload.type, 'to', payload.to);
        return { success: true, mock: true };
    }
    try {
        const { data: { session } } = await supabase.auth.getSession();
        const response = await fetch(EDGE_FUNCTION_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${session?.access_token || import.meta.env.VITE_SUPABASE_ANON_KEY}`,
            },
            body: JSON.stringify(payload),
        });
        if (!response.ok) {
            const err = await response.text();
            console.error('[EmailAutomation] Failed:', err);
            return { success: false, error: err };
        }
        return { success: true };
    } catch (error) {
        console.error('[EmailAutomation] Error:', error);
        return { success: false, error: error.message };
    }
}

// Sequence 1: Demo Lead
export function sendDemoLeadEmail(email, name) {
    return sendAutomatedEmail({
        type: 'demo_lead',
        to: email,
        subject: 'Your Free Chess Demo Class – ChessHub Academy',
        data: {
            name,
            message: `Hi ${name},\n\nThanks for your interest in ChessHub Academy!\n\nYour free demo class is the first step to improving your chess. Our expert coaches will:\n\n• Assess your current skill level\n• Show you personalized training methods\n• Create a custom improvement plan\n\nBook your demo class here:\nhttps://chesshubacademy.com/#booking\n\nSee you on the board!\n— ChessHub Academy Team`,
        },
    });
}

// Sequence 2: Tournament Follow-up
export function sendTournamentFollowUpEmail(email, name, tournamentName) {
    return sendAutomatedEmail({
        type: 'tournament_followup',
        to: email,
        subject: 'Improve Your Chess After the Tournament – ChessHub Academy',
        data: {
            name,
            tournamentName,
            message: `Hi ${name},\n\nThanks for participating in ${tournamentName}!\n\nWant to improve your tournament performance? Our coaches can help you:\n\n• Analyze your games\n• Fix tactical weaknesses\n• Build a solid opening repertoire\n\nBook a free demo class:\nhttps://chesshubacademy.com/#booking\n\n— ChessHub Academy Team`,
        },
    });
}

// Sequence 3: Blog/Weekly Tips
export function sendWeeklyTipsEmail(email, name) {
    return sendAutomatedEmail({
        type: 'weekly_tips',
        to: email,
        subject: 'Weekly Chess Training Tips – ChessHub Academy',
        data: {
            name,
            message: `Hi ${name},\n\nHere are this week's chess training tips:\n\n1. Solve at least 5 puzzles daily\n2. Review your lost games\n3. Practice one opening line thoroughly\n\nRead more tips on our blog:\nhttps://chesshubacademy.com/blog\n\nTrain with our coaches:\nhttps://chesshubacademy.com/#booking\n\n— ChessHub Academy Team`,
        },
    });
}
