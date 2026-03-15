import { Link } from 'react-router-dom';

export default function TermsConditionsPage() {
    const updatedOn = 'March 16, 2026';

    return (
        <div style={styles.page}>
            <div style={styles.container}>
                <Link to="/" style={styles.backLink}>&larr; Back to Home</Link>
                <h1 style={styles.title}>Terms & Conditions</h1>
                <p style={styles.meta}><strong>Last Updated:</strong> {updatedOn}</p>

                <section style={styles.section}>
                    <h2 style={styles.h2}>1. Acceptance of Terms</h2>
                    <p style={styles.p}>
                        By using ChessHub Academy services, website, and learning resources, you agree to these Terms & Conditions.
                    </p>
                </section>

                <section style={styles.section}>
                    <h2 style={styles.h2}>2. Services</h2>
                    <p style={styles.p}>
                        We provide online chess coaching, training content, classes, demos, and related educational services.
                        Service features may be updated, modified, or discontinued from time to time.
                    </p>
                </section>

                <section style={styles.section}>
                    <h2 style={styles.h2}>3. Account Responsibilities</h2>
                    <p style={styles.p}>
                        You are responsible for keeping your login details secure and for all activity under your account.
                        Please provide accurate information during registration and updates.
                    </p>
                </section>

                <section style={styles.section}>
                    <h2 style={styles.h2}>4. Payments and Refunds</h2>
                    <p style={styles.p}>
                        Fees, plans, and refund eligibility are communicated at the time of purchase/enrollment.
                        Any approved refund process is handled according to the plan terms shared with you.
                    </p>
                </section>

                <section style={styles.section}>
                    <h2 style={styles.h2}>5. Acceptable Use</h2>
                    <p style={styles.p}>
                        You agree not to misuse the platform, interfere with classes, attempt unauthorized access,
                        or upload harmful/illegal content.
                    </p>
                </section>

                <section style={styles.section}>
                    <h2 style={styles.h2}>6. Intellectual Property</h2>
                    <p style={styles.p}>
                        Training materials, branding, and platform content are owned by ChessHub Academy or licensed partners.
                        Reproduction or redistribution without permission is prohibited.
                    </p>
                </section>

                <section style={styles.section}>
                    <h2 style={styles.h2}>7. Limitation of Liability</h2>
                    <p style={styles.p}>
                        ChessHub Academy is not liable for indirect, incidental, or consequential damages arising from platform use,
                        to the extent permitted by applicable law.
                    </p>
                </section>

                <section style={styles.section}>
                    <h2 style={styles.h2}>8. Changes to Terms</h2>
                    <p style={styles.p}>
                        We may update these Terms & Conditions periodically. Continued use of the platform after updates
                        means you accept the revised terms.
                    </p>
                </section>

                <section style={styles.section}>
                    <h2 style={styles.h2}>9. Contact</h2>
                    <p style={styles.p}>
                        For legal or policy queries, contact us at <a href="mailto:clubchess259@gmail.com" style={styles.link}>clubchess259@gmail.com</a>.
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
