// Supabase Edge Function: send-email
// Deploy: supabase functions deploy send-email
// Set secrets: supabase secrets set RESEND_API_KEY=your_key
//
// This file is a template. Copy it to supabase/functions/send-email/index.ts
// and deploy to your Supabase project.

import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY');
const FROM_EMAIL = Deno.env.get('FROM_EMAIL') || 'ChessHub Academy <noreply@chesshub.academy>';

const TEMPLATES = {
    demo_booking: (data) => ({
        subject: 'Demo Booking Confirmed – ChessHub Academy',
        html: `
            <h2>Hi ${data.name}!</h2>
            <p>Your demo booking has been confirmed for <strong>${data.date}</strong>.</p>
            <p>Our team will reach out to you shortly with the meeting details.</p>
            <p>– ChessHub Academy</p>
        `,
    }),
    session_reminder: (data) => ({
        subject: `Session Reminder: ${data.sessionTitle}`,
        html: `
            <h2>Hi ${data.name}!</h2>
            <p>You have an upcoming session: <strong>${data.sessionTitle}</strong></p>
            <p>📅 Date: ${data.date}<br>🕐 Time: ${data.time}</p>
            ${data.meetingLink ? `<p><a href="${data.meetingLink}">Join Meeting</a></p>` : ''}
            <p>– ChessHub Academy</p>
        `,
    }),
    ebook_approval: (data) => ({
        subject: `Your Ebook is Ready: ${data.ebookTitle}`,
        html: `
            <h2>Hi ${data.name}!</h2>
            <p>Your purchase of <strong>${data.ebookTitle}</strong> has been approved!</p>
            <p><a href="${data.downloadLink}">Download your ebook</a></p>
            <p>– ChessHub Academy</p>
        `,
    }),
    tournament_confirmation: (data) => ({
        subject: `Tournament Registration: ${data.tournamentTitle}`,
        html: `
            <h2>Hi ${data.name}!</h2>
            <p>You're registered for <strong>${data.tournamentTitle}</strong> on ${data.date}.</p>
            <p>We'll share the tournament details closer to the event.</p>
            <p>– ChessHub Academy</p>
        `,
    }),
    progress_report: (data) => ({
        subject: `Progress Report: ${data.studentName} – ${data.reportPeriod}`,
        html: `
            <h2>Dear ${data.parentName},</h2>
            <p>Here's the progress report for <strong>${data.studentName}</strong> for ${data.reportPeriod}:</p>
            <ul>
                <li>Attendance: ${data.attendance_pct || 0}%</li>
                <li>Sessions: ${data.sessions_attended || 0}/${data.sessions_total || 0}</li>
                <li>Puzzles Solved: ${data.puzzles_solved || 0}</li>
                <li>Rating: ${data.rating_start || 0} → ${data.rating_end || 0}</li>
            </ul>
            ${data.coach_notes ? `<p><strong>Coach Notes:</strong> ${data.coach_notes}</p>` : ''}
            <p>– ChessHub Academy</p>
        `,
    }),
    welcome: (data) => ({
        subject: 'Welcome to ChessHub Academy!',
        html: `
            <h2>Welcome, ${data.name}!</h2>
            <p>Your ChessHub Academy account is ready.</p>
            <p>Start by exploring our courses, solving puzzles, and joining tournaments!</p>
            <p>– ChessHub Academy Team</p>
        `,
    }),
};

serve(async (req) => {
    if (req.method === 'OPTIONS') {
        return new Response(null, {
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'POST',
                'Access-Control-Allow-Headers': 'authorization, content-type',
            },
        });
    }

    // Verify the caller has an authenticated user session (not just an anon key)
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
        return new Response(JSON.stringify({ error: 'Authorization header required' }), {
            status: 401,
            headers: { 'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json' },
        });
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    const { createClient } = await import('https://esm.sh/@supabase/supabase-js@2.39.0');
    const authClient = createClient(supabaseUrl, supabaseAnonKey, {
        global: { headers: { Authorization: authHeader } },
    });
    const { data: { user } } = await authClient.auth.getUser();
    if (!user) {
        return new Response(JSON.stringify({ error: 'Authenticated session required' }), {
            status: 401,
            headers: { 'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json' },
        });
    }

    try {
        const { type, to, data } = await req.json();

        if (!RESEND_API_KEY) {
            console.log(`[Email] Mock send: ${type} to ${to}`);
            return new Response(JSON.stringify({ success: true, mock: true }), {
                headers: { 'Content-Type': 'application/json' },
            });
        }

        const template = TEMPLATES[type];
        if (!template) {
            return new Response(JSON.stringify({ error: 'Unknown email type' }), { status: 400 });
        }

        const { subject, html } = template(data);

        const res = await fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${RESEND_API_KEY}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ from: FROM_EMAIL, to: [to], subject, html }),
        });

        const result = await res.json();
        return new Response(JSON.stringify(result), {
            headers: { 'Content-Type': 'application/json' },
        });
    } catch (error) {
        const message = error instanceof Error ? error.message : 'Internal server error';
        return new Response(JSON.stringify({ error: message }), { status: 500 });
    }
});
