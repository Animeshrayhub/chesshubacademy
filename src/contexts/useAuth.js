// Stub auth hook (no authentication)
export const useAuth = () => {
    return {
        user: null,
        session: null,
        loading: false,
        signIn: async () => null,
        signOut: async () => null,
        signUp: async () => null
    };
};
