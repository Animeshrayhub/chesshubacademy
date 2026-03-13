import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../services/supabase';
import { AuthContext } from './useAuth';
import { getUserRecord } from '../api/userApi';

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [appUser, setAppUser] = useState(null);
    const [profile, setProfile] = useState(null);
    const [coachProfile, setCoachProfile] = useState(null);
    const [loading, setLoading] = useState(!!supabase);

    const resolveRole = useCallback((authUser, dbUser) => {
        if (dbUser?.role) return dbUser.role;
        if (authUser?.user_metadata?.role) return authUser.user_metadata.role;
        if (authUser?.app_metadata?.role) return authUser.app_metadata.role;
        return 'student';
    }, []);

    const isAdminUser = useCallback((u, dbUser = appUser) => {
        return resolveRole(u, dbUser) === 'admin';
    }, [appUser, resolveRole]);

    const isCoachUser = useCallback((u, dbUser = appUser) => {
        return resolveRole(u, dbUser) === 'coach';
    }, [appUser, resolveRole]);

    const fetchProfile = useCallback(async (userId) => {
        if (!supabase || !userId) return null;
        const { data } = await supabase
            .from('student_profiles')
            .select('*')
            .eq('user_id', userId)
            .single();
        return data;
    }, []);

    const fetchCoachProfile = useCallback(async (userId) => {
        if (!supabase || !userId) return null;
        const { data } = await supabase
            .from('coaches')
            .select('*')
            .eq('user_id', userId)
            .single();
        return data;
    }, []);

    const fetchAppUser = useCallback(async (authUser) => {
        if (!authUser?.id) return null;
        return await getUserRecord(authUser.id);
    }, []);

    const loadProfiles = useCallback(async (u, dbUser = null) => {
        if (!u) {
            setAppUser(null);
            setProfile(null);
            setCoachProfile(null);
            return;
        }

        const resolvedDbUser = dbUser || await fetchAppUser(u);
        setAppUser(resolvedDbUser || null);

        if (resolvedDbUser?.status && resolvedDbUser.status !== 'active') {
            await supabase.auth.signOut();
            setUser(null);
            setProfile(null);
            setCoachProfile(null);
            setAppUser(null);
            return;
        }

        if (isAdminUser(u, resolvedDbUser)) {
            setProfile(null);
            setCoachProfile(null);
        } else if (isCoachUser(u, resolvedDbUser)) {
            const cp = await fetchCoachProfile(u.id);
            setCoachProfile(cp);
            setProfile(null);
        } else {
            const p = await fetchProfile(u.id);
            setProfile(p);
            setCoachProfile(null);
        }
    }, [fetchAppUser, fetchCoachProfile, fetchProfile, isAdminUser, isCoachUser]);

    useEffect(() => {
        if (!supabase) {
            return;
        }

        // Get initial session
        supabase.auth.getSession().then(async ({ data: { session } }) => {
            const u = session?.user ?? null;
            setUser(u);
            await loadProfiles(u);
            setLoading(false);
        });

        // Listen for auth changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            async (_event, session) => {
                const u = session?.user ?? null;
                setUser(u);
                await loadProfiles(u);
            }
        );

        return () => subscription.unsubscribe();
    }, [loadProfiles]);

    // Public signup removed — only admin can create accounts

    const login = async (email, password) => {
        if (!supabase) {
            return { error: { message: 'Supabase not configured. Please set up Supabase credentials.' } };
        }
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        if (error) return { data, error };

        const authUser = data?.user || null;
        const dbUser = await fetchAppUser(authUser);
        if (dbUser?.status && dbUser.status !== 'active') {
            await supabase.auth.signOut();
            return { data: null, error: { message: 'Your account is inactive. Please contact admin.' } };
        }

        return { data, error };
    };

    const logout = async () => {
        if (supabase) {
            await supabase.auth.signOut();
        }
        setUser(null);
        setAppUser(null);
        setProfile(null);
        setCoachProfile(null);
    };

    const getUser = () => user;

    const isAdmin = () => isAdminUser(user, appUser);

    const isCoach = () => isCoachUser(user, appUser);

    const isStudent = () => {
        if (!user) return false;
        return !isAdmin() && !isCoach();
    };

    const refreshProfile = async () => {
        if (user) {
            await loadProfiles(user);
        }
    };

    return (
        <AuthContext.Provider value={{
            user, appUser, profile, coachProfile, loading,
            login, logout,
            getUser, isAdmin, isCoach, isStudent,
            refreshProfile
        }}>
            {children}
        </AuthContext.Provider>
    );
}

// useAuth hook is in ./useAuth.js — kept separate for React fast-refresh compatibility.
