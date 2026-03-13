import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './Navbar.css';

export default function Navbar() {
    const [scrolled, setScrolled] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [coursesDropdownOpen, setCoursesDropdownOpen] = useState(false);
    const [servicesDropdownOpen, setServicesDropdownOpen] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 50);
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const scrollToSection = (id) => {
        const element = document.getElementById(id);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth' });
            setMobileMenuOpen(false);
        }
    };

    const courses = [
        { name: 'Beginner', level: 'For those starting their chess journey' },
        { name: 'Intermediate', level: 'Building strong fundamentals' },
        { name: 'Advanced', level: 'Competitive chess mastery' },
        { name: 'Master', level: 'Elite-level training' }
    ];

    const services = [
        { name: 'Online 1-on-1 Classes', desc: 'Personalized coaching sessions' },
        { name: 'Online Group Classes', desc: 'Learn with peers' }
    ];

    return (
        <nav className={`navbar ${scrolled ? 'navbar-scrolled' : ''}`}>
            <div className="navbar-container">
                <div className="navbar-logo" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
                    <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
                        <path d="M20 5L25 15L35 15L27 22L30 32L20 26L10 32L13 22L5 15L15 15L20 5Z" fill="url(#gradient)" />
                        <defs>
                            <linearGradient id="gradient" x1="5" y1="5" x2="35" y2="35">
                                <stop offset="0%" stopColor="#8b5cf6" />
                                <stop offset="100%" stopColor="#3b82f6" />
                            </linearGradient>
                        </defs>
                    </svg>
                    <span className="navbar-brand">ChessHub Academy</span>
                </div>

                <div className={`navbar-menu ${mobileMenuOpen ? 'navbar-menu-open' : ''}`}>
                    <div className="navbar-links">
                        <a href="#home" className="navbar-link" onClick={(e) => { e.preventDefault(); window.scrollTo({ top: 0, behavior: 'smooth' }); }}>
                            Home
                        </a>

                        <div
                            className="navbar-dropdown"
                            onMouseEnter={() => setCoursesDropdownOpen(true)}
                            onMouseLeave={() => setCoursesDropdownOpen(false)}
                        >
                            <button className="navbar-link navbar-dropdown-toggle">
                                Courses
                                <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                                    <path d="M4 6L8 10L12 6" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                            </button>
                            <div className={`navbar-dropdown-menu ${coursesDropdownOpen ? 'navbar-dropdown-open' : ''}`}>
                                {courses.map((course) => (
                                    <a
                                        key={course.name}
                                        href="#courses"
                                        className="navbar-dropdown-item"
                                        onClick={(e) => { e.preventDefault(); scrollToSection('courses'); }}
                                    >
                                        <div className="dropdown-item-title">{course.name}</div>
                                        <div className="dropdown-item-desc">{course.level}</div>
                                    </a>
                                ))}
                            </div>
                        </div>

                        <div
                            className="navbar-dropdown"
                            onMouseEnter={() => setServicesDropdownOpen(true)}
                            onMouseLeave={() => setServicesDropdownOpen(false)}
                        >
                            <button className="navbar-link navbar-dropdown-toggle">
                                Services
                                <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                                    <path d="M4 6L8 10L12 6" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                            </button>
                            <div className={`navbar-dropdown-menu ${servicesDropdownOpen ? 'navbar-dropdown-open' : ''}`}>
                                {services.map((service) => (
                                    <a
                                        key={service.name}
                                        href="#features"
                                        className="navbar-dropdown-item"
                                        onClick={(e) => { e.preventDefault(); scrollToSection('features'); }}
                                    >
                                        <div className="dropdown-item-title">{service.name}</div>
                                        <div className="dropdown-item-desc">{service.desc}</div>
                                    </a>
                                ))}
                            </div>
                        </div>

                        <a href="#achievements" className="navbar-link" onClick={(e) => { e.preventDefault(); scrollToSection('achievements'); }}>
                            Gallery
                        </a>

                        <a href="#contact" className="navbar-link" onClick={(e) => { e.preventDefault(); scrollToSection('contact'); }}>
                            Contact
                        </a>

                        <Link to="/ebooks" className="navbar-link">Ebooks</Link>
                        <Link to="/tournaments" className="navbar-link">Tournaments</Link>
                        <Link to="/blog" className="navbar-link">Blog</Link>
                    </div>

                    <div className="navbar-actions">
                        <Link to="/login" className="btn btn-secondary navbar-login">Login</Link>
                        <button className="btn btn-primary navbar-cta" onClick={() => scrollToSection('booking')}>
                            Book Free Demo
                        </button>
                    </div>
                </div>

                <button
                    className="navbar-hamburger"
                    onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                    aria-label="Toggle menu"
                >
                    <span className={`hamburger-line ${mobileMenuOpen ? 'hamburger-line-1-open' : ''}`}></span>
                    <span className={`hamburger-line ${mobileMenuOpen ? 'hamburger-line-2-open' : ''}`}></span>
                    <span className={`hamburger-line ${mobileMenuOpen ? 'hamburger-line-3-open' : ''}`}></span>
                </button>
            </div>
        </nav>
    );
}
