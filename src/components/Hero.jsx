import { lazy, Suspense, useState, useEffect, useRef } from 'react';
import './Hero.css';

const FloatingChessScene3D = lazy(() => import('./ChessScene3D'));

export default function Hero() {
    const heroRef = useRef(null);
    const [isVisible, setIsVisible] = useState(true);

    useEffect(() => {
        const el = heroRef.current;
        if (!el) return;

        const observer = new IntersectionObserver(
            ([entry]) => setIsVisible(entry.isIntersecting),
            { threshold: 0.1 }
        );
        observer.observe(el);
        return () => observer.disconnect();
    }, []);

    const scrollToBooking = () => {
        document.getElementById('booking')?.scrollIntoView({ behavior: 'smooth' });
    };

    return (
        <section className="hero-section" ref={heroRef}>
            {isVisible && (
                <Suspense fallback={null}>
                    <FloatingChessScene3D />
                </Suspense>
            )}

            <div className="hero-content">
                <div className="container">
                    <div className="hero-text fade-in">
                        <div className="hero-badge">
                            <span className="badge-icon">🏆</span>
                            <span>Trained by FIDE-Rated Masters</span>
                        </div>

                        <h1 className="hero-title">
                            Learn, Play,
                            <br />
                            <span className="text-gradient">Conquer!</span>
                        </h1>

                        <p className="hero-subtitle">
                            Join India&apos;s premier online chess academy. Master the game with personalized
                            coaching from grandmasters and international masters. Transform your passion
                            into championships.
                        </p>

                        <div className="hero-cta">
                            <button className="btn btn-primary" onClick={scrollToBooking}>
                                Book Free Demo
                                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                                    <path d="M7.5 15L12.5 10L7.5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                            </button>

                            <button className="btn btn-secondary" onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}>
                                Learn More
                            </button>
                        </div>

                        <div className="hero-stats">
                            <div className="stat-item">
                                <div className="stat-number">500+</div>
                                <div className="stat-label">Students</div>
                            </div>
                            <div className="stat-item">
                                <div className="stat-number">50+</div>
                                <div className="stat-label">Expert Coaches</div>
                            </div>
                            <div className="stat-item">
                                <div className="stat-number">98%</div>
                                <div className="stat-label">Success Rate</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="scroll-indicator">
                <div className="mouse">
                    <div className="wheel"></div>
                </div>
            </div>
        </section>
    );
}
