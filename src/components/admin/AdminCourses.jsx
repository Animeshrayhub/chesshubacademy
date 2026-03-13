import { useState, useEffect } from 'react';
import { getCourses, updateCourse, toggleCourseStatus } from '../../api/courseApi';
import './AdminCourses.css';

export default function AdminCourses() {
    const [courses, setCourses] = useState([]);

    useEffect(() => {
        getCourses().then(setCourses);
    }, []);

    const [editingCourse, setEditingCourse] = useState(null);
    const [editForm, setEditForm] = useState({});

    const handleEdit = (course) => {
        setEditingCourse(course.id);
        setEditForm({ ...course });
    };

    const handleSave = async () => {
        await updateCourse(editingCourse, editForm);
        setCourses(courses.map(c => c.id === editingCourse ? editForm : c));
        setEditingCourse(null);
    };

    const handleCancel = () => {
        setEditingCourse(null);
        setEditForm({});
    };

    const handleInputChange = (field, value) => {
        setEditForm({ ...editForm, [field]: value });
    };

    const handleToggleStatus = async (courseId) => {
        const course = courses.find(c => c.id === courseId);
        const newStatus = course.status === 'active' ? 'inactive' : 'active';
        await toggleCourseStatus(courseId, newStatus);
        setCourses(courses.map(c =>
            c.id === courseId ? { ...c, status: newStatus } : c
        ));
    };

    const calculateDiscount = (original, current) => {
        return Math.round(((original - current) / original) * 100);
    };

    return (
        <div className="admin-courses">
            <div className="admin-header-section">
                <h2>Course Management</h2>
                <p>Manage pricing, duration, and course details</p>
            </div>

            <div className="courses-stats">
                <div className="stat-card glass-card">
                    <div className="stat-icon">📚</div>
                    <div className="stat-info">
                        <div className="stat-value">{courses.length}</div>
                        <div className="stat-label">Total Courses</div>
                    </div>
                </div>
                <div className="stat-card glass-card">
                    <div className="stat-icon">👥</div>
                    <div className="stat-info">
                        <div className="stat-value">{courses.reduce((sum, c) => sum + c.students, 0)}</div>
                        <div className="stat-label">Total Students</div>
                    </div>
                </div>
                <div className="stat-card glass-card">
                    <div className="stat-icon">💰</div>
                    <div className="stat-info">
                        <div className="stat-value">₹{(courses.reduce((sum, c) => sum + (c.price * c.students), 0) / 1000).toFixed(0)}K</div>
                        <div className="stat-label">Total Revenue</div>
                    </div>
                </div>
                <div className="stat-card glass-card">
                    <div className="stat-icon">⭐</div>
                    <div className="stat-info">
                        <div className="stat-value">{(courses.reduce((sum, c) => sum + c.rating, 0) / courses.length).toFixed(1)}</div>
                        <div className="stat-label">Avg Rating</div>
                    </div>
                </div>
            </div>

            <div className="courses-table-container">
                {courses.map(course => (
                    <div key={course.id} className="course-management-card glass-card">
                        {editingCourse === course.id ? (
                            // Edit Mode
                            <div className="course-edit-form">
                                <div className="edit-header">
                                    <h3>Edit {course.title} Course</h3>
                                    <div className="edit-actions">
                                        <button onClick={handleSave} className="btn btn-primary btn-sm">
                                            💾 Save Changes
                                        </button>
                                        <button onClick={handleCancel} className="btn btn-secondary btn-sm">
                                            ✖️ Cancel
                                        </button>
                                    </div>
                                </div>

                                <div className="edit-form-grid">
                                    <div className="form-group">
                                        <label className="form-label">Course Title</label>
                                        <input
                                            type="text"
                                            className="form-input"
                                            value={editForm.title}
                                            onChange={(e) => handleInputChange('title', e.target.value)}
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label className="form-label">Level</label>
                                        <input
                                            type="text"
                                            className="form-input"
                                            value={editForm.level}
                                            onChange={(e) => handleInputChange('level', e.target.value)}
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label className="form-label">Duration</label>
                                        <input
                                            type="text"
                                            className="form-input"
                                            value={editForm.duration}
                                            onChange={(e) => handleInputChange('duration', e.target.value)}
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label className="form-label">Current Price (₹)</label>
                                        <input
                                            type="number"
                                            className="form-input"
                                            value={editForm.price}
                                            onChange={(e) => handleInputChange('price', parseInt(e.target.value))}
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label className="form-label">Original Price (₹)</label>
                                        <input
                                            type="number"
                                            className="form-input"
                                            value={editForm.original_price}
                                            onChange={(e) => handleInputChange('original_price', parseInt(e.target.value))}
                                        />
                                        <small style={{ color: 'var(--color-text-tertiary)' }}>
                                            Discount: {calculateDiscount(editForm.original_price, editForm.price)}%
                                        </small>
                                    </div>

                                    <div className="form-group">
                                        <label className="form-label">Students Enrolled</label>
                                        <input
                                            type="number"
                                            className="form-input"
                                            value={editForm.students}
                                            onChange={(e) => handleInputChange('students', parseInt(e.target.value))}
                                        />
                                    </div>

                                    <div className="form-group full-width">
                                        <label className="form-label">Description</label>
                                        <textarea
                                            className="form-textarea"
                                            rows="3"
                                            value={editForm.description}
                                            onChange={(e) => handleInputChange('description', e.target.value)}
                                        />
                                    </div>

                                    <div className="form-group full-width">
                                        <label className="form-label">Target Audience</label>
                                        <input
                                            type="text"
                                            className="form-input"
                                            value={editForm.target_audience}
                                            onChange={(e) => handleInputChange('target_audience', e.target.value)}
                                        />
                                    </div>
                                </div>
                            </div>
                        ) : (
                            // View Mode
                            <div className="course-view">
                                <div className="course-header">
                                    <div className="course-title-section">
                                        <span className="course-icon" style={{ color: course.color }}>{course.icon}</span>
                                        <div>
                                            <h3>{course.title}</h3>
                                            <span className="course-badge" style={{ background: `${course.color}20`, color: course.color }}>
                                                {course.level}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="course-actions">
                                        <button
                                            onClick={() => handleToggleStatus(course.id)}
                                            className={`status-toggle ${course.status}`}
                                        >
                                            {course.status === 'active' ? '✓ Active' : '✖ Inactive'}
                                        </button>
                                        <button onClick={() => handleEdit(course)} className="btn btn-primary btn-sm">
                                            ✏️ Edit
                                        </button>
                                    </div>
                                </div>

                                <div className="course-details-grid">
                                    <div className="detail-item">
                                        <span className="detail-label">Duration</span>
                                        <span className="detail-value">{course.duration}</span>
                                    </div>
                                    <div className="detail-item">
                                        <span className="detail-label">Students</span>
                                        <span className="detail-value">{course.students}</span>
                                    </div>
                                    <div className="detail-item">
                                        <span className="detail-label">Rating</span>
                                        <span className="detail-value">⭐ {course.rating}/5.0</span>
                                    </div>
                                    <div className="detail-item">
                                        <span className="detail-label">Target</span>
                                        <span className="detail-value">{course.target_audience}</span>
                                    </div>
                                </div>

                                <div className="course-pricing">
                                    <div className="pricing-info">
                                        <div className="current-price">₹{course.price.toLocaleString()}</div>
                                        <div className="original-price">₹{(course.original_price || 0).toLocaleString()}</div>
                                        <div className="discount-badge">{course.discount}% OFF</div>
                                    </div>
                                    <div className="revenue-info">
                                        <span className="revenue-label">Total Revenue:</span>
                                        <span className="revenue-value">₹{(course.price * course.students).toLocaleString()}</span>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}
