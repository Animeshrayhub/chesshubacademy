// Supabase Edge Function: demo-login
// Deploy: supabase functions deploy demo-login
// Handles demo student authentication server-side so passwords are never
// exposed in client-side queries or returned to the browser.

import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.0';

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'authorization, content-type, apikey, x-client-info',
};

/** Constant-time byte comparison — prevents timing attacks. */
function constantTimeEqual(a: Uint8Array, b: Uint8Array): boolean {
    if (a.length !== b.length) return false;
    let result = 0;
    for (let i = 0; i < a.length; i++) {
        result |= a[i] ^ b[i];
    }
    return result === 0;
}

serve(async (req) => {
    if (req.method === 'OPTIONS') {
        return new Response(null, { headers: corsHeaders });
    }

    try {
        const { username, password } = await req.json();

        if (!username || !password) {
            return new Response(JSON.stringify({ error: 'Username and password are required' }), {
                status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            });
        }

        // Admin client — uses service role key, never exposed to browser
        const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
        const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
        const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey);

        // Fetch by username only — password comparison happens below, not in the query
        const { data: student, error } = await supabaseAdmin
            .from('demo_students')
            .select('id, name, email, phone, demo_username, demo_password, demo_date, status, notes, created_at')
            .eq('demo_username', username)
            .in('status', ['pending', 'active'])
            .single();

        // Always run the comparison even on not-found to prevent user enumeration
        const storedPassword = student?.demo_password ?? '';
        const encoder = new TextEncoder();
        const storedBytes = encoder.encode(storedPassword);
        const inputBytes = encoder.encode(password);

        // Pad to equal length for constant-time comparison
        const maxLen = Math.max(storedBytes.length, inputBytes.length);
        const padded1 = new Uint8Array(maxLen);
        const padded2 = new Uint8Array(maxLen);
        padded1.set(storedBytes);
        padded2.set(inputBytes);

        const credentialsValid = !error && !!student && constantTimeEqual(padded1, padded2);

        if (!credentialsValid) {
            return new Response(JSON.stringify({ error: 'Invalid demo credentials' }), {
                status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            });
        }

        // Strip the stored password before returning — never send it to the browser
        const { demo_password: _pw, ...safeStudent } = student;

        return new Response(JSON.stringify({ success: true, data: safeStudent }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });

    } catch (error) {
        const message = error instanceof Error ? error.message : 'Internal server error';
        return new Response(JSON.stringify({ error: message }), {
            status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
    }
});
