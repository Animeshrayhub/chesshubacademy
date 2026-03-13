import './DemoBooking.css';

const GOOGLE_FORM_URL = 'https://docs.google.com/forms/d/e/1FAIpQLSfoPt5iZzbmHWwcWbIxhJiq2zj-P1-D5DW7etizDV3QXvijDw/viewform?embedded=true';

export default function DemoBooking() {
    return (
        <section id="booking" className="section booking-section">
            <div className="container">
                <div className="section-header text-center">
                    <h2 className="fade-in">Book Your Free Demo</h2>
                    <p className="section-subtitle fade-in">
                        Experience our world-class coaching firsthand. No commitment required.
                    </p>
                </div>

                <div className="booking-container">
                    <div className="glass-card booking-card" style={{ padding: '2rem' }}>
                        <iframe
                            src={GOOGLE_FORM_URL}
                            width="100%"
                            height="800"
                            frameBorder="0"
                            marginHeight="0"
                            marginWidth="0"
                            title="Book a Free Demo"
                            style={{ borderRadius: '12px', border: 'none' }}
                        >
                            Loading…
                        </iframe>
                    </div>

                    <div className="booking-info">
                        <div className="info-card glass-card">
                            <h3>What to Expect</h3>
                            <ul className="info-list">
                                <li><span className="info-icon">📅</span><span>30-minute personalized session</span></li>
                                <li><span className="info-icon">🎯</span><span>Skill assessment by expert coach</span></li>
                                <li><span className="info-icon">📊</span><span>Customized learning plan</span></li>
                                <li><span className="info-icon">💡</span><span>Q&A with our team</span></li>
                            </ul>
                        </div>
                        <div className="info-card glass-card">
                            <h3>Contact Us</h3>
                            <div className="contact-info">
                                <p><strong>Email:</strong><br />clubchess259@gmail.com</p>
                                <p><strong>Phone:</strong><br />+91 7008665245</p>
                                <p><strong>Hours:</strong><br />Mon-Sat: 9:00 AM - 8:00 PM</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
