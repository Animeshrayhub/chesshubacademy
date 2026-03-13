import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/useAuth';

export default function ProtectedRoute({ children, requireAdmin = false, requireCoach = false, allowAll = false }) {
    const { user, loading, isAdmin, isCoach, isStudent } = useAuth();

    if (loading) {
        return <div className="lazy-loading">Loading...</div>;
    }

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    // allowAll: just require authentication, no role restriction
    if (allowAll) {
        return children;
    }

    if (requireAdmin && !isAdmin()) {
        if (isCoach()) return <Navigate to="/coach-dashboard" replace />;
        return <Navigate to="/student-dashboard" replace />;
    }

    if (requireCoach && !isCoach()) {
        if (isAdmin()) return <Navigate to="/admin-dashboard" replace />;
        return <Navigate to="/student-dashboard" replace />;
    }

    // Student routes: block coaches and admins from accessing /dashboard
    if (!requireAdmin && !requireCoach) {
        if (isCoach()) return <Navigate to="/coach-dashboard" replace />;
        if (isAdmin()) return <Navigate to="/admin-dashboard" replace />;
    }

    return children;
}
