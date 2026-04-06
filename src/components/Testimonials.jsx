import { useState, useEffect } from 'react';
import './Testimonials.css';

export default function Testimonials() {
    const [activeIndex, setActiveIndex] = useState(0);
    const [testimonials, setTestimonials] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showSubmitForm, setShowSubmitForm] = useState(false);

    useEffect(() => {
        // Load testimonials from JSON file
        fetch('/data/reviews.json')
            .then(res => res.json())
            .then(data => {
                setTestimonials(data || []);
                setLoading(false);
            })
            .catch(err => {
                console.error('Error loading reviews:', err);
                setTestimonials([]);
                setLoading(false);
            });
    }, []);

    useEffect(() => {
        if (testimonials.length > 0) {
            const interval = setInterval(() => {
                setActiveIndex((current) => (current + 1) % testimonials.length);
            }, 5000);
            return () => clearInterval(interval);
        }
    }, [testimonials.length]);

    if (loading) return null;

    if (testimonials.length === 0) {
        return (
            <section className="section testimonials-section">
                <div className="container">
                    <div className="section-header text-center">
                        <h2 className="section-subtitle">Testimonials</h2>
                        <h1 className="section-title fade-in">
                            Our Student&apos;s <span className="text-gradient">Happy Parents</span>
                        </h1>
                        <p className="section-description fade-in">
                            Be the first to share your experience!
                        </p>
                    </div>
                </div>
            </section>
        );
    }

    return (
        <section className="section testimonials-section">
            <div className="container">
                <div className="section-header text-center">
                    <h2 className="section-subtitle">Testimonials</h2>
                    <h1 className="section-title fade-in">
                        Our Student&apos;s <span className="text-gradient">Happy Parents</span>
                    </h1>
                    <p className="section-description fade-in">
                        Hear from parents whose children have achieved remarkable success with our coaching
                    </p>
                </div>

                <div className="testimonials-container">
                    <div className="testimonial-card glass-card">
                        <div className="testimonial-content">
                            <div className="testimonial-avatar">
                                {testimonials[activeIndex].photo ? (
                                    <img src={testimonials[activeIndex].photo} alt={testimonials[activeIndex].name} />
                                ) : (
                                    <div className="avatar-placeholder">👤</div>
                                )}
                            </div>
                            <div className="testimonial-rating">
                                {[...Array(testimonials[activeIndex].rating || 5)].map((_, i) => (
                                    <span key={i} className="star">⭐</span>
                                ))}
                            </div>
                            <p className="testimonial-text">&ldquo;{testimonials[activeIndex].text}&rdquo;</p>
                            <div className="testimonial-author">
                                <div className="author-name">{testimonials[activeIndex].name}</div>
                                {testimonials[activeIndex].location && (
                                    <div className="author-location">{testimonials[activeIndex].location}</div>
                                )}
                                {testimonials[activeIndex].role && (
                                    <div className="author-role">{testimonials[activeIndex].role}</div>
                                )}
                                {testimonials[activeIndex].date && (
                                    <div className="author-date">{new Date(testimonials[activeIndex].date).toLocaleDateString()}</div>
                                )}
                            </div>
                        </div>
                    </div>
                    <div className="testimonial-dots">
                        {testimonials.map((_, index) => (
                            <button key={index}
                                className={`dot ${index === activeIndex ? 'active' : ''}`}
                                onClick={() => setActiveIndex(index)}
                                aria-label={`Go to testimonial ${index + 1}`}
                            />
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}
