/**
 * Email notification service using Supabase Edge Functions.
 * Configure RESEND_API_KEY or SENDGRID_API_KEY in Supabase secrets.
 * 
 * Each function calls a Supabase Edge Function endpoint.
 * If edge functions aren't deployed, emails are logged to console.
 */

import { supabase } from '../services/supabase';

const EDGE_FUNCTION_URL = import.meta.env.VITE_SUPABASE_URL
    ? `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/send-email`
    : null;

async function sendEmail(payload) {
    if (!EDGE_FUNCTION_URL || !supabase) {
        console.log('[Email] Would send:', payload.type, 'to', payload.to);
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
            console.error('[Email] Failed:', err);
            return { success: false, error: err };
        }

        return { success: true };
    } catch (error) {
        console.error('[Email] Error:', error);
        return { success: false, error: error.message };
    }
}

export function sendDemoBookingConfirmation(email, name, date) {
    return sendEmail({
        type: 'demo_booking',
        to: email,
        subject: 'Demo Booking Confirmed – ChessHub Academy',
        data: { name, date },
    });
}

export function sendSessionReminder(email, name, sessionTitle, date, time, meetingLink) {
    return sendEmail({
        type: 'session_reminder',
        to: email,
        subject: `Session Reminder: ${sessionTitle} – ChessHub Academy`,
        data: { name, sessionTitle, date, time, meetingLink },
    });
}

export function sendEbookApproval(email, name, ebookTitle, downloadLink) {
    return sendEmail({
        type: 'ebook_approval',
        to: email,
        subject: `Your Ebook is Ready: ${ebookTitle} – ChessHub`,
        data: { name, ebookTitle, downloadLink },
    });
}

export function sendTournamentConfirmation(email, name, tournamentTitle, date) {
    return sendEmail({
        type: 'tournament_confirmation',
        to: email,
        subject: `Tournament Registration Confirmed: ${tournamentTitle}`,
        data: { name, tournamentTitle, date },
    });
}

export function sendProgressReport(email, parentName, studentName, reportPeriod, reportData) {
    return sendEmail({
        type: 'progress_report',
        to: email,
        subject: `Progress Report for ${studentName} – ${reportPeriod}`,
        data: { parentName, studentName, reportPeriod, ...reportData },
    });
}

export function sendWelcomeEmail(email, name) {
    return sendEmail({
        type: 'welcome',
        to: email,
        subject: 'Welcome to ChessHub Academy!',
        data: { name },
    });
}
