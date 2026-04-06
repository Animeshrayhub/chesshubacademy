import { useState, useEffect } from 'react';
import './StudentAchievements.css';

export default function StudentAchievements() {
    const [selectedStudent, setSelectedStudent] = useState(null);
    const [achievements, setAchievements] = useState([]);

    useEffect(() => {
        // Load achievements from JSON file
        fetch('/data/achievements.json')
            .then(res => res.json())
            .then(data => {
                setAchievements(data || []);
            })
            .catch(err => {
                console.error('Error loading achievements:', err);
                setAchievements([]);
            });
    }, []);

    if (achievements.length === 0) {
        return null; // Don't show the section if there are no achievements
    }

    return (
        <section className="section achievements-section" id="achievements">
            <div className="container">
                <div className="section-header text-center">
                    <h2 className="section-subtitle">Excellence in Action</h2>
                    <h1 className="section-title">
                        Our Students, <span className="text-gradient">Our Pride</span>
                    </h1>
                    <p className="section-description">
                        Meet our champions who have excelled in national and international tournaments.
                        Their success stories inspire the next generation of chess masters.
                    </p>
                </div>

                <div className="achievements-grid">
                    {achievements.map((student, index) => (
                        <div
                            key={index}
                            className="achievement-card glass-card"
                            onClick={() => setSelectedStudent(student)}
                            style={{ animationDelay: `${index * 0.1}s` }}
                        >
                            <div className="achievement-icon">{student.image}</div>

                            <div className="achievement-info">
                                <h3 className="achievement-name">{student.name}</h3>
                                <div className="achievement-age">Age: {student.age}</div>

                                <div className="achievement-title">
                                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                                        <path d="M8 1L10 6L15 6L11 9L13 14L8 11L3 14L5 9L1 6L6 6L8 1Z" fill="currentColor" />
                                    </svg>
                                    {student.achievement}
                                </div>

                                <div className="achievement-tournament">{student.tournament}</div>

                                <div className="achievement-rating">
                                    <span className="rating-label">Rating:</span>
                                    <span className="rating-value">{student.rating}</span>
                                </div>
                            </div>

                            <div className="achievement-hover">
                                <p>{student.details}</p>
                                <button className="btn-link">View Details →</button>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="achievements-cta">
                    <p>Ready to join our champions?</p>
                    <button
                        className="btn btn-primary"
                        onClick={() => document.getElementById('booking')?.scrollIntoView({ behavior: 'smooth' })}
                    >
                        Start Your Journey
                    </button>
                </div>
            </div>

            {selectedStudent && (
                <div className="achievement-modal" onClick={() => setSelectedStudent(null)}>
                    <div className="modal-content glass-card" onClick={(e) => e.stopPropagation()}>
                        <button className="modal-close" onClick={() => setSelectedStudent(null)}>×</button>

                        <div className="modal-icon">{selectedStudent.image}</div>
                        <h2>{selectedStudent.name}</h2>
                        <div className="modal-age">Age: {selectedStudent.age}</div>

                        <div className="modal-achievement">
                            <h3>{selectedStudent.achievement}</h3>
                            <p>{selectedStudent.tournament}</p>
                        </div>

                        <div className="modal-details">
                            <p>{selectedStudent.details}</p>
                        </div>

                        <div className="modal-rating">
                            <span>FIDE Rating</span>
                            <span className="rating-badge">{selectedStudent.rating}</span>
                        </div>
                    </div>
                </div>
            )}
        </section>
    );
}
