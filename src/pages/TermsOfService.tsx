import React from 'react';
import { Link } from 'react-router-dom';
import { Header } from '../components/layout/Header';
import { Footer } from '../components/layout/Footer';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';

export const TermsOfService: React.FC = () => {
    const { mode } = useTheme();
    const { t, isRTL } = useLanguage();

    const isDark = mode === 'Dark';

    const styles = {
        page: {
            background: isDark ? '#0f172a' : '#f8fafc',
            minHeight: '100vh',
        },
        container: {
            maxWidth: '800px',
            margin: '0 auto',
            padding: '64px 24px',
        },
        title: {
            fontSize: '2.5rem',
            fontWeight: 800,
            color: isDark ? '#f8fafc' : '#0f172a',
            marginBottom: '32px',
            textAlign: isRTL ? 'right' as const : 'left' as const,
        },
        card: {
            background: isDark ? '#1e293b' : '#ffffff',
            borderRadius: '16px',
            padding: '40px',
            boxShadow: isDark
                ? '0 4px 20px rgba(0,0,0,0.3)'
                : '0 4px 20px rgba(0,0,0,0.05)',
            border: `1px solid ${isDark ? '#334155' : '#e2e8f0'}`,
        },
        section: {
            marginBottom: '32px',
        },
        sectionTitle: {
            fontSize: '1.25rem',
            fontWeight: 600,
            color: isDark ? '#f8fafc' : '#0f172a',
            marginBottom: '12px',
        },
        text: {
            fontSize: '1rem',
            lineHeight: 1.7,
            color: isDark ? '#94a3b8' : '#475569',
        },
        list: {
            marginTop: '12px',
            paddingLeft: isRTL ? '0' : '20px',
            paddingRight: isRTL ? '20px' : '0',
        },
        listItem: {
            fontSize: '1rem',
            lineHeight: 1.7,
            color: isDark ? '#94a3b8' : '#475569',
            marginBottom: '8px',
        },
        link: {
            color: isDark ? '#10b981' : '#0d9488',
            textDecoration: 'none',
        },
        footer: {
            fontSize: '0.875rem',
            color: isDark ? '#64748b' : '#94a3b8',
            marginTop: '32px',
            paddingTop: '24px',
            borderTop: `1px solid ${isDark ? '#334155' : '#e2e8f0'}`,
        },
        backLink: {
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            color: isDark ? '#10b981' : '#0d9488',
            fontWeight: 500,
            textDecoration: 'none',
            marginTop: '32px',
        },
    };

    return (
        <div style={styles.page} dir={isRTL ? 'rtl' : 'ltr'}>
            <Header />
            <main style={styles.container}>
                <h1 style={styles.title}>{t('termsOfServiceTitle')}</h1>

                <div style={styles.card}>
                    <section style={styles.section}>
                        <h2 style={styles.sectionTitle}>1. Acceptance of Terms</h2>
                        <p style={styles.text}>
                            By accessing and using Paynest services, you accept and agree to be bound by the terms
                            and provision of this agreement.
                        </p>
                    </section>

                    <section style={styles.section}>
                        <h2 style={styles.sectionTitle}>2. Use of Service</h2>
                        <p style={styles.text}>
                            You agree to use our service only for lawful purposes. You are prohibited from:
                        </p>
                        <ul style={styles.list}>
                            <li style={styles.listItem}>Violating any applicable laws or regulations</li>
                            <li style={styles.listItem}>Infringing on intellectual property rights</li>
                            <li style={styles.listItem}>Transmitting malicious code or viruses</li>
                            <li style={styles.listItem}>Attempting to gain unauthorized access to our systems</li>
                            <li style={styles.listItem}>Using the service to harm others</li>
                        </ul>
                    </section>

                    <section style={styles.section}>
                        <h2 style={styles.sectionTitle}>3. Account Responsibilities</h2>
                        <p style={styles.text}>
                            You are responsible for maintaining the confidentiality of your account credentials and for
                            all activities that occur under your account. You must notify us immediately of any unauthorized
                            use of your account.
                        </p>
                    </section>

                    <section style={styles.section}>
                        <h2 style={styles.sectionTitle}>4. Subscription and Payments</h2>
                        <p style={styles.text}>
                            Subscription fees are billed in advance on a monthly or annual basis. All fees are non-refundable
                            except as required by law. We reserve the right to change our pricing with 30 days notice.
                        </p>
                    </section>

                    <section style={styles.section}>
                        <h2 style={styles.sectionTitle}>5. Data and Privacy</h2>
                        <p style={styles.text}>
                            Your use of our service is also governed by our{' '}
                            <Link to="/privacy-policy" style={styles.link}>
                                {t('privacyPolicy')}
                            </Link>
                            . We take data security seriously and implement industry-standard measures to protect your information.
                        </p>
                    </section>

                    <section style={styles.section}>
                        <h2 style={styles.sectionTitle}>6. Termination</h2>
                        <p style={styles.text}>
                            We may terminate or suspend your account at any time for violations of these terms. Upon termination,
                            your right to use the service will immediately cease.
                        </p>
                    </section>

                    <section style={styles.section}>
                        <h2 style={styles.sectionTitle}>7. Limitation of Liability</h2>
                        <p style={styles.text}>
                            Paynest shall not be liable for any indirect, incidental, special, consequential, or punitive
                            damages resulting from your use or inability to use the service.
                        </p>
                    </section>

                    <section style={styles.section}>
                        <h2 style={styles.sectionTitle}>8. Changes to Terms</h2>
                        <p style={styles.text}>
                            We reserve the right to modify these terms at any time. We will notify users of any material
                            changes via email or through the service.
                        </p>
                    </section>

                    <section style={styles.section}>
                        <h2 style={styles.sectionTitle}>9. {t('contactUs')}</h2>
                        <p style={styles.text}>
                            For questions about these Terms of Service, please contact us at{' '}
                            <a href="mailto:legal@financeos.io" style={styles.link}>
                                legal@financeos.io
                            </a>
                        </p>
                    </section>

                    <p style={styles.footer}>
                        {t('lastUpdated')}: January 30, 2026
                    </p>
                </div>

                <div style={{ textAlign: 'center' }}>
                    <Link to="/" style={styles.backLink}>
                        {isRTL ? '→' : '←'} {t('back')} {t('home')}
                    </Link>
                </div>
            </main>
            <Footer />
        </div>
    );
};
