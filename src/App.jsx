import { useState, useEffect, lazy, Suspense } from 'react';
import { Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import LoadingScreen from './components/LoadingScreen';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import AnimatedStats from './components/AnimatedStats';
import WhyChooseUs from './components/WhyChooseUs';
import Footer from './components/Footer';
import ErrorBoundary from './components/ErrorBoundary';
import { useOrganizationSchema } from './components/SEOSchemas';
import './App.css';

// Lazy load below-fold sections
const CoursesPreview = lazy(() => import('./components/CoursesPreview'));
const StudentAchievements = lazy(() => import('./components/StudentAchievements'));
const Testimonials = lazy(() => import('./components/Testimonials'));
const ParentReviewForm = lazy(() => import('./components/ParentReviewForm'));
const YouTubeSection = lazy(() => import('./components/YouTubeSection'));
const GoogleDriveGallery = lazy(() => import('./components/GoogleDriveGallery'));
const FAQ = lazy(() => import('./components/FAQ'));
const DemoBooking = lazy(() => import('./components/DemoBooking'));

const TournamentCalendar = lazy(() => import('./components/TournamentCalendar'));
const EbookStore = lazy(() => import('./pages/EbookStore'));
const TournamentPage = lazy(() => import('./pages/TournamentPage'));
const BlogPage = lazy(() => import('./pages/BlogPage'));
const BlogPost = lazy(() => import('./pages/BlogPost'));
const DailyPuzzlePage = lazy(() => import('./pages/DailyPuzzlePage'));
const OpeningsPage = lazy(() => import('./pages/OpeningsPage'));
const EndgamesPage = lazy(() => import('./pages/EndgamesPage'));
const ChessTipsPage = lazy(() => import('./pages/ChessTipsPage'));
const SEOContentPage = lazy(() => import('./pages/SEOContentPage'));
const ReferralLandingPage = lazy(() => import('./pages/ReferralLandingPage'));
const PrivacyPolicyPage = lazy(() => import('./pages/PrivacyPolicyPage'));
const TermsConditionsPage = lazy(() => import('./pages/TermsConditionsPage'));
const Classroom = lazy(() => import('./pages/Classroom'));

function HomePage({ onAdminClick }) {
  useOrganizationSchema();

  useEffect(() => {
    let ticking = false;
    const handleScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          const scrolled = window.scrollY;
          const parallaxElements = document.querySelectorAll('.hero-section');
          parallaxElements.forEach((el) => {
            el.style.transform = `translateY(${scrolled * 0.5}px)`;
          });
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="app">
      <Navbar />
      <ErrorBoundary fallbackMessage="The 3D scene failed to load.">
        <Hero />
      </ErrorBoundary>
      <AnimatedStats />
      <WhyChooseUs />
      <Suspense fallback={null}>
        <CoursesPreview />
        <StudentAchievements />
        <Testimonials />
        <ErrorBoundary fallbackMessage="Tournament calendar failed to load.">
          <TournamentCalendar />
        </ErrorBoundary>
        <YouTubeSection />
        <GoogleDriveGallery />
        <FAQ />
        <DemoBooking />
      </Suspense>
      <Footer onAdminClick={onAdminClick} />
    </div>
  );
}

function App() {
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  if (loading && location.pathname === '/') {
    return <LoadingScreen onComplete={() => setLoading(false)} />;
  }

  return (
    <Suspense fallback={<div className="lazy-loading">Loading...</div>}>
      <Routes>
        <Route path="/" element={<HomePage onAdminClick={() => navigate('/admin')} />} />
        <Route path="/submit-review" element={<ParentReviewForm />} />
        <Route path="/ebooks" element={<EbookStore />} />
        <Route path="/tournaments" element={<TournamentPage />} />
        <Route path="/blog" element={<BlogPage />} />
        <Route path="/blog/:slug" element={<BlogPost />} />
        <Route path="/puzzles/daily" element={<DailyPuzzlePage />} />
        <Route path="/openings/beginners" element={<OpeningsPage />} />
        <Route path="/endgames/basics" element={<EndgamesPage />} />
        <Route path="/chess-tips" element={<ChessTipsPage />} />
        <Route path="/learn/:slug" element={<SEOContentPage />} />
        <Route path="/ref/:code" element={<ReferralLandingPage />} />
        <Route path="/privacy-policy" element={<PrivacyPolicyPage />} />
        <Route path="/terms-and-conditions" element={<TermsConditionsPage />} />
        <Route path="/classroom/:sessionId" element={<Classroom />} />
      </Routes>
    </Suspense>
  );
}

export default App;
