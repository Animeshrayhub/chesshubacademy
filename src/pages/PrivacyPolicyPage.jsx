import { Link } from 'react-router-dom';

export default function PrivacyPolicyPage() {
    const updatedOn = 'March 16, 2026';

    return (
        <div style={styles.page}>
            <div style={styles.container}>
                <Link to="/" style={styles.backLink}>&larr; Back to Home</Link>
                <h1 style={styles.title}>Privacy Policy</h1>
                <p style={styles.meta}><strong>Last Updated:</strong> {updatedOn}</p>

                <section style={styles.section}>
                    <h2 style={styles.h2}>1. Information We Collect</h2>
                    <p style={styles.p}>
                        We may collect your name, email address, phone number, and learning-related information when you
                        register, book demos, subscribe to newsletters, or use our training features.
                    </p>
                </section>

                <section style={styles.section}>
                    <h2 style={styles.h2}>2. How We Use Your Information</h2>
                    <p style={styles.p}>
                        We use your information to provide chess classes, manage accounts, schedule sessions, send updates,
                        improve learning experience, and support customer communication.
                    </p>
                </section>

                <section style={styles.section}>
                    <h2 style={styles.h2}>3. Data Storage and Security</h2>
                    <p style={styles.p}>
                        Your data is stored using trusted third-party services and protected with reasonable safeguards.
                        While we follow best practices, no online system can guarantee absolute security.
                    </p>
                </section>

                <section style={styles.section}>
                    <h2 style={styles.h2}>4. Sharing of Information</h2>
                    <p style={styles.p}>
                        We do not sell personal information. We may share limited data with service providers required for
                        app functionality, communication, and analytics.
                    </p>
                </section>

                <section style={styles.section}>
                    <h2 style={styles.h2}>5. Cookies and Analytics</h2>
                    <p style={styles.p}>
                        We may use cookies or similar tools to improve performance, understand usage trends, and optimize
                        website experience.
                    </p>
                </section>

                <section style={styles.section}>
                    <h2 style={styles.h2}>6. Your Rights</h2>
                    <p style={styles.p}>
                        You may request access, correction, or deletion of your personal data by contacting us at
                        clubchess259@gmail.com.
                    </p>
                </section>

                <section style={styles.section}>
                    <h2 style={styles.h2}>7. Children&apos;s Privacy</h2>
                    <p style={styles.p}>
                        For students under 18, account and learning information may be managed with parent/guardian
                        involvement where required.
                    </p>
                </section>

                <section style={styles.section}>
                    <h2 style={styles.h2}>8. Changes to This Policy</h2>
                    <p style={styles.p}>
                        We may update this policy from time to time. Changes will be posted on this page with updated date.
                    </p>
                </section>

                <section style={styles.section}>
                    <h2 style={styles.h2}>9. Contact Us</h2>
                    <p style={styles.p}>
                        For privacy-related questions, email us at <a href="mailto:clubchess259@gmail.com" style={styles.link}>clubchess259@gmail.com</a>.
                    </p>
                </section>
            </div>
        </div>
    );
}

const styles = {
    page: {
        minHeight: '100vh',
        background: '#0b1020',
        color: '#f4f6ff',
        padding: '2rem 1rem 4rem',
    },
    container: {
        maxWidth: '900px',
        margin: '0 auto',
        background: 'rgba(255,255,255,0.03)',
        border: '1px solid rgba(255,255,255,0.1)',
        borderRadius: '14px',
        padding: '1.25rem 1.25rem 2rem',
    },
    backLink: {
        color: '#8db3ff',
        textDecoration: 'none',
        fontWeight: 600,
        display: 'inline-block',
        marginBottom: '1rem',
    },
    title: {
        margin: 0,
        fontSize: 'clamp(1.8rem, 4vw, 2.5rem)',
        lineHeight: 1.2,
    },
    meta: {
        color: '#b8c4e8',
        margin: '0.65rem 0 1.5rem',
    },
    section: {
        marginTop: '1.2rem',
    },
    h2: {
        margin: '0 0 0.45rem',
        fontSize: '1.08rem',
    },
    p: {
        margin: 0,
        color: '#dce4ff',
        lineHeight: 1.7,
    },
    link: {
        color: '#8db3ff',
    },
};
