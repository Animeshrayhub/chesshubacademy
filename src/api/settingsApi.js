import { supabase } from '../services/supabase';

const DEFAULT_FEE_PLANS = [
    { sessions: 12, price: 8400, classes_per_week: 2, label: '12 Sessions' },
    { sessions: 24, price: 14400, classes_per_week: 2, label: '24 Sessions' },
    { sessions: 48, price: 24000, classes_per_week: 2, label: '48 Sessions' },
];

const FEE_PLAN_PRICE_BY_SESSIONS = {
    12: 8400,
    24: 14400,
    48: 24000,
};

function normalizeFeePlans(plans) {
    const inputPlans = Array.isArray(plans) ? plans : [];
    const bySessions = new Map(
        inputPlans
            .map((plan) => ({
                ...plan,
                sessions: Number(plan?.sessions),
            }))
            .filter((plan) => Number.isFinite(plan.sessions))
            .map((plan) => [plan.sessions, plan]),
    );

    return [12, 24, 48].map((sessions) => {
        const existingPlan = bySessions.get(sessions) || {};
        return {
            ...existingPlan,
            sessions,
            price: FEE_PLAN_PRICE_BY_SESSIONS[sessions],
            classes_per_week: 2,
            label: `${sessions} Sessions`,
        };
    });
}

export async function getFeePlans() {
    if (!supabase) return DEFAULT_FEE_PLANS;

    try {
        const { data, error } = await supabase
            .from('site_settings')
            .select('value')
            .eq('key', 'fee_plans')
            .single();

        if (error || !data) return DEFAULT_FEE_PLANS;
        return normalizeFeePlans(data.value);
    } catch {
        return DEFAULT_FEE_PLANS;
    }
}

export async function updateFeePlans(plans) {
    if (!supabase) return { success: false, error: 'Supabase not configured' };

    const normalizedPlans = normalizeFeePlans(plans);

    const { error } = await supabase
        .from('site_settings')
        .upsert({ key: 'fee_plans', value: normalizedPlans, updated_at: new Date().toISOString() });

    if (error) {
        console.error('Error updating fee plans:', error);
        return { success: false, error };
    }
    return { success: true };
}
