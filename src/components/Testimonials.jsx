import { useState, useEffect } from 'react';
import { getContentByType } from '../api/contentApi';
import { useRealtimeData } from '../hooks/useRealtimeData';
import './Testimonials.css';

const DEFAULT_TESTIMONIALS = [
    {
        id: 1, name: 'Poovandhree Naidoo', location: 'South Africa',
        role: 'Parent of Saien, Age 11', rating: 5, image: '👨‍👩‍👦',
        text: 'My son acquired the first position in the under-12 age category at the Ilembe district tournament in South Africa. The personalized coaching from ChessHub has been instrumental in his success!',
    },
    {
        id: 2, name: 'Radhika Panuganthy', location: 'Hyderabad, India',
        role: 'Parent of Suveer, Age 12', rating: 5, image: '👨‍👩‍👧',
        text: 'Suveer won second prize in the Dubai School Games Chess Championship! The structured curriculum and expert guidance have exceeded our expectations. Highly recommend ChessHub Academy.',
    },
    {
        id: 3, name: 'Sonal Tewari', location: 'Mumbai, India',
        role: 'Parent of Zoe, Age 7', rating: 5, image: '👩‍👧',
        text: 'Zoe won the under-8 age category prize in the International FIDE rating chess tournament held in Chennai. The coaches are patient, knowledgeable, and truly care about each student.',
    },
    {
        id: 4, name: 'Tarun Gupta', location: 'Delhi, India',
        role: 'Parent of Teddy, Age 6', rating: 5, image: '👨‍👦',
        text: 'My son won 1st prize at the New York Chess Championship in the under-6 age category! The online classes are engaging and the progress tracking helps us monitor his improvement.',
    },
    {
        id: 5, name: 'Simran Oberoi', location: 'Bangalore, India',
        role: 'Parent of Isla, Age 7', rating: 5, image: '👪',
        text: 'Isla won the Lincoln Junior Chess Tournament in the United Kingdom! ChessHub Academy has transformed her from a beginner to a champion. Forever grateful to the team!',
    },
];

export default function Testimonials() {
    const [activeIndex, setActiveIndex] = useState(0);
    const { data: siteTestimonials } = useRealtimeData('site_content', () => getContentByType('testimonial'));

    const testimonials = siteTestimonials.length > 0
        ? siteTestimonials.map(t => ({
            id: t.id,
            name: t.title || 'Anonymous',
            location: t.metadata?.location || '',
            role: t.metadata?.role || '',
            rating: t.metadata?.rating || 5,
            text: t.content || '',
            image: t.metadata?.image || '👤',
        }))
        : DEFAULT_TESTIMONIALS;

    useEffect(() => {
        const interval = setInterval(() => {
            setActiveIndex((current) => (current + 1) % testimonials.length);
        }, 5000);
        return () => clearInterval(interval);
    }, [testimonials.length]);

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
                                {testimonials[activeIndex].image}
                            </div>
                            <div className="testimonial-rating">
                                {[...Array(testimonials[activeIndex].rating)].map((_, i) => (
                                    <span key={i} className="star">⭐</span>
                                ))}
                            </div>
                            <p className="testimonial-text">&ldquo;{testimonials[activeIndex].text}&rdquo;</p>
                            <div className="testimonial-author">
                                <div className="author-name">{testimonials[activeIndex].name}</div>
                                <div className="author-location">{testimonials[activeIndex].location}</div>
                                <div className="author-role">{testimonials[activeIndex].role}</div>
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
