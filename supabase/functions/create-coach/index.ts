// Supabase Edge Function: create-coach
// Deploy: supabase functions deploy create-coach
// This creates a Supabase auth user with coach role.
// Uses the auto-available SUPABASE_SERVICE_ROLE_KEY (server-side only).

import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.0';

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'authorization, content-type, apikey, x-client-info',
};

function bytesToBase64(bytes: Uint8Array): string {
    let binary = '';
    for (let i = 0; i < bytes.length; i++) {
        binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
}

async function hashPassword(password: string): Promise<string> {
    const enc = new TextEncoder();
    const salt = crypto.getRandomValues(new Uint8Array(16));
    const keyMaterial = await crypto.subtle.importKey('raw', enc.encode(password), 'PBKDF2', false, ['deriveBits']);
    const bits = await crypto.subtle.deriveBits(
        { name: 'PBKDF2', salt, iterations: 100000, hash: 'SHA-256' },
        keyMaterial,
        256,
    );
    const hash = new Uint8Array(bits);
    return `pbkdf2$100000$${bytesToBase64(salt)}$${bytesToBase64(hash)}`;
}

async function nextAccountId(supabaseAdmin: any, role: 'student' | 'coach'): Promise<string> {
    const prefix = role === 'student' ? 'CHS-' : 'CHC-';
    const start = role === 'student' ? 1001 : 201;

    const { data } = await supabaseAdmin
        .from('users')
        .select('account_id')
        .eq('role', role)
        .order('created_at', { ascending: false })
        .limit(500);

    const maxUsed = (data || []).reduce((max: number, row: any) => {
        const accountId = row?.account_id || '';
        const match = String(accountId).match(/(\d+)$/);
        if (!match) return max;
        const value = Number(match[1]);
        return Number.isFinite(value) ? Math.max(max, value) : max;
    }, 0);

    const nextValue = Math.max(start, maxUsed + 1);
    return `${prefix}${nextValue}`;
}

serve(async (req) => {
    if (req.method === 'OPTIONS') {
        return new Response(null, { headers: corsHeaders });
    }

    try {
        // Verify the caller is an admin
        const authHeader = req.headers.get('Authorization');
        if (!authHeader) {
            return new Response(JSON.stringify({ error: 'No authorization header' }), {
                status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            });
        }

        // Create admin client with service role key
        const supabaseUrl = Deno.env.get('SUPABASE_URL');
        const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

        const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey);

        // Verify caller is admin using the anon client
        const anonKey = Deno.env.get('SUPABASE_ANON_KEY');
        const supabaseAnon = createClient(supabaseUrl, anonKey, {
            global: { headers: { Authorization: authHeader } },
        });
        const { data: { user: caller }, error: callerError } = await supabaseAnon.auth.getUser();
        if (callerError || !caller) {
            return new Response(JSON.stringify({ error: 'Invalid session' }), {
                status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            });
        }

        const callerRole = caller.user_metadata?.role || caller.app_metadata?.role;
        if (callerRole !== 'admin') {
            return new Response(JSON.stringify({ error: 'Admin access required' }), {
                status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            });
        }

        // Parse request body
        const { email, password, full_name } = await req.json();

        if (!email || !password) {
            return new Response(JSON.stringify({ error: 'Email and password are required' }), {
                status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            });
        }

        if (password.length < 6) {
            return new Response(JSON.stringify({ error: 'Password must be at least 6 characters' }), {
                status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            });
        }

        const accountId = await nextAccountId(supabaseAdmin, 'coach');

        // Create auth user with coach role
        const { data, error } = await supabaseAdmin.auth.admin.createUser({
            email,
            password,
            email_confirm: true,
            user_metadata: {
                role: 'coach',
                full_name: full_name || '',
                account_id: accountId,
            },
        });

        if (error) {
            return new Response(JSON.stringify({ error: error.message }), {
                status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            });
        }

        const passwordHash = await hashPassword(password);

        const { error: userInsertError } = await supabaseAdmin
            .from('users')
            .upsert({
                id: data.user.id,
                name: full_name || '',
                email,
                password_hash: passwordHash,
                role: 'coach',
                account_id: accountId,
                status: 'active',
            });

        if (userInsertError) {
            await supabaseAdmin.auth.admin.deleteUser(data.user.id);
            return new Response(JSON.stringify({ error: userInsertError.message }), {
                status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            });
        }

        return new Response(JSON.stringify({
            success: true,
            user_id: data.user.id,
            role: 'coach',
            account_id: accountId,
        }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
    } catch (error) {
        const message = error instanceof Error ? error.message : 'Internal server error';
        return new Response(JSON.stringify({ error: message }), {
            status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
    }
});
