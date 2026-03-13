import { Routes, Route, Link, Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/useAuth';
import AdminDashboard from './admin/AdminDashboard';
import AdminBookings from './admin/AdminBookings';
import AdminCourses from './admin/AdminCourses';
import AdminCoaches from './admin/AdminCoaches';
import AdminContent from './admin/AdminContent';
import AdminSettings from './admin/AdminSettings';
import AdminEbooks from './admin/AdminEbooks';
import AdminEbookOrders from './admin/AdminEbookOrders';
import AdminTournaments from './admin/AdminTournaments';
import AdminBlog from './admin/AdminBlog';
import AdminReferrals from './admin/AdminReferrals';
import AdminContentManager from './admin/AdminContentManager';
import AdminVideos from './admin/AdminVideos';
import AdminStudents from './admin/AdminStudents';
import AdminDemoStudents from './admin/AdminDemoStudents';
import AdminSEOContent from './admin/AdminSEOContent';
import AdminSessions from './admin/AdminSessions';
import AdminHomework from './admin/AdminHomework';
import AdminReports from './admin/AdminReports';
import AdminAnalytics from './admin/AdminAnalytics';
import AdminLeads from './admin/AdminLeads';
import AdminReferralCodes from './admin/AdminReferralCodes';
import './AdminView.css';

function AdminSidebar() {
    const location = useLocation();

    const navItems = [
        { path: '/admin/dashboard', icon: '📊', label: 'Dashboard' },
        { path: '/admin/bookings', icon: '📅', label: 'Bookings' },
        { path: '/admin/courses', icon: '📚', label: 'Courses' },
        { path: '/admin/coaches', icon: '👨‍🏫', label: 'Coaches' },
        { path: '/admin/content', icon: '📝', label: 'Content' },
        { path: '/admin/ebooks', icon: '📖', label: 'Ebooks' },
        { path: '/admin/ebook-orders', icon: '🛒', label: 'Ebook Orders' },
        { path: '/admin/tournaments', icon: '🏆', label: 'Tournaments' },
        { path: '/admin/blog', icon: '✍️', label: 'Blog' },
        { path: '/admin/seo-content', icon: '🔍', label: 'SEO Content' },
        { path: '/admin/referrals', icon: '🤝', label: 'Referrals' },
        { path: '/admin/site-content', icon: '🌐', label: 'Site Content' },
        { path: '/admin/videos', icon: '🎥', label: 'Videos' },
        { path: '/admin/students', icon: '👨‍🎓', label: 'Students' },
        { path: '/admin/demo-students', icon: '🎯', label: 'Demo Students' },
        { path: '/admin/sessions', icon: '🎓', label: 'Sessions' },
        { path: '/admin/homework', icon: '✏️', label: 'Homework' },
        { path: '/admin/reports', icon: '📋', label: 'Reports' },
        { path: '/admin/leads', icon: '🧲', label: 'Leads' },
        { path: '/admin/referral-codes', icon: '🎁', label: 'Referral Codes' },
        { path: '/admin/analytics', icon: '📈', label: 'Analytics' },
        { path: '/admin/settings', icon: '⚙️', label: 'Settings' },
    ];

    return (
        <aside className="admin-sidebar">
            <div className="sidebar-header">
                <h2>ChessHub Admin</h2>
            </div>
            <nav className="sidebar-nav">
                {navItems.map((item) => (
                    <Link
                        key={item.path}
                        to={item.path}
                        className={`nav-item ${location.pathname === item.path ? 'active' : ''}`}
                    >
                        <span className="nav-icon">{item.icon}</span>
                        <span className="nav-label">{item.label}</span>
                    </Link>
                ))}
            </nav>
        </aside>
    );
}

function AdminLayout({ children, onLogout }) {
    return (
        <div className="admin-layout">
            <AdminSidebar />
            <div className="admin-main">
                <header className="admin-header">
                    <h1>Admin Panel</h1>
                    <button onClick={onLogout} className="btn btn-secondary">
                        Logout
                    </button>
                </header>
                <main className="admin-content">
                    {children}
                </main>
            </div>
        </div>
    );
}

export default function AdminView() {
    const { logout } = useAuth();

    return (
        <AdminLayout onLogout={logout}>
            <Routes>
                <Route path="/" element={<Navigate to="/admin/dashboard" replace />} />
                <Route path="dashboard" element={<AdminDashboard />} />
                <Route path="bookings" element={<AdminBookings />} />
                <Route path="courses" element={<AdminCourses />} />
                <Route path="coaches" element={<AdminCoaches />} />
                <Route path="content" element={<AdminContent />} />
                <Route path="ebooks" element={<AdminEbooks />} />
                <Route path="ebook-orders" element={<AdminEbookOrders />} />
                <Route path="tournaments" element={<AdminTournaments />} />
                <Route path="blog" element={<AdminBlog />} />
                <Route path="seo-content" element={<AdminSEOContent />} />
                <Route path="referrals" element={<AdminReferrals />} />
                <Route path="site-content" element={<AdminContentManager />} />
                <Route path="videos" element={<AdminVideos />} />
                <Route path="students" element={<AdminStudents />} />
                <Route path="demo-students" element={<AdminDemoStudents />} />
                <Route path="sessions" element={<AdminSessions />} />
                <Route path="homework" element={<AdminHomework />} />
                <Route path="reports" element={<AdminReports />} />
                <Route path="leads" element={<AdminLeads />} />
                <Route path="referral-codes" element={<AdminReferralCodes />} />
                <Route path="analytics" element={<AdminAnalytics />} />
                <Route path="settings" element={<AdminSettings />} />
            </Routes>
        </AdminLayout>
    );
}
