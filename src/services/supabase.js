// Stub supabase service (no backend)
export const supabase = null;

export const getSession = async () => {
    return null;
};

export const signOut = async () => {
    console.log('Sign out not available without authentication');
};
