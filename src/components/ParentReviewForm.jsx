import { useState } from 'react';
import './ParentReviewForm.css';

export default function ParentReviewForm() {
    const [formData, setFormData] = useState({
        name: '',
        location: '',
        role: '',
        rating: 5,
        text: '',
        photo: null
    });
    const [photoPreview, setPhotoPreview] = useState(null);
    const [submitting, setSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handlePhotoChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            // Check file size (max 2MB)
            if (file.size > 2 * 1024 * 1024) {
                alert('Photo size should be less than 2MB');
                return;
            }

            // Create preview
            const reader = new FileReader();
            reader.onloadend = () => {
                setPhotoPreview(reader.result);
                setFormData(prev => ({ ...prev, photo: reader.result }));
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);

        try {
            // In a real implementation, this would send to a backend API
            // For now, we'll show a success message and instructions
            
            const reviewData = {
                ...formData,
                date: new Date().toISOString(),
                id: Date.now()
            };

            console.log('Review submitted:', reviewData);
            
            // Show success message
            setSubmitted(true);
            
            // Reset form after 3 seconds
            setTimeout(() => {
                setFormData({
                    name: '',
                    location: '',
                    role: '',
                    rating: 5,
                    text: '',
                    photo: null
                });
                setPhotoPreview(null);
                setSubmitted(false);
            }, 5000);

        } catch (error) {
            console.error('Error submitting review:', error);
            alert('There was an error submitting your review. Please try again.');
        } finally {
            setSubmitting(false);
        }
    };

    if (submitted) {
        return (
            <div className="review-form-container">
                <div className="success-message glass-card">
                    <div className="success-icon">✓</div>
                    <h3>Thank you for your review!</h3>
                    <p>Your review has been submitted and will be published after verification.</p>
                    <p className="admin-note">
                        <strong>Admin Note:</strong> To publish reviews, add them manually to 
                        <code>/public/data/reviews.json</code>
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="review-form-container">
            <div className="review-form glass-card">
                <h3>Share Your Experience</h3>
                <p className="form-description">
                    Help other parents by sharing your child's success story with ChessHub Academy
                </p>

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label htmlFor="name">Your Name *</label>
                        <input
                            type="text"
                            id="name"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            required
                            placeholder="Enter your full name"
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="location">Location</label>
                        <input
                            type="text"
                            id="location"
                            name="location"
                            value={formData.location}
                            onChange={handleChange}
                            placeholder="City, Country"
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="role">Relationship *</label>
                        <input
                            type="text"
                            id="role"
                            name="role"
                            value={formData.role}
                            onChange={handleChange}
                            required
                            placeholder="e.g., Parent of John, Age 10"
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="rating">Rating *</label>
                        <div className="rating-input">
                            {[1, 2, 3, 4, 5].map(star => (
                                <button
                                    key={star}
                                    type="button"
                                    className={`star-button ${star <= formData.rating ? 'active' : ''}`}
                                    onClick={() => setFormData(prev => ({ ...prev, rating: star }))}
                                >
                                    ⭐
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="form-group">
                        <label htmlFor="text">Your Review *</label>
                        <textarea
                            id="text"
                            name="text"
                            value={formData.text}
                            onChange={handleChange}
                            required
                            rows="5"
                            placeholder="Share your child's achievements and your experience with ChessHub Academy..."
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="photo">Your Photo (Optional)</label>
                        <input
                            type="file"
                            id="photo"
                            accept="image/*"
                            onChange={handlePhotoChange}
                        />
                        {photoPreview && (
                            <div className="photo-preview">
                                <img src={photoPreview} alt="Preview" />
                            </div>
                        )}
                        <small>Maximum file size: 2MB</small>
                    </div>

                    <button 
                        type="submit" 
                        className="btn btn-primary submit-button"
                        disabled={submitting}
                    >
                        {submitting ? 'Submitting...' : 'Submit Review'}
                    </button>
                </form>
            </div>
        </div>
    );
}
