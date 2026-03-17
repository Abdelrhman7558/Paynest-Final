import React from 'react';
import { Link } from 'react-router-dom';
import { Header } from '../components/layout/Header';
import { Footer } from '../components/layout/Footer';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';

export const PrivacyPolicy: React.FC = () => {
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
                <h1 style={styles.title}>{t('privacyPolicyTitle')}</h1>

                <div style={styles.card}>
                    <section style={styles.section}>
                        <h2 style={styles.sectionTitle}>1. {t('dataCollection')}</h2>
                        <p style={styles.text}>
                            We collect information that you provide directly to us, including your name, email address,
                            phone number, and business information when you create an account or use our services.
                        </p>
                    </section>

                    <section style={styles.section}>
                        <h2 style={styles.sectionTitle}>2. {t('dataUsage')}</h2>
                        <p style={styles.text}>
                            We use the information we collect to:
                        </p>
                        <ul style={styles.list}>
                            <li style={styles.listItem}>Provide, maintain, and improve our services</li>
                            <li style={styles.listItem}>Process transactions and send related information</li>
                            <li style={styles.listItem}>Send technical notices and support messages</li>
                            <li style={styles.listItem}>Respond to your comments and questions</li>
                            <li style={styles.listItem}>Monitor and analyze trends and usage</li>
                        </ul>
                    </section>

                    <section style={styles.section}>
                        <h2 style={styles.sectionTitle}>3. {t('storageAndSecurity')}</h2>
                        <p style={styles.text}>
                            We implement appropriate technical and organizational measures to protect your personal
                            information against unauthorized access, alteration, disclosure, or destruction.
                        </p>
                    </section>

                    <section style={styles.section}>
                        <h2 style={styles.sectionTitle}>4. {t('thirdPartyIntegrations')}</h2>
                        <p style={styles.text}>
                            When you connect third-party services (such as Shopify, WooCommerce, etc.) to our platform,
                            we access and store only the data necessary to provide our services. We do not sell your data
                            to third parties.
                        </p>
                    </section>

                    <section style={styles.section}>
                        <h2 style={styles.sectionTitle}>5. {t('yourRights')}</h2>
                        <p style={styles.text}>
                            You have the right to:
                        </p>
                        <ul style={styles.list}>
                            <li style={styles.listItem}>Access your personal information</li>
                            <li style={styles.listItem}>Correct inaccurate data</li>
                            <li style={styles.listItem}>Request deletion of your data</li>
                            <li style={styles.listItem}>Object to processing of your data</li>
                            <li style={styles.listItem}>Export your data</li>
                        </ul>
                    </section>

                    <section style={styles.section}>
                        <h2 style={styles.sectionTitle}>6. {t('cookies')}</h2>
                        <p style={styles.text}>
                            We use cookies and similar tracking technologies to collect and track information
                            about your use of our services. You can control cookies through your browser settings.
                        </p>
                    </section>

                    <section style={styles.section}>
                        <h2 style={styles.sectionTitle}>7. {t('contactUs')}</h2>
                        <p style={styles.text}>
                            If you have any questions about this Privacy Policy, please contact us at{' '}
                            <a
                                href="mailto:privacy@financeos.io"
                                style={{ color: isDark ? '#10b981' : '#0d9488' }}
                            >
                                privacy@financeos.io
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
